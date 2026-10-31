import React, { useState, useEffect } from 'react';
import { playPop } from '../utils/audio.js';

export default function TapToSelect({
  question,
  onSubmit,
  disabled = false,
  soundEnabled = true
}) {
  const { options = [], requiredCount = 1 } = question.data || {};
  const [selectedList, setSelectedList] = useState([]);

  useEffect(() => {
    setSelectedList([]);
  }, [question?.id]);

  const handleToggle = (item) => {
    if (disabled) return;
    playPop(soundEnabled);

    setSelectedList(prev => {
      if (prev.includes(item)) {
        return prev.filter(x => x !== item);
      }
      return [...prev, item];
    });
  };

  const handleSubmit = () => {
    if (disabled || selectedList.length === 0) return;
    onSubmit(selectedList);
  };

  const isReady = selectedList.length === requiredCount;

  return (
    <div className="tap-to-select-container">
      <div className="select-counter-bar">
        <span className="select-counter-pill">
          {selectedList.length} of {requiredCount} selected
        </span>
        <span className="select-instruction">
          Tap {requiredCount === 1 ? 'the correct sentence' : `${requiredCount} sentences`} to select:
        </span>
      </div>

      <div className="select-options-list" role="group" aria-label="Sentence choices">
        {options.map((sentence, idx) => {
          const isSelected = selectedList.includes(sentence);

          return (
            <button
              key={idx}
              type="button"
              className={`tap-select-card ${isSelected ? 'tap-card-selected' : ''}`}
              disabled={disabled}
              onClick={() => handleToggle(sentence)}
              aria-pressed={isSelected}
            >
              <div className="tap-select-indicator">
                {isSelected ? '✓' : ''}
              </div>
              <span className="tap-sentence-text">{sentence}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="primary-submit-btn check-select-btn"
        disabled={disabled || selectedList.length === 0}
        onClick={handleSubmit}
      >
        Check Selection ✨
      </button>
    </div>
  );
}
