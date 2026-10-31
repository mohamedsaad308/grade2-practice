import React, { useState, useEffect } from 'react';
import { playPop } from '../utils/audio.js';

function escapeRegex(string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Renderer for "choice" questions:
 * 1. Optional prompt shown as the instruction above the item text.
 * 2. Optional passage shown above the question with numbered sentences (1), (2)... full height, no inner scroll box.
 * 3. Item text in LARGE type:
 *    - If text contains "___", rendered as a highlighted blank filled by the tapped option.
 *    - If "underline" is set, the specified word is underlined.
 * 4. Options are big tactile buttons.
 *
 * Throws a visible error if item text is missing.
 */
export default function ChoiceRenderer({
  question,
  onSubmit,
  disabled = false,
  soundEnabled = true,
  userAnswer = null
}) {
  if (!question) return null;

  // Strict quality check: never render a question without its item text
  if (!question.text || typeof question.text !== 'string' || question.text.trim().length === 0) {
    throw new Error(
      `ChoiceRenderer: question "${question.id || 'unknown'}" is missing required non-empty "text" field.`
    );
  }

  const [selectedChoice, setSelectedChoice] = useState(userAnswer || '');

  useEffect(() => {
    setSelectedChoice(userAnswer || '');
  }, [question.id, userAnswer]);

  const handleSelect = (choice) => {
    if (disabled) return;
    playPop(soundEnabled);
    setSelectedChoice(choice);
    onSubmit(choice);
  };

  const renderFormattedText = () => {
    const text = question.text;
    const underlineTarget = question.underline;
    const hasBlank = text.includes('___');

    // Helper to render text with underlined target word if set
    const renderWithUnderline = (segment, keyPrefix = 'seg') => {
      if (!underlineTarget) return segment;
      const regex = new RegExp(`(${escapeRegex(underlineTarget)})`, 'gi');
      const parts = segment.split(regex);
      return parts.map((part, pIdx) => {
        if (part.toLowerCase() === underlineTarget.toLowerCase()) {
          return (
            <u key={`${keyPrefix}-u-${pIdx}`} className="choice-target-underline">
              {part}
            </u>
          );
        }
        return part;
      });
    };

    if (hasBlank) {
      const parts = text.split('___');
      return (
        <p className="choice-item-text choice-has-blank" aria-label="Sentence with blank">
          {parts.map((part, idx) => (
            <React.Fragment key={idx}>
              {renderWithUnderline(part, `part-${idx}`)}
              {idx < parts.length - 1 && (
                <span
                  className={`choice-blank-pill ${selectedChoice ? 'blank-filled' : 'blank-empty'}`}
                  aria-label={selectedChoice ? `Filled with ${selectedChoice}` : 'Blank'}
                >
                  {selectedChoice || '______'}
                </span>
              )}
            </React.Fragment>
          ))}
        </p>
      );
    }

    return (
      <p className="choice-item-text" aria-label="Question text">
        {renderWithUnderline(text, 'full')}
      </p>
    );
  };

  const isShortOptions =
    Array.isArray(question.options) &&
    question.options.length > 0 &&
    question.options.every((opt) => String(opt).length <= 14);

  const hasPassage = Boolean(question.passage);

  return (
    <div className={`choice-renderer-container ${hasPassage ? 'choice-has-passage' : ''}`}>
      {/* Optional passage card displayed ABOVE the question full-height (no inner scroll box) */}
      {hasPassage && (
        <div className="choice-passage-card" role="region" aria-label="Passage for question">
          {question.passage.title && (
            <div className="choice-passage-header">
              <span className="passage-book-icon">📖</span>
              <h3 className="choice-passage-title">{question.passage.title}</h3>
            </div>
          )}
          <div className="choice-passage-body">
            {question.passage.sentences &&
              question.passage.sentences.map((sent, idx) => (
                <span key={idx} className="choice-passage-sentence">
                  <strong className="passage-sentence-num">({idx + 1})</strong> {sent}{' '}
                </span>
              ))}
          </div>
        </div>
      )}

      <div className="choice-question-pane">
        {/* Optional prompt shown as the instruction above text */}
        {question.prompt && (
          <div className="choice-prompt-box">
            <span className="choice-prompt-text">{question.prompt}</span>
          </div>
        )}

        {/* Actual item text in large type */}
        <div className={`choice-item-card ${question.text.includes('___') ? 'choice-item-card-blank' : ''}`}>
          {renderFormattedText()}
        </div>

        {/* Answer options as big buttons (2-col grid for short options, 1-col for long) */}
        <div
          className={`choice-options-grid ${isShortOptions ? 'choice-options-2col' : 'choice-options-1col'}`}
          role="group"
          aria-label="Answer options"
        >
          {(question.options || []).map((opt, idx) => {
            const isSelected = selectedChoice === opt;
            return (
              <button
                key={`${opt}-${idx}`}
                type="button"
                className={`choice-option-btn ${isSelected ? 'choice-option-selected' : ''}`}
                disabled={disabled}
                onClick={() => handleSelect(opt)}
                aria-pressed={isSelected}
              >
                <span className="choice-option-label">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
