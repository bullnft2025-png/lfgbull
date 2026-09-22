import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import DramaCard from './components/DramaCard';
import VideoPlayer from './components/VideoPlayer';
import { dramaData } from './data/dramaData';
import { ChevronRight } from 'lucide-react';
import './App.css';

function App() {
  const [selectedDrama, setSelectedDrama] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handlePlayDrama = (drama) => {
    setSelectedDrama(drama);
  };

  const handleClosePlayer = () => {
    setSelectedDrama(null);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    console.log('Searching for:', query);
  };

  return (
    <div className="app">
      <Header onSearch={handleSearch} />
      
      <main className="main-content">
        <Hero drama={dramaData.featured} onPlay={handlePlayDrama} />

        {dramaData.categories.map((category) => (
          <section key={category.id} className="category-section" id={category.id}>
            <div className="category-header">
              <div>
                <h2 className="category-title">{category.name}</h2>
                <p className="category-subtitle">{category.nameEn}</p>
              </div>
              <button className="view-all-btn">
                查看全部
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="drama-grid">
              {category.dramas.map((drama) => (
                <DramaCard
                  key={drama.id}
                  drama={drama}
                  onClick={handlePlayDrama}
                />
              ))}
            </div>
          </section>
        ))}

        <footer className="footer">
          <div className="footer-content">
            <div className="footer-logo">
              <h3>紅果短劇</h3>
              <p>精彩短劇，隨時隨地觀看</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>關於我們</h4>
                <a href="#about">關於紅果</a>
                <a href="#contact">聯繫我們</a>
                <a href="#careers">加入我們</a>
              </div>
              <div className="footer-column">
                <h4>幫助中心</h4>
                <a href="#faq">常見問題</a>
                <a href="#feedback">意見反饋</a>
                <a href="#support">技術支持</a>
              </div>
              <div className="footer-column">
                <h4>法律信息</h4>
                <a href="#terms">服務條款</a>
                <a href="#privacy">隱私政策</a>
                <a href="#copyright">版權聲明</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 紅果短劇 Red Fruit Drama. All rights reserved.</p>
          </div>
        </footer>
      </main>

      {selectedDrama && (
        <VideoPlayer drama={selectedDrama} onClose={handleClosePlayer} />
      )}
    </div>
  );
}

export default App;
