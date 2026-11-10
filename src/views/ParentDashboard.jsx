import React, { useState } from 'react';
import {
  getPlayers,
  renamePlayer,
  resetPlayerProgress,
  deletePlayer,
  clearAllStorage,
  getPlayerTotalStars,
  getPlayerTermStats,
  getPlayerTopicAccuracyRows
} from '../player/playerStorage.js';
import { AvatarIcon } from '../player/avatars.jsx';
import { terms, getAllTopicMetadataMap } from '../terms/index.js';

export default function ParentDashboard({ onBackToPractice, onPlayerStateChanged }) {
  const [players, setPlayers] = useState(getPlayers());
  const [termFilter, setTermFilter] = useState('all'); // 'all' | 'q1' | 'q2'
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [confirmModal, setConfirmModal] = useState(null); // { action, playerId, termId, title, message }

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
    const { action, playerId, termId } = confirmModal;

    if (action === 'reset_term') {
      resetPlayerProgress(playerId, termId);
      refreshPlayers();
    } else if (action === 'reset_player') {
      resetPlayerProgress(playerId, 'all');
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

  const topicMetadataMap = getAllTopicMetadataMap();

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
            onClick={() =>
              setConfirmModal({
                action: 'clear_all',
                title: 'Reset All Data on This Device?',
                message:
                  'This will permanently delete all players, Q1 & Q2 stars, and practice history stored in this browser.'
              })
            }
          >
            Clear All Data
          </button>
        </div>
      </div>

      <p className="parent-lead-text">
        All progress is saved strictly inside this browser (localStorage). No data leaves this device.
      </p>

      {/* Term Filter Tabs (All / Q1 / Q2) */}
      <div className="parent-term-filter-bar" role="group" aria-label="Filter accuracy by term">
        <span className="parent-filter-label">Filter Accuracy by Term:</span>
        <div className="parent-filter-pills">
          <button
            type="button"
            data-parent-term-filter="all"
            className={`parent-filter-pill ${termFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTermFilter('all')}
          >
            All Terms
          </button>
          {terms.map((t) => (
            <button
              key={t.id}
              type="button"
              data-parent-term-filter={t.id}
              className={`parent-filter-pill ${termFilter === t.id ? 'active' : ''}`}
              onClick={() => setTermFilter(t.id)}
            >
              {t.shortName} ({t.title})
            </button>
          ))}
        </div>
      </div>

      {/* Players List */}
      <div className="parent-players-list">
        {players.length === 0 ? (
          <div className="no-players-box">
            <p>No player profiles found. Head back to create your first learner!</p>
          </div>
        ) : (
          players.map((p) => {
            const totalStars = getPlayerTotalStars(p);
            const q1Stats = getPlayerTermStats(p, 'q1');
            const q2Stats = getPlayerTermStats(p, 'q2');
            const accuracyRows = getPlayerTopicAccuracyRows(p, termFilter);

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
                        <span>⭐ {totalStars} Total Stars</span>
                        <span>•</span>
                        <span>🎯 {p.sessionsCompleted || 0} Total Sessions</span>
                      </div>

                      {/* Per-term Star & Session Badges */}
                      <div className="parent-term-stars-row">
                        <span className="term-star-chip" data-term-stars="q1">
                          <strong>Q1:</strong> ⭐ {q1Stats.stars || 0} ({q1Stats.sessionsCompleted || 0} sessions)
                        </span>
                        <span className="term-star-chip" data-term-stars="q2">
                          <strong>Q2:</strong> ⭐ {q2Stats.stars || 0} ({q2Stats.sessionsCompleted || 0} sessions)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Player Reset / Delete Controls */}
                  <div className="player-card-actions">
                    <button
                      type="button"
                      className="btn-subtle-reset"
                      onClick={() =>
                        setConfirmModal({
                          action: 'reset_term',
                          playerId: p.id,
                          termId: 'q1',
                          title: `Reset Q1 Progress for ${p.name}?`,
                          message: `This will reset ${p.name}'s Q1 stars and Q1 topic accuracy to 0. Q2 progress will NOT be affected.`
                        })
                      }
                    >
                      Reset Q1
                    </button>

                    <button
                      type="button"
                      className="btn-subtle-reset"
                      onClick={() =>
                        setConfirmModal({
                          action: 'reset_term',
                          playerId: p.id,
                          termId: 'q2',
                          title: `Reset Q2 Progress for ${p.name}?`,
                          message: `This will reset ${p.name}'s Q2 stars and Q2 topic accuracy to 0. Q1 progress will NOT be affected.`
                        })
                      }
                    >
                      Reset Q2
                    </button>

                    <button
                      type="button"
                      className="btn-subtle-reset"
                      onClick={() =>
                        setConfirmModal({
                          action: 'reset_player',
                          playerId: p.id,
                          termId: 'all',
                          title: `Reset All Progress for ${p.name}?`,
                          message: `This will reset ${p.name}'s stars and topic accuracy across ALL terms (Q1 and Q2) to 0, while keeping the profile.`
                        })
                      }
                    >
                      Reset Everything
                    </button>

                    <button
                      type="button"
                      className="btn-subtle-delete"
                      onClick={() =>
                        setConfirmModal({
                          action: 'delete_player',
                          playerId: p.id,
                          title: `Delete Profile: ${p.name}?`,
                          message: `Are you sure you want to remove ${p.name}'s profile and all term history permanently?`
                        })
                      }
                    >
                      Delete Player
                    </button>
                  </div>
                </div>

                {/* Per-Topic Accuracy Breakdown */}
                <div className="topic-accuracy-section">
                  <h3>
                    Topic Accuracy & Mastery{' '}
                    <span className="accuracy-filter-tag">
                      ({termFilter === 'all' ? 'All Terms' : termFilter.toUpperCase()})
                    </span>
                  </h3>
                  {accuracyRows.length === 0 ? (
                    <p className="no-topics-yet">
                      {termFilter === 'all'
                        ? 'No practice sessions completed yet.'
                        : `No practice sessions completed in ${termFilter.toUpperCase()} yet.`}
                    </p>
                  ) : (
                    <div className="accuracy-bars-grid">
                      {accuracyRows.map((row) => {
                        const meta =
                          topicMetadataMap[`${row.termId}:${row.topicId}`] ||
                          topicMetadataMap[row.topicId] || {
                            title: row.topicId,
                            icon: '📝'
                          };
                        const totalAttempts = row.attempts || 0;
                        const firstWins = row.firstTryWins || 0;
                        const secondWins = row.secondTryWins || 0;
                        const totalSolved = firstWins + secondWins;

                        const firstTryPct =
                          totalAttempts > 0 ? Math.round((firstWins / totalAttempts) * 100) : 0;
                        const recoveryPct =
                          totalAttempts > 0 ? Math.round((secondWins / totalAttempts) * 100) : 0;

                        return (
                          <div
                            key={`${row.termId}_${row.topicId}`}
                            className="topic-accuracy-row"
                          >
                            <div className="topic-acc-meta">
                              <span className="topic-term-mini-badge">
                                {row.termId.toUpperCase()}
                              </span>
                              <span className="topic-acc-icon">{meta.icon}</span>
                              <span className="topic-acc-title">{meta.title}</span>
                              <span className="topic-acc-numbers">
                                {totalSolved} / {totalAttempts} questions ({firstTryPct}% 1st try)
                              </span>
                            </div>

                            <div
                              className="accuracy-meter-track"
                              title={`${firstTryPct}% solved 1st try, ${recoveryPct}% solved on hint retry`}
                            >
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
