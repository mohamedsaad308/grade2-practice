import React, { useState, useEffect, useRef } from 'react';
import { AvatarIcon } from '../player/avatars.jsx';

/**
 * Slim Practice Header (max ~56px) for mobile-first gameplay:
 * - Avatar + player name
 * - Stars counter
 * - Settings menu button (toggles popup for Sound, Voice, Parents, Change Player)
 * - Exit button
 */
export default function PracticeHeader({
  player,
  settings,
  onToggleSound,
  onToggleSpokenPraise,
  onChangePlayer,
  onNavigateParent,
  onExit,
  subjectTitle = 'Topics'
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);

  const soundOn = settings?.soundEnabled !== false;
  const spokenOn = settings?.spokenPraiseEnabled !== false;

  return (
    <header className="practice-slim-header" role="banner" aria-label="Practice navigation header">
      <div className="practice-slim-inner">
        {/* Left: Player Profile */}
        <div className="practice-slim-player">
          <AvatarIcon avatarId={player?.avatar} size={28} />
          <span className="practice-slim-name" title={player?.name}>
            {player?.name || 'Friend'}
          </span>
        </div>

        {/* Center: Star counter */}
        <div className="practice-slim-stars" title="Total Stars" aria-label={`Stars: ${player?.stars || 0}`}>
          <span className="star-icon">⭐</span>
          <span className="practice-slim-star-num">{player?.stars || 0}</span>
        </div>

        {/* Right: Menu + Exit */}
        <div className="practice-slim-actions" ref={menuRef}>
          {/* Settings Menu Button */}
          <button
            type="button"
            className={`practice-menu-btn ${isMenuOpen ? 'menu-btn-active' : ''}`}
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-expanded={isMenuOpen}
            aria-label="Settings and options menu"
            title="Options (Sound, Voice, Switch Player, Parents)"
          >
            <span className="menu-icon-bars">⚙️</span>
          </button>

          {/* Exit Button */}
          <button
            type="button"
            className="practice-exit-btn"
            onClick={onExit}
            aria-label={`Exit to ${subjectTitle}`}
            title={`Exit back to ${subjectTitle}`}
          >
            ✕ Exit
          </button>

          {/* Dropdown Menu Sheet */}
          {isMenuOpen && (
            <div className="practice-dropdown-menu" role="dialog" aria-label="Practice settings menu">
              <div className="dropdown-menu-header">
                <span className="dropdown-title">Quick Settings</span>
                <button
                  type="button"
                  className="dropdown-close-btn"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              <div className="dropdown-menu-items">
                {/* Sound Toggle */}
                <button
                  type="button"
                  className={`dropdown-item-btn ${soundOn ? 'item-active' : 'item-muted'}`}
                  onClick={() => {
                    onToggleSound();
                  }}
                  aria-label={soundOn ? 'Sound effects on' : 'Sound effects off'}
                >
                  <span className="dropdown-item-icon">{soundOn ? '🔊' : '🔇'}</span>
                  <div className="dropdown-item-text">
                    <span className="dropdown-item-label">Sound Effects</span>
                    <span className="dropdown-item-status">{soundOn ? 'On' : 'Muted'}</span>
                  </div>
                </button>

                {/* Spoken Voice Praise Toggle */}
                <button
                  type="button"
                  className={`dropdown-item-btn ${spokenOn ? 'item-active' : 'item-muted'}`}
                  onClick={() => {
                    onToggleSpokenPraise();
                  }}
                  aria-label={spokenOn ? 'Voice praise on' : 'Voice praise off'}
                >
                  <span className="dropdown-item-icon">{spokenOn ? '🗣️' : '💬'}</span>
                  <div className="dropdown-item-text">
                    <span className="dropdown-item-label">Voice Praise</span>
                    <span className="dropdown-item-status">{spokenOn ? 'On' : 'Off'}</span>
                  </div>
                </button>

                {/* Change Player */}
                <button
                  type="button"
                  className="dropdown-item-btn"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onChangePlayer();
                  }}
                >
                  <span className="dropdown-item-icon">👤</span>
                  <div className="dropdown-item-text">
                    <span className="dropdown-item-label">Change Player</span>
                    <span className="dropdown-item-status">{player?.name}</span>
                  </div>
                </button>

                {/* Parent Dashboard */}
                <button
                  type="button"
                  className="dropdown-item-btn parent-link-item"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onNavigateParent();
                  }}
                >
                  <span className="dropdown-item-icon">🔒</span>
                  <div className="dropdown-item-text">
                    <span className="dropdown-item-label">Parent Dashboard</span>
                    <span className="dropdown-item-status">View progress</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
