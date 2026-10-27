import React, { useState } from 'react';
import {
  getPlayers,
  renamePlayer,
  resetPlayerProgress,
  deletePlayer,
  clearAllStorage
} from '../player/playerStorage.js';
import { AvatarIcon } from '../player/avatars.jsx';
import { subjects } from '../subjects/index.js';

export default function ParentDashboard({ onBackToPractice, onPlayerStateChanged }) {
  const [players, setPlayers] = useState(getPlayers());
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [confirmModal, setConfirmModal] = useState(null); // { action, playerId, title, message }

  const refreshPlayers = () => {
    const list = getPlayers();
    setPlayers(list);
    if (onPlayerStateChanged) onPlayerStateChanged();
  };

  const handleStartRename = (player) => {
    setEditingPlayerId(player.id);
    setEditNameValue(player.name);
  };

  const handleSaveRename = (playerId) => {
    if (!editNameValue.trim()) return;
    try {
      renamePlayer(playerId, editNameValue.trim());
      setEditingPlayerId(null);
      refreshPlayers();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleConfirmAction = () => {
    if (!confirmModal) return;
    const { action, playerId } = confirmModal;

    if (action === 'reset_player') {
      resetPlayerProgress(playerId);
      refreshPlayers();
    } else if (action === 'delete_player') {
      deletePlayer(playerId);
      refreshPlayers();
    } else if (action === 'clear_all') {
      clearAllStorage();
      refreshPlayers();
    }
    setConfirmModal(null);
  };

  // Find all topic titles from subjects
  const topicTitleMap = {};
  subjects.forEach(s => {
    s.topics.forEach(t => {
      topicTitleMap[t.id] = { title: t.title, icon: t.icon, subject: s.title };
    });
  });

  return (
    <div className="parent-dashboard-container">
      {/* Header */}
      <div className="parent-header-bar">
        <div className="parent-header-left">
          <button
            type="button"
            className="back-to-practice-btn"
            onClick={onBackToPractice}
          >
            ⬅ Back to Practice
          </button>
          <h1>Parent Dashboard & Progress</h1>
        </div>
        <div className="parent-header-right">
          <button
            type="button"
            className="danger-clear-all-btn"
            onClick={() => setConfirmModal({
              action: 'clear_all',
              title: 'Reset All Data on This Device?',
              message: 'This will delete all players, stars, and practice history stored in this browser.'
            })}
          >
            Clear All Data
          </button>
        </div>
      </div>

      <p className="parent-lead-text">
        All progress is saved strictly inside this browser (localStorage). No data leaves this device.
      </p>

      {/* Players List */}
      <div className="parent-players-list">
        {players.length === 0 ? (
          <div className="no-players-box">
            <p>No player profiles found. Head back to create your first learner!</p>
          </div>
        ) : (
          players.map(p => {
            const topicStats = p.topicStats || {};
            const topicKeys = Object.keys(topicStats);

            return (
              <div key={p.id} className="parent-player-card">
                {/* Profile Top Row */}
                <div className="parent-player-header">
                  <div className="player-info-cluster">
                    <AvatarIcon avatarId={p.avatar} size={64} />
                    <div>
                      {editingPlayerId === p.id ? (
                        <div className="inline-rename-box">
                          <input
                            type="text"
                            maxLength={20}
                            value={editNameValue}
                            onChange={(e) => setEditNameValue(e.target.value)}
                            className="rename-input-field"
                            autoFocus
                          />
                          <button
                            type="button"
                            className="btn-save-rename"
                            onClick={() => handleSaveRename(p.id)}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="btn-cancel-rename"
                            onClick={() => setEditingPlayerId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="player-name-display-row">
                          <h2 className="player-card-name">{p.name}</h2>
                          <button
                            type="button"
                            className="btn-text-rename"
                            onClick={() => handleStartRename(p)}
                          >
                            ✏️ Rename
                          </button>
                        </div>
                      )}
                      <div className="player-stats-summary-line">
                        <span>⭐ {p.stars || 0} Total Stars</span>
                        <span>•</span>
                        <span>🎯 {p.sessionsCompleted || 0} Completed Sessions</span>
                      </div>
                    </div>
                  </div>

                  <div className="player-card-actions">
                    <button
                      type="button"
                      className="btn-subtle-reset"
                      onClick={() => setConfirmModal({
                        action: 'reset_player',
                        playerId: p.id,
                        title: `Reset Progress for ${p.name}?`,
                        message: `This will reset ${p.name}'s stars to 0 and clear topic accuracy, but will keep the profile.`
                      })}
                    >
                      Reset Progress
                    </button>

                    <button
                      type="button"
                      className="btn-subtle-delete"
                      onClick={() => setConfirmModal({
                        action: 'delete_player',
                        playerId: p.id,
                        title: `Delete Profile: ${p.name}?`,
                        message: `Are you sure you want to remove ${p.name}'s profile and history permanently?`
                      })}
                    >
                      Delete Player
                    </button>
                  </div>
                </div>

                {/* Per-Topic Accuracy Breakdown */}
                <div className="topic-accuracy-section">
                  <h3>Topic Accuracy & Mastery</h3>
                  {topicKeys.length === 0 ? (
                    <p className="no-topics-yet">No practice sessions completed yet.</p>
                  ) : (
                    <div className="accuracy-bars-grid">
                      {topicKeys.map(tid => {
                        const stat = topicStats[tid];
                        const meta = topicTitleMap[tid] || { title: tid, icon: '📝' };
                        const totalAttempts = stat.attempts || 0;
                        const firstWins = stat.firstTryWins || 0;
                        const secondWins = stat.secondTryWins || 0;
                        const totalSolved = firstWins + secondWins;

                        const firstTryPct = totalAttempts > 0 ? Math.round((firstWins / totalAttempts) * 100) : 0;
                        const recoveryPct = totalAttempts > 0 ? Math.round((secondWins / totalAttempts) * 100) : 0;

                        return (
                          <div key={tid} className="topic-accuracy-row">
                            <div className="topic-acc-meta">
                              <span className="topic-acc-icon">{meta.icon}</span>
                              <span className="topic-acc-title">{meta.title}</span>
                              <span className="topic-acc-numbers">
                                {totalSolved} / {totalAttempts} questions ({firstTryPct}% 1st try)
                              </span>
                            </div>

                            <div className="accuracy-meter-track" title={`${firstTryPct}% solved 1st try, ${recoveryPct}% solved on hint retry`}>
                              <div
                                className="meter-fill-first-try"
                                style={{ width: `${firstTryPct}%` }}
                              />
                              <div
                                className="meter-fill-second-try"
                                style={{ width: `${recoveryPct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="modal-backdrop" onClick={() => setConfirmModal(null)}>
          <div className="modal-dialog confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{confirmModal.title}</h3>
            </div>
            <p className="confirm-modal-body">{confirmModal.message}</p>
            <div className="confirm-modal-buttons">
              <button
                type="button"
                className="secondary-cancel-btn"
                onClick={() => setConfirmModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="danger-confirm-btn"
                onClick={handleConfirmAction}
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
