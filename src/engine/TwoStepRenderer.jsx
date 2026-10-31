import React, { useState, useEffect } from 'react';
import { playPop } from '../utils/audio.js';

/**
 * Renderer for "two_step" questions:
 * 1. Instruction displayed in large type from question.text.
 * 2. Step 1: Pick one sentence from question.options.
 * 3. Step 2: Pick an end mark from question.marks (. ? !).
 * Both must be right.
 *
 * Throws a visible error if item text, options, or marks are missing.
 */
export default function TwoStepRenderer({
  question,
  onSubmit,
  disabled = false,
  soundEnabled = true
}) {
  if (!question) return null;

  // Strict quality check
  if (!question.text || typeof question.text !== 'string' || question.text.trim().length === 0) {
    throw new Error(
      `TwoStepRenderer: question "${question.id || 'unknown'}" is missing required non-empty "text" field.`
    );
  }
  if (!Array.isArray(question.options) || question.options.length === 0) {
    throw new Error(
      `TwoStepRenderer: question "${question.id || 'unknown'}" must have a non-empty "options" array.`
    );
  }
  if (!Array.isArray(question.marks) || question.marks.length === 0) {
    throw new Error(
      `TwoStepRenderer: question "${question.id || 'unknown'}" must have a non-empty "marks" array.`
    );
  }

  const [selectedSentence, setSelectedSentence] = useState(null);
  const [selectedMark, setSelectedMark] = useState(null);

  useEffect(() => {
    setSelectedSentence(null);
    setSelectedMark(null);
  }, [question.id]);

  const handleSelectSentence = (sentence) => {
    if (disabled) return;
    playPop(soundEnabled);
    setSelectedSentence(sentence);
  };

  const handleSelectMark = (mark) => {
    if (disabled) return;
    playPop(soundEnabled);
    setSelectedMark(mark);
  };

  const handleSubmit = () => {
    if (disabled || !selectedSentence || !selectedMark) return;
    onSubmit({
      sentence: selectedSentence,
      mark: selectedMark
    });
  };

  const isReady = Boolean(selectedSentence && selectedMark);

  return (
    <div className="twostep-renderer-container">
      {/* The instruction displayed in LARGE clear type */}
      <div className="twostep-instruction-card">
        <p className="twostep-instruction-text">{question.text}</p>
      </div>

      {/* Step 1: Pick sentence from options */}
      <div className="twostep-step-box">
        <div className="twostep-step-header">
          <span className="step-number-badge">1</span>
          <h4 className="step-prompt-label">Step 1: Pick the sentence:</h4>
        </div>
        <div className="twostep-sentences-list" role="group" aria-label="Step 1 sentence choices">
          {question.options.map((sent, idx) => {
            const isSelected = selectedSentence === sent;
            return (
              <button
                key={`${sent}-${idx}`}
                type="button"
                className={`twostep-sentence-btn ${isSelected ? 'sentence-selected' : ''}`}
                disabled={disabled}
                onClick={() => handleSelectSentence(sent)}
                aria-pressed={isSelected}
              >
                <span className="sentence-radio-circle">{isSelected ? '✓' : ''}</span>
                <span className="sentence-btn-text">{sent}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Pick end mark from marks */}
      <div className={`twostep-step-box ${!selectedSentence ? 'step-inactive' : ''}`}>
        <div className="twostep-step-header">
          <span className="step-number-badge">2</span>
          <h4 className="step-prompt-label">Step 2: Choose its end mark:</h4>
        </div>
        <div className="twostep-marks-rack" role="group" aria-label="Step 2 end marks">
          {question.marks.map((mark, idx) => {
            const isSelected = selectedMark === mark;
            const labelMap = { '.': 'Period (.)', '?': 'Question Mark (?)', '!': 'Exclamation Mark (!)' };
            return (
              <button
                key={`${mark}-${idx}`}
                type="button"
                className={`twostep-mark-btn ${isSelected ? 'mark-selected' : ''}`}
                disabled={disabled || !selectedSentence}
                onClick={() => handleSelectMark(mark)}
                aria-pressed={isSelected}
                aria-label={labelMap[mark] || mark}
              >
                <span className="mark-glyph">{mark}</span>
                <span className="mark-name">{labelMap[mark] || mark}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <div className="twostep-submit-bar">
        <button
          type="button"
          className="primary-submit-btn check-twostep-btn"
          disabled={disabled || !isReady}
          onClick={handleSubmit}
        >
          Check Answer ✨
        </button>
      </div>
    </div>
  );
}
