// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts@5.0.2/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts@5.0.2/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts@5.0.2/utils/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/contracts@5.0.2/utils/Strings.sol";

/// @title BULL
/// @notice 0.0004 ETH per pull. 10% mints a unique token; misses send ETH to treasury, no refund. Max 100 per tx.
/// @dev Randomness is block.prevrandao + msg.sender entropy. Fine for a $1 pull, not VRF-grade.
contract BULL is ERC721, Ownable, ReentrancyGuard {
    uint256 public constant MAX_SUPPLY = 10_000;
    uint256 public constant MAX_QTY = 100;
    uint16 public constant WIN_BPS = 1_000; // 10%

    address payable public treasury;
    uint256 public price = 0.0004 ether;
    uint256 public nextId = 1;
    uint256 public pulls;
    bool public paused;
    string private _baseTokenURI;

    event TreasurySet(address indexed treasury);
    event PriceSet(uint256 price);
    event Pull(address indexed player, uint256 qty, uint256 paid, uint256 hits);

    constructor(address payable treasury_) ERC721("BULL", "BULL") Ownable(msg.sender) {
        require(treasury_ != address(0), "treasury=0");
        treasury = treasury_;
        emit TreasurySet(treasury_);
    }

    function minted() public view returns (uint256) {
        return nextId - 1;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string.concat(_baseTokenURI, Strings.toString(tokenId), ".json");
    }

    function pull(uint256 qty) external payable nonReentrant {
        require(!paused, "paused");
        require(qty >= 1 && qty <= MAX_QTY, "qty");
        require(minted() < MAX_SUPPLY, "sold out");
        require(msg.value == qty * price, "payment");

        uint256 hits;
        for (uint256 i = 0; i < qty; i++) {
            pulls += 1;
            if (minted() >= MAX_SUPPLY) break;
            if (_roll(i)) {
                uint256 id = nextId;
                nextId += 1;
                hits += 1;
                _safeMint(msg.sender, id);
            }
        }

        emit Pull(msg.sender, qty, msg.value, hits);
    }

    function withdraw() external {
        require(msg.sender == owner() || msg.sender == treasury, "not allowed");
        uint256 amount = address(this).balance;
        require(amount > 0, "empty");
        (bool ok, ) = treasury.call{value: amount}("");
        require(ok, "withdraw failed");
    }

    function setTreasury(address payable next) external onlyOwner {
        require(next != address(0), "treasury=0");
        treasury = next;
        emit TreasurySet(next);
    }

    function setPrice(uint256 next) external onlyOwner {
        require(next > 0, "price=0");
        price = next;
        emit PriceSet(next);
    }

    function setBaseURI(string calldata uri) external onlyOwner {
        _baseTokenURI = uri;
    }

    function setPaused(bool next) external onlyOwner {
        paused = next;
    }

    function _roll(uint256 salt) internal view returns (bool) {
        uint256 draw = uint256(
            keccak256(
                abi.encodePacked(block.prevrandao, block.number, msg.sender, pulls, salt, msg.value)
            )
        );
        return draw % 10_000 < WIN_BPS;
    }
}
