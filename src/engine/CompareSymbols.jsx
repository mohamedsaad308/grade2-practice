import React from 'react';
import { playPop } from '../utils/audio.js';

/**
 * Large tactile buttons for >, <, = comparisons matching the Grade 2 worksheet bubble format
 */
export default function CompareSymbols({
  question,
  onSubmit,
  disabled = false,
  soundEnabled = true
}) {
  const { leftDisplay, rightDisplay } = question.data || {};

  const handleSelect = (symbol) => {
    if (disabled) return;
    playPop(soundEnabled);
    onSubmit(symbol);
  };

  const symbols = [
    { symbol: '>', name: 'Greater than', desc: 'Left is bigger' },
    { symbol: '=', name: 'Equal to', desc: 'Both are the same' },
    { symbol: '<', name: 'Less than', desc: 'Left is smaller' }
  ];

  return (
    <div className="compare-symbols-container">
      {/* Comparison Statement Display */}
      <div className="compare-statement-card">
        <div className="compare-operand left-operand">{leftDisplay}</div>
        <div className="compare-bubble" aria-label="Comparison circle">
          ?
        </div>
        <div className="compare-operand right-operand">{rightDisplay}</div>
      </div>

      {/* Choice Buttons */}
      <div className="symbol-buttons-grid" role="group" aria-label="Choose comparison symbol">
        {symbols.map(({ symbol, name, desc }) => (
          <button
            key={symbol}
            type="button"
            className="symbol-choice-btn"
            disabled={disabled}
            onClick={() => handleSelect(symbol)}
            aria-label={`${name} (${symbol})`}
          >
            <span className="symbol-glyph">{symbol}</span>
            <span className="symbol-name">{name}</span>
            <span className="symbol-desc">{desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
