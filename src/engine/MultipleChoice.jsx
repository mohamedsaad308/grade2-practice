import React from 'react';
import { playPop } from '../utils/audio.js';

/**
 * Reusable Multiple Choice engine component.
 * Displays:
 * (a) The item (sentence, paragraph, or phrase) in a large, high-contrast, clear card
 * (b) The answer options in tactile, kid-friendly buttons
 */
export default function MultipleChoice({
  question,
  onSubmit,
  disabled = false,
  soundEnabled = true
}) {
  const { options = [], sentence = null, paragraph = null, story = null, item = null } = question.data || {};
  const itemText = sentence || paragraph || story || item;

  const handleSelect = (choice) => {
    if (disabled) return;
    playPop(soundEnabled);
    onSubmit(choice);
  };

  const renderItemContent = () => {
    if (!itemText) return null;

    const isParagraph = Boolean(paragraph || story || (typeof itemText === 'string' && itemText.length > 120));

    // Sentence completion with blank
    if (typeof itemText === 'string' && itemText.includes('___')) {
      const parts = itemText.split('___');
      return (
        <div className="mc-item-card mc-sentence-card" aria-label="Sentence with blank">
          <p className="mc-item-sentence">
            {parts.map((part, idx) => (
              <React.Fragment key={idx}>
                <span className="sentence-part">{part}</span>
                {idx < parts.length - 1 && (
                  <span className="mc-sentence-blank-pill" aria-label="Blank">______</span>
                )}
              </React.Fragment>
            ))}
          </p>
        </div>
      );
    }

    return (
      <div className={`mc-item-card ${isParagraph ? 'mc-paragraph-card mc-reading-paragraph-card' : 'mc-sentence-card'}`}>
        <p className={isParagraph ? 'mc-item-paragraph mc-reading-text' : 'mc-item-sentence'}>
          {itemText}
        </p>
      </div>
    );
  };

  return (
    <div className="multiple-choice-container">
      {/* Actual item to answer (sentence, paragraph) */}
      {renderItemContent()}

      {/* Answer options */}
      <div
        className={`options-grid ${options.every(opt => String(opt).length <= 14) ? 'options-grid-2col' : 'options-grid-1col'}`}
        role="group"
        aria-label="Multiple choice options"
      >
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
