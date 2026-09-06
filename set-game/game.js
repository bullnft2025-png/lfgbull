// Set Game Implementation

class SetGame {
    constructor() {
        this.counts = [1, 2, 3];
        this.shapes = ['diamond', 'oval', 'squiggle'];
        this.colors = ['red', 'green', 'purple'];
        this.shadings = ['solid', 'striped', 'empty'];
        this.shapeSymbols = {
            'diamond': '◆',
            'oval': '●',
            'squiggle': '~'
        };
        
        this.deck = [];
        this.board = [];
        this.selectedCards = [];
        this.score = 0;
        this.setsFound = 0;
        
        this.init();
    }
    
    init() {
        this.createDeck();
        this.shuffleDeck();
        this.dealInitialCards();
        this.updateUI();
        this.attachEventListeners();
    }
    
    createDeck() {
        this.deck = [];
        for (let count of this.counts) {
            for (let shape of this.shapes) {
                for (let color of this.colors) {
                    for (let shading of this.shadings) {
                        this.deck.push({ count, shape, color, shading });
                    }
                }
            }
        }
    }
    
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    dealInitialCards() {
        this.board = [];
        for (let i = 0; i < 12; i++) {
            if (this.deck.length > 0) {
                this.board.push(this.deck.pop());
            }
        }
    }
    
    addCards(count = 3) {
        for (let i = 0; i < count; i++) {
            if (this.deck.length > 0) {
                this.board.push(this.deck.pop());
            }
        }
        this.renderBoard();
        this.updateUI();
    }
    
    isValidSet(cards) {
        if (cards.length !== 3) return false;
        
        const attributes = ['count', 'shape', 'color', 'shading'];
        
        for (let attr of attributes) {
            const values = cards.map(card => card[attr]);
            const allSame = values.every(v => v === values[0]);
            const allDifferent = new Set(values).size === 3;
            
            if (!allSame && !allDifferent) {
                return false;
            }
        }
        
        return true;
    }
    
    findAllSets() {
        const sets = [];
        for (let i = 0; i < this.board.length; i++) {
            for (let j = i + 1; j < this.board.length; j++) {
                for (let k = j + 1; k < this.board.length; k++) {
                    if (this.isValidSet([this.board[i], this.board[j], this.board[k]])) {
                        sets.push([i, j, k]);
                    }
                }
            }
        }
        return sets;
    }
    
    selectCard(index) {
        if (this.selectedCards.includes(index)) {
            this.selectedCards = this.selectedCards.filter(i => i !== index);
        } else {
            this.selectedCards.push(index);
        }
        
        if (this.selectedCards.length === 3) {
            this.checkSet();
        } else {
            this.renderBoard();
        }
    }
    
    checkSet() {
        const cards = this.selectedCards.map(i => this.board[i]);
        const isValid = this.isValidSet(cards);
        
        if (isValid) {
            this.handleCorrectSet();
        } else {
            this.handleIncorrectSet();
        }
    }
    
    handleCorrectSet() {
        this.showMessage('🎉 太好了！找到一個 Set！', 'success');
        this.score += 10;
        this.setsFound++;
        
        const cardElements = document.querySelectorAll('.card');
        this.selectedCards.forEach(index => {
            cardElements[index].classList.add('correct');
        });
        
        setTimeout(() => {
            this.selectedCards.sort((a, b) => b - a).forEach(index => {
                this.board.splice(index, 1);
                if (this.deck.length > 0 && this.board.length < 12) {
                    this.board.splice(index, 0, this.deck.pop());
                }
            });
            
            this.selectedCards = [];
            this.renderBoard();
            this.updateUI();
            this.checkGameOver();
        }, 1000);
    }
    
    handleIncorrectSet() {
        this.showMessage('❌ 這三張卡片不構成 Set，再試試看！', 'error');
        this.score = Math.max(0, this.score - 2);
        
        const cardElements = document.querySelectorAll('.card');
        this.selectedCards.forEach(index => {
            cardElements[index].classList.add('incorrect');
        });
        
        setTimeout(() => {
            this.selectedCards = [];
            this.renderBoard();
            this.updateUI();
        }, 600);
    }
    
    showHint() {
        const sets = this.findAllSets();
        
        if (sets.length === 0) {
            this.showMessage('💡 桌面上沒有可用的 Set！試試加入更多卡片。', 'hint');
        } else {
            const hint = sets[0];
            const hintCard = hint[Math.floor(Math.random() * 3)];
            
            const cardElements = document.querySelectorAll('.card');
            cardElements[hintCard].style.animation = 'correctPulse 0.6s ease';
            
            this.showMessage('💡 注意高亮的卡片，它是某個 Set 的一部分！', 'hint');
            this.score = Math.max(0, this.score - 5);
            this.updateUI();
            
            setTimeout(() => {
                cardElements[hintCard].style.animation = '';
            }, 600);
        }
    }
    
    checkGameOver() {
        if (this.board.length === 0 && this.deck.length === 0) {
            this.showGameOver();
            return;
        }
        
        const sets = this.findAllSets();
        if (sets.length === 0 && this.deck.length === 0) {
            this.showGameOver();
        }
    }
    
    showGameOver() {
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalSets').textContent = this.setsFound;
        document.getElementById('gameOverModal').classList.remove('hidden');
    }
    
    showMessage(text, type = '') {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.className = 'message ' + type;
        
        if (text) {
            setTimeout(() => {
                messageEl.textContent = '';
                messageEl.className = 'message';
            }, 3000);
        }
    }
    
    renderBoard() {
        const boardEl = document.getElementById('board');
        boardEl.innerHTML = '';
        
        this.board.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            if (this.selectedCards.includes(index)) {
                cardEl.classList.add('selected');
            }
            
            for (let i = 0; i < card.count; i++) {
                const shapeEl = document.createElement('div');
                shapeEl.className = `shape ${card.shading} color-${card.color}`;
                shapeEl.textContent = this.shapeSymbols[card.shape];
                shapeEl.setAttribute('data-symbol', this.shapeSymbols[card.shape]);
                cardEl.appendChild(shapeEl);
            }
            
            cardEl.addEventListener('click', () => this.selectCard(index));
            boardEl.appendChild(cardEl);
        });
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('remaining').textContent = this.deck.length;
        document.getElementById('setsFound').textContent = this.setsFound;
        
        const addCardsBtn = document.getElementById('addCardsBtn');
        addCardsBtn.disabled = this.deck.length === 0;
    }
    
    attachEventListeners() {
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.score = 0;
            this.setsFound = 0;
            this.selectedCards = [];
            this.createDeck();
            this.shuffleDeck();
            this.dealInitialCards();
            this.renderBoard();
            this.updateUI();
            this.showMessage('');
        });
        
        document.getElementById('hintBtn').addEventListener('click', () => {
            this.showHint();
        });
        
        document.getElementById('addCardsBtn').addEventListener('click', () => {
            if (this.deck.length >= 3) {
                this.addCards(3);
                this.showMessage('已加入三張新卡片！', 'success');
            } else if (this.deck.length > 0) {
                this.addCards(this.deck.length);
                this.showMessage(`只剩 ${this.deck.length} 張卡片，已全部加入！`, 'success');
            }
        });
        
        document.getElementById('rulesBtn').addEventListener('click', () => {
            document.getElementById('modal').classList.remove('hidden');
        });
        
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('modal').classList.add('hidden');
        });
        
        document.getElementById('newGameFromModal').addEventListener('click', () => {
            document.getElementById('gameOverModal').classList.add('hidden');
            document.getElementById('newGameBtn').click();
        });
        
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('modal');
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SetGame();
});
