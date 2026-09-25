import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack } from 'lucide-react';
import './VideoPlayer.css';

const VideoPlayer = ({ drama, onClose, onPaywallTrigger, isMember }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [watchProgress, setWatchProgress] = useState(0);
  const FREE_EPISODE_LIMIT = 8;

  useEffect(() => {
    // 檢查是否需要觸發付費牆
    if (currentEpisode > FREE_EPISODE_LIMIT && !isMember) {
      // 模擬播放到結束
      const timer = setTimeout(() => {
        setIsPlaying(false);
        onPaywallTrigger();
      }, 3000); // 3秒後觸發付費牆（模擬影片播放結束）
      
      return () => clearTimeout(timer);
    }
  }, [currentEpisode, isMember, onPaywallTrigger]);

  if (!drama) return null;

  const episodes = Array.from({ length: Math.min(drama.episodes, 20) }, (_, i) => i + 1);
  
  const handleEpisodeChange = (episodeNumber) => {
    if (episodeNumber > FREE_EPISODE_LIMIT && !isMember) {
      onPaywallTrigger();
      return;
    }
    setCurrentEpisode(episodeNumber);
    setWatchProgress(0);
  };

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
                {currentEpisode > FREE_EPISODE_LIMIT && !isMember && (
                  <div className="locked-episode-notice">
                    🔒 此集需要會員才能觀看
                  </div>
                )}
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
            <button onClick={() => handleEpisodeChange(Math.max(1, currentEpisode - 1))}>
              <SkipBack size={20} />
            </button>
            <button
              className="control-play"
              onClick={() => {
                if (currentEpisode > FREE_EPISODE_LIMIT && !isMember) {
                  onPaywallTrigger();
                } else {
                  setIsPlaying(!isPlaying);
                }
              }}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} fill="white" />}
            </button>
            <button onClick={() => handleEpisodeChange(Math.min(drama.episodes, currentEpisode + 1))}>
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
                className={`episode-item ${ep === currentEpisode ? 'active' : ''} ${ep > FREE_EPISODE_LIMIT && !isMember ? 'locked' : ''}`}
                onClick={() => handleEpisodeChange(ep)}
              >
                {ep > FREE_EPISODE_LIMIT && !isMember ? '🔒 ' : ''}第{ep}集
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
