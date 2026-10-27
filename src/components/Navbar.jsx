import React from 'react';
import { AvatarIcon } from '../player/avatars.jsx';

export default function Navbar({
  player,
  settings,
  onToggleSound,
  onToggleSpokenPraise,
  onChangePlayer,
  onNavigateHome,
  onNavigateParent,
  currentRoute
}) {
  return (
    <header className="app-navbar">
      <div className="navbar-container">
        {/* Brand / Home link */}
        <button
          type="button"
          className="brand-logo-btn"
          onClick={onNavigateHome}
          aria-label="Go to Grade 2 Stars home"
        >
          <span className="brand-logo-icon">⭐</span>
          <span className="brand-title">Grade 2 Stars</span>
        </button>

        {/* Player Badge */}
        {player && (
          <div className="player-badge-container">
            <button
              type="button"
              className="player-profile-pill"
              onClick={onChangePlayer}
              title="Click to switch or add player"
            >
              <AvatarIcon avatarId={player.avatar} size={36} />
              <div className="player-pill-info">
                <span className="player-pill-greeting">Hi, {player.name}!</span>
                <span className="player-pill-switch">Change</span>
              </div>
            </button>

            <div className="star-counter-pill" title="Total Stars Earned">
              <span className="star-icon">⭐</span>
              <span className="star-count-number">{player.stars || 0}</span>
            </div>
          </div>
        )}

        {/* Action Controls: Sound, Spoken Voice, Parents */}
        <div className="navbar-controls">
          <button
            type="button"
            className={`nav-icon-btn ${settings?.soundEnabled ? 'control-active' : 'control-muted'}`}
            onClick={onToggleSound}
            title={settings?.soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            aria-label={settings?.soundEnabled ? 'Sound effects on' : 'Sound effects off'}
          >
            {settings?.soundEnabled ? '🔊 Sound' : '🔇 Muted'}
          </button>

          <button
            type="button"
            className={`nav-icon-btn ${settings?.spokenPraiseEnabled ? 'control-active' : 'control-muted'}`}
            onClick={onToggleSpokenPraise}
            title={settings?.spokenPraiseEnabled ? 'Turn off voice praise' : 'Turn on voice praise'}
            aria-label={settings?.spokenPraiseEnabled ? 'Voice praise on' : 'Voice praise off'}
          >
            {settings?.spokenPraiseEnabled ? '🗣️ Voice: On' : '💬 Voice: Off'}
          </button>

          <button
            type="button"
            className={`nav-parent-btn ${currentRoute === 'parent' ? 'parent-active' : ''}`}
            onClick={onNavigateParent}
            aria-label="Parent Dashboard"
          >
            🔒 Parents
          </button>
        </div>
      </div>
    </header>
  );
}
