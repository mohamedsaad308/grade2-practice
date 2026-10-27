import React, { useState, useEffect } from 'react';
import { playPop } from '../utils/audio.js';

/**
 * Large tactile number input with on-screen keypad and physical keyboard support
 */
export default function FillInNumber({
  question,
  onSubmit,
  disabled = false,
  soundEnabled = true
}) {
  const [value, setValue] = useState('');

  // Reset value when question changes
  useEffect(() => {
    setValue('');
  }, [question?.id]);

  // Handle hardware keyboard typing
  useEffect(() => {
    function handleKeyDown(e) {
      if (disabled) return;
      if (e.key >= '0' && e.key <= '9') {
        if (value.length < 5) {
          playPop(soundEnabled);
          setValue(prev => (prev === '0' ? e.key : prev + e.key));
        }
      } else if (e.key === 'Backspace') {
        playPop(soundEnabled);
        setValue(prev => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        if (value.trim() !== '') {
          onSubmit(parseInt(value.trim(), 10));
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, value, soundEnabled, onSubmit]);

  const handleKeyPress = (digit) => {
    if (disabled) return;
    playPop(soundEnabled);
    if (value.length < 5) {
      setValue(prev => (prev === '0' ? String(digit) : prev + String(digit)));
    }
  };

  const handleBackspace = () => {
    if (disabled) return;
    playPop(soundEnabled);
    setValue(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (disabled) return;
    playPop(soundEnabled);
    setValue('');
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (disabled || value.trim() === '') return;
    onSubmit(parseInt(value.trim(), 10));
  };

  return (
    <div className="fill-in-number-container">
      {/* Big Display Field */}
      <div className="number-display-wrapper">
        <div className="number-display-box" tabIndex={0} aria-label="Typed answer">
          {value || <span className="number-placeholder">?</span>}
        </div>
      </div>

      {/* On-screen Keypad */}
      <div className="keypad-grid" role="group" aria-label="Number keypad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            type="button"
            className="keypad-btn digit-btn"
            disabled={disabled}
            onClick={() => handleKeyPress(num)}
            aria-label={String(num)}
          >
            {num}
          </button>
        ))}

        <button
          type="button"
          className="keypad-btn action-btn clear-btn"
          disabled={disabled || !value}
          onClick={handleClear}
          aria-label="Clear all"
        >
          Clear
        </button>

        <button
          type="button"
          className="keypad-btn digit-btn"
          disabled={disabled}
          onClick={() => handleKeyPress(0)}
          aria-label="0"
        >
          0
        </button>

        <button
          type="button"
          className="keypad-btn action-btn backspace-btn"
          disabled={disabled || !value}
          onClick={handleBackspace}
          aria-label="Backspace"
        >
          ⌫
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        className="primary-submit-btn"
        disabled={disabled || value.trim() === ''}
        onClick={handleSubmit}
      >
        Check Answer ✨
      </button>
    </div>
  );
}
