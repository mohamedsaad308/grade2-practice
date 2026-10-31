import React, { useState, useEffect } from 'react';
import { playPop } from '../utils/audio.js';

export default function WordBank({
  question,
  onSubmit,
  disabled = false,
  soundEnabled = true
}) {
  const { sentence = '', wordBank = [], underlinedWord = null } = question.data || {};
  const [selectedWord, setSelectedWord] = useState('');

  useEffect(() => {
    setSelectedWord('');
  }, [question?.id]);

  const handleSelectWord = (word) => {
    if (disabled) return;
    playPop(soundEnabled);
    setSelectedWord(word);
  };

  const handleSubmit = () => {
    if (disabled || !selectedWord) return;
    onSubmit(selectedWord);
  };

  // Render sentence with either an active blank replacement or underlined target
  const renderSentence = () => {
    if (sentence.includes('___')) {
      const parts = sentence.split('___');
      return (
        <div className="wordbank-sentence-display">
          <span className="sentence-text-lead">{parts[0]}</span>
          <span className={`sentence-blank-box ${selectedWord ? 'blank-filled' : 'blank-empty'}`}>
            {selectedWord || '______'}
          </span>
          <span className="sentence-text-tail">{parts[1]}</span>
        </div>
      );
    }

    if (underlinedWord) {
      // Highlight the underlined word in the sentence
      const regex = new RegExp(`(${underlinedWord})`, 'gi');
      const parts = sentence.split(regex);

      return (
        <div className="wordbank-sentence-display">
          <div className="synonym-sentence-line">
            {parts.map((p, i) =>
              p.toLowerCase() === underlinedWord.toLowerCase() ? (
                <span key={i} className="synonym-target-underlined">
                  {p}
                </span>
              ) : (
                <span key={i}>{p}</span>
              )
            )}
          </div>
          <div className="synonym-choice-prompt">
            Synonym for <strong>{underlinedWord}</strong>:{' '}
            <span className={`sentence-blank-box ${selectedWord ? 'blank-filled' : 'blank-empty'}`}>
              {selectedWord || '______'}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="wordbank-sentence-display">
        <p>{sentence}</p>
      </div>
    );
  };

  return (
    <div className="wordbank-container">
      {/* Sentence Display Card */}
      <div className="wordbank-sentence-card">
        {renderSentence()}
      </div>

      {/* Word Bank Cards Header */}
      <div className="wordbank-label-bar">
        <span className="wordbank-title-pill">Word Bank:</span>
        <span className="wordbank-instruction">Tap a word card to choose it:</span>
      </div>

      {/* Word Bank Cards Rack */}
      <div className="wordbank-cards-rack" role="group" aria-label="Word Bank options">
        {wordBank.map((word, idx) => {
          const isSelected = selectedWord.toLowerCase() === word.toLowerCase();
          return (
            <button
              key={idx}
              type="button"
              className={`wordbank-card-btn ${isSelected ? 'wordbank-card-selected' : ''}`}
              disabled={disabled}
              onClick={() => handleSelectWord(word)}
              aria-label={`Word bank option ${word}`}
            >
              <span className="wordbank-card-text">{word}</span>
            </button>
          );
        })}
      </div>

      {/* Submit Button */}
      <button
        type="button"
        className="primary-submit-btn check-wordbank-btn"
        disabled={disabled || !selectedWord}
        onClick={handleSubmit}
      >
        Check Answer ✨
      </button>
    </div>
  );
}
