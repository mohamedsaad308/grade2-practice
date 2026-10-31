import React, { useState, useEffect } from 'react';
import { playPop } from '../utils/audio.js';

export default function TwoStep({
  question,
  onSubmit,
  disabled = false,
  soundEnabled = true
}) {
  const {
    options = [],
    step1Prompt = 'Step 1: Choose the sentence:',
    step2Prompt = 'Step 2: Choose the correct end mark:'
  } = question.data || {};

  const [selectedSentence, setSelectedSentence] = useState(null);
  const [selectedPunctuation, setSelectedPunctuation] = useState(null);

  useEffect(() => {
    setSelectedSentence(null);
    setSelectedPunctuation(null);
  }, [question?.id]);

  const handleSelectSentence = (optId) => {
    if (disabled) return;
    playPop(soundEnabled);
    setSelectedSentence(optId);
  };

  const handleSelectPunctuation = (punct) => {
    if (disabled) return;
    playPop(soundEnabled);
    setSelectedPunctuation(punct);
  };

  const handleSubmit = () => {
    if (disabled || !selectedSentence || !selectedPunctuation) return;
    onSubmit({
      sentence: selectedSentence,
      punctuation: selectedPunctuation
    });
  };

  const punctuationChoices = [
    { mark: '.', name: 'Period', desc: 'Used for Statements & Commands' },
    { mark: '?', name: 'Question Mark', desc: 'Used for Questions' },
    { mark: '!', name: 'Exclamation Mark', desc: 'Used for Exclamations' }
  ];

  const isReady = selectedSentence && selectedPunctuation;

  return (
    <div className="twostep-container">
      {/* Step 1: Sentence Selection */}
      <div className="twostep-section">
        <div className="step-header-row">
          <span className="step-badge step-1-badge">1</span>
          <h3 className="step-prompt-text">{step1Prompt}</h3>
        </div>

        <div className="twostep-options-list" role="group" aria-label="Step 1 Sentence options">
          {options.map((opt) => {
            const isSelected = selectedSentence === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                className={`twostep-sentence-btn ${isSelected ? 'twostep-sentence-selected' : ''}`}
                disabled={disabled}
                onClick={() => handleSelectSentence(opt.id)}
                aria-pressed={isSelected}
              >
                <span className="twostep-letter-tag">{opt.id.toUpperCase()}</span>
                <span className="twostep-text">{opt.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Punctuation Selection */}
      <div className={`twostep-section ${!selectedSentence ? 'section-faded' : ''}`}>
        <div className="step-header-row">
          <span className="step-badge step-2-badge">2</span>
          <h3 className="step-prompt-text">{step2Prompt}</h3>
        </div>

        <div className="punctuation-choices-grid" role="group" aria-label="Punctuation mark choices">
          {punctuationChoices.map(({ mark, name, desc }) => {
            const isSelected = selectedPunctuation === mark;
            return (
              <button
                key={mark}
                type="button"
                className={`punctuation-mark-btn ${isSelected ? 'punct-selected' : ''}`}
                disabled={disabled || !selectedSentence}
                onClick={() => handleSelectPunctuation(mark)}
                aria-pressed={isSelected}
                aria-label={`${name} (${mark})`}
              >
                <span className="punct-glyph">{mark}</span>
                <span className="punct-name">{name}</span>
                <span className="punct-desc">{desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        className="primary-submit-btn check-twostep-btn"
        disabled={disabled || !isReady}
        onClick={handleSubmit}
      >
        Check Answer ✨
      </button>
    </div>
  );
}
