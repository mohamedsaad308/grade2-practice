import React from 'react';
import { playPop } from '../utils/audio.js';

/**
 * Reusable Multiple Choice engine component
 */
export default function MultipleChoice({
  question,
  onSubmit,
  disabled = false,
  soundEnabled = true
}) {
  const { options = [] } = question.data || {};

  const handleSelect = (choice) => {
    if (disabled) return;
    playPop(soundEnabled);
    onSubmit(choice);
  };

  return (
    <div className="multiple-choice-container">
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
