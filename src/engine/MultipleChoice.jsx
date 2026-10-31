import React from 'react';
import { playPop } from '../utils/audio.js';

/**
 * Reusable Multiple Choice engine component.
 * Supports standard options, as well as optional story/paragraph cards for reading comprehension.
 */
export default function MultipleChoice({
  question,
  onSubmit,
  disabled = false,
  soundEnabled = true
}) {
  const { options = [], paragraph = null, story = null } = question.data || {};
  const textBody = paragraph || story;

  const handleSelect = (choice) => {
    if (disabled) return;
    playPop(soundEnabled);
    onSubmit(choice);
  };

  return (
    <div className="multiple-choice-container">
      {/* Optional story/paragraph card for reading character trait questions */}
      {textBody && (
        <div className="mc-reading-paragraph-card">
          <p className="mc-reading-text">{textBody}</p>
        </div>
      )}

      <div className="options-grid" role="group" aria-label="Multiple choice options">
        {options.map((opt, idx) => (
          <button
            key={idx}
            type="button"
            className="option-choice-btn"
            disabled={disabled}
            onClick={() => handleSelect(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
