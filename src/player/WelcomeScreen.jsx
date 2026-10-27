import React, { useState } from 'react';
import { AVATAR_LIST, AvatarIcon } from './avatars.jsx';
import { createPlayer } from './playerStorage.js';
import Mascot from '../components/Mascot.jsx';
import { playPop, playSuccessSound } from '../utils/audio.js';

export default function WelcomeScreen({ onPlayerCreated, isAddingNew = false, onCancel = null }) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('fox');
  const [error, setError] = useState('');

  const trimmed = name.trim();
  const isValid = trimmed.length > 0 && trimmed.length <= 20;

  const handleNameChange = (e) => {
    const val = e.target.value.slice(0, 20);
    setName(val);
    if (error) setError('');
  };

  const handleSelectAvatar = (avatarId) => {
    playPop(true);
    setSelectedAvatar(avatarId);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      const player = createPlayer(trimmed, selectedAvatar);
      playSuccessSound(true);
      if (onPlayerCreated) onPlayerCreated(player);
    } catch (err) {
      setError(err.message || 'Please enter a valid name.');
    }
  };

  return (
    <div className="welcome-screen-overlay">
      <div className="welcome-card">
        {/* Header Mascot greeting */}
        <div className="welcome-mascot-row">
          <Mascot mood="waving" size={110} />
          <div className="welcome-greeting-text">
            <h2>{isAddingNew ? 'Welcome New Friend!' : 'Welcome to Grade 2 Stars!'}</h2>
            <p>Ready to practice and earn shiny stars?</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="welcome-form">
          {/* Name input */}
          <div className="form-group">
            <label htmlFor="child-name-input" className="form-label">
              What is your first name?
            </label>
            <input
              id="child-name-input"
              type="text"
              autoFocus
              maxLength={20}
              placeholder="e.g. Maya"
              value={name}
              onChange={handleNameChange}
              className="welcome-name-input"
              autoComplete="off"
            />
            <div className="char-count-hint">{name.length}/20 characters</div>
            {error && <p className="form-error-msg">{error}</p>}
          </div>

          {/* Avatar selection */}
          <div className="form-group">
            <label className="form-label">Choose your animal buddy:</label>
            <div className="avatar-selection-grid" role="radiogroup" aria-label="Choose avatar">
              {AVATAR_LIST.map((item) => {
                const isSelected = selectedAvatar === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`avatar-choice-card ${isSelected ? 'selected-avatar' : ''}`}
                    onClick={() => handleSelectAvatar(item.id)}
                  >
                    <AvatarIcon avatarId={item.id} size={58} />
                    <span className="avatar-choice-label">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="welcome-actions">
            {isAddingNew && onCancel && (
              <button
                type="button"
                className="secondary-cancel-btn"
                onClick={onCancel}
              >
                Back
              </button>
            )}
            <button
              type="submit"
              className="lets-go-btn"
              disabled={!isValid}
            >
              Let's Go! 🚀
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
