import React from 'react';
import { Play, Star, Eye, Clock } from 'lucide-react';
import './Hero.css';

const Hero = ({ drama, onPlay }) => {
  return (
    <div className="hero">
      <div className="hero-background">
        <img src={drama.thumbnail} alt={drama.title} />
        <div className="hero-gradient"></div>
      </div>
      
      <div className="hero-content">
        <div className="hero-badge">本週最熱</div>
        <h1 className="hero-title animate-fade-in">{drama.title}</h1>
        <p className="hero-subtitle animate-fade-in">{drama.titleEn}</p>
        
        <div className="hero-stats animate-fade-in">
          <div className="stat-item">
            <Star size={18} fill="#ffd700" color="#ffd700" />
            <span>{drama.rating}分</span>
          </div>
          <div className="stat-item">
            <Eye size={18} />
            <span>{drama.views}次觀看</span>
          </div>
          <div className="stat-item">
            <Clock size={18} />
            <span>{drama.episodes}集</span>
          </div>
        </div>

        <p className="hero-description animate-fade-in">{drama.description}</p>

        <div className="hero-tags animate-fade-in">
          {drama.tags.map((tag, index) => (
            <span key={index} className="hero-tag">{tag}</span>
          ))}
        </div>

        <button className="hero-play-btn animate-fade-in" onClick={() => onPlay(drama)}>
          <Play size={24} fill="white" />
          <span>立即播放</span>
        </button>
      </div>
    </div>
  );
};

export default Hero;
