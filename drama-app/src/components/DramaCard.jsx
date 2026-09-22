import React from 'react';
import { Play, Star, Eye } from 'lucide-react';
import './DramaCard.css';

const DramaCard = ({ drama, onClick }) => {
  return (
    <div className="drama-card" onClick={() => onClick(drama)}>
      <div className="drama-card-image">
        <img src={drama.thumbnail} alt={drama.title} loading="lazy" />
        <div className="drama-card-overlay">
          <div className="play-button">
            <Play size={32} fill="white" />
          </div>
        </div>
        <div className="drama-card-info-overlay">
          <div className="drama-rating">
            <Star size={14} fill="#ffd700" color="#ffd700" />
            <span>{drama.rating}</span>
          </div>
          <div className="drama-views">
            <Eye size={14} />
            <span>{drama.views}</span>
          </div>
        </div>
      </div>
      <div className="drama-card-content">
        <h3 className="drama-title">{drama.title}</h3>
        <p className="drama-episodes">{drama.episodes}集</p>
        <div className="drama-tags">
          {drama.tags.map((tag, index) => (
            <span key={index} className="drama-tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DramaCard;
