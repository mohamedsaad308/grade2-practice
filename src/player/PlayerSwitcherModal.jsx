import React from 'react';
import { getPlayers, switchPlayer } from './playerStorage.js';
import { AvatarIcon } from './avatars.jsx';
import { playPop } from '../utils/audio.js';

export default function PlayerSwitcherModal({
  currentPlayer,
  onPlayerSelected,
  onAddNewPlayer,
  onClose
}) {
  const players = getPlayers();

  const handleSelect = (playerId) => {
    playPop(true);
    const selected = switchPlayer(playerId);
    onPlayerSelected(selected);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog player-switcher-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Who is practicing?</h3>
          <button type="button" className="modal-close-x" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="player-list-grid">
          {players.map((p) => {
            const isCurrent = p.id === currentPlayer?.id;
            return (
              <button
                key={p.id}
                type="button"
                className={`player-select-item ${isCurrent ? 'active-player-card' : ''}`}
                onClick={() => handleSelect(p.id)}
              >
                <AvatarIcon avatarId={p.avatar} size={52} />
                <div className="player-meta">
                  <div className="player-name">{p.name}</div>
                  <div className="player-stars">⭐ {p.stars || 0} stars</div>
                </div>
                {isCurrent && <span className="active-badge">Playing</span>}
              </button>
            );
          })}
        </div>

        <div className="modal-footer-actions">
          <button
            type="button"
            className="add-new-player-btn"
            onClick={() => {
              playPop(true);
              onAddNewPlayer();
            }}
          >
            ➕ Add New Player
          </button>
        </div>
      </div>
    </div>
  );
}
