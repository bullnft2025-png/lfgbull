import React, { useState } from 'react';
import { Play, Home, Flame, Heart, Clock, Search, Menu, X } from 'lucide-react';
import './Header.css';

const Header = ({ onSearch }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { icon: Home, label: '首頁', id: 'home' },
    { icon: Flame, label: '熱門', id: 'popular' },
    { icon: Heart, label: '收藏', id: 'favorites' },
    { icon: Clock, label: '觀看記錄', id: 'history' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <div className="logo-icon">
            <Play size={24} fill="white" />
          </div>
          <span className="logo-text">紅果短劇</span>
          <span className="logo-subtitle">Red Fruit</span>
        </div>

        <nav className={`header-nav ${isMenuOpen ? 'active' : ''}`}>
          {navItems.map((item) => (
            <a key={item.id} href={`#${item.id}`} className="nav-item">
              <item.icon size={20} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <form className="header-search" onSubmit={handleSearch}>
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="搜尋短劇..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </form>

        <button
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
