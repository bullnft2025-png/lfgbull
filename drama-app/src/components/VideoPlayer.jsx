import React, { useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack } from 'lucide-react';
import './VideoPlayer.css';

const VideoPlayer = ({ drama, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(1);

  if (!drama) return null;

  const episodes = Array.from({ length: Math.min(drama.episodes, 20) }, (_, i) => i + 1);

  return (
    <div className="video-player-modal">
      <div className="video-player-container">
        <button className="close-button" onClick={onClose}>
          <X size={28} />
        </button>

        <div className="video-wrapper">
          <div className="video-placeholder">
            <img src={drama.thumbnail} alt={drama.title} />
            <div className="video-overlay">
              <div className="video-info">
                <h2>{drama.title}</h2>
                <p>第 {currentEpisode} 集 / 共 {drama.episodes} 集</p>
              </div>
              <button
                className="video-play-btn"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause size={48} /> : <Play size={48} fill="white" />}
              </button>
            </div>
          </div>

          <div className="video-controls">
            <div className="controls-main">
              <button onClick={() => setCurrentEpisode(Math.max(1, currentEpisode - 1))}>
                <SkipBack size={20} />
              </button>
              <button
                className="control-play"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} fill="white" />}
              </button>
              <button onClick={() => setCurrentEpisode(Math.min(drama.episodes, currentEpisode + 1))}>
                <SkipForward size={20} />
              </button>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '30%' }}></div>
              </div>
              <span className="time">00:00 / 05:30</span>
              <button onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <button>
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="episode-list">
          <h3>選集播放</h3>
          <div className="episodes-grid">
            {episodes.map((ep) => (
              <button
                key={ep}
                className={`episode-item ${ep === currentEpisode ? 'active' : ''}`}
                onClick={() => setCurrentEpisode(ep)}
              >
                第{ep}集
              </button>
            ))}
            {drama.episodes > 20 && (
              <button className="episode-item more">更多...</button>
            )}
          </div>
        </div>

        <div className="drama-details">
          <div className="detail-header">
            <h2>{drama.title}</h2>
            <div className="detail-stats">
              <span>⭐ {drama.rating}分</span>
              <span>👁 {drama.views}</span>
              <span>📺 {drama.episodes}集</span>
            </div>
          </div>
          <div className="detail-tags">
            {drama.tags.map((tag, index) => (
              <span key={index} className="detail-tag">{tag}</span>
            ))}
          </div>
          <p className="detail-description">{drama.description}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
