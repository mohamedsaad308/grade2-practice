import React, { useState, useEffect } from 'react';
import { playPop } from '../utils/audio.js';

export default function LetterTiles({
  question,
  onSubmit,
  disabled = false,
  soundEnabled = true
}) {
  const { word = '', scrambled = [], picture = null, pictureLabel = '', clueSentence = '', scrambledWord = '' } = question.data || {};

  // Track which tile indices from `scrambled` have been placed into the answer box
  const [placedIndices, setPlacedIndices] = useState([]);

  useEffect(() => {
    setPlacedIndices([]);
  }, [question?.id]);

  // Support physical keyboard
  useEffect(() => {
    function handleKeyDown(e) {
      if (disabled) return;
      const key = e.key.toLowerCase();

      if (key >= 'a' && key <= 'z' && key.length === 1) {
        // Find first unused tile matching this letter
        const nextIdx = scrambled.findIndex((letter, idx) => letter.toLowerCase() === key && !placedIndices.includes(idx));
        if (nextIdx !== -1) {
          playPop(soundEnabled);
          setPlacedIndices(prev => [...prev, nextIdx]);
        }
      } else if (e.key === 'Backspace') {
        if (placedIndices.length > 0) {
          playPop(soundEnabled);
          setPlacedIndices(prev => prev.slice(0, -1));
        }
      } else if (e.key === 'Enter') {
        if (placedIndices.length > 0) {
          const formedWord = placedIndices.map(idx => scrambled[idx]).join('');
          onSubmit(formedWord);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, scrambled, placedIndices, soundEnabled, onSubmit]);

  const handleTileClick = (index) => {
    if (disabled || placedIndices.includes(index)) return;
    playPop(soundEnabled);
    setPlacedIndices(prev => [...prev, index]);
  };

  const handlePlacedSlotClick = (placedPosition) => {
    if (disabled) return;
    playPop(soundEnabled);
    // Remove the letter at this placed position
    setPlacedIndices(prev => prev.filter((_, idx) => idx !== placedPosition));
  };

  const handleUndo = () => {
    if (disabled || placedIndices.length === 0) return;
    playPop(soundEnabled);
    setPlacedIndices(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (disabled || placedIndices.length === 0) return;
    playPop(soundEnabled);
    setPlacedIndices([]);
  };

  const handleSubmit = () => {
    if (disabled || placedIndices.length === 0) return;
    const formedWord = placedIndices.map(idx => scrambled[idx]).join('');
    onSubmit(formedWord);
  };

  const renderPicture = () => {
    if (!picture) return null;

    if (picture === 'cape') {
      return (
        <div className="picture-illustration-box" aria-label="A superhero cape">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <path d="M45 25 C55 20, 65 20, 75 25 C85 45, 95 85, 92 105 C80 98, 40 98, 28 105 C25 85, 35 45, 45 25 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="3" />
            <path d="M50 24 C57 20, 63 20, 70 24" stroke="#FEF08A" strokeWidth="5" strokeLinecap="round" />
            <polygon points="60,45 63,55 74,55 65,62 68,72 60,66 52,72 55,62 46,55 57,55" fill="#FEF08A" />
          </svg>
          <span className="picture-caption-pill">{pictureLabel || 'a cape'}</span>
        </div>
      );
    }

    if (picture === 'gate') {
      return (
        <div className="picture-illustration-box" aria-label="A boy at a gate">
          <svg width="140" height="120" viewBox="0 0 140 120" fill="none">
            {/* Fence and Gate */}
            <rect x="50" y="35" width="55" height="70" rx="4" fill="#FDE68A" stroke="#B45309" strokeWidth="3" />
            <line x1="50" y1="55" x2="105" y2="55" stroke="#B45309" strokeWidth="2.5" />
            <line x1="50" y1="80" x2="105" y2="80" stroke="#B45309" strokeWidth="2.5" />
            <line x1="50" y1="35" x2="105" y2="105" stroke="#B45309" strokeWidth="2.5" />
            <circle cx="58" cy="70" r="4" fill="#78350F" />
            {/* Fence posts */}
            <rect x="38" y="45" width="10" height="60" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
            <rect x="107" y="45" width="10" height="60" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
            {/* Boy standing near gate */}
            <circle cx="25" cy="50" r="10" fill="#FCD34D" stroke="#D97706" strokeWidth="2" />
            <path d="M25 60 L25 85 M25 70 L15 78 M25 70 L35 75 M25 85 L18 105 M25 85 L32 105" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
            <circle cx="22" cy="48" r="1.5" fill="#1E293B" />
            <circle cx="28" cy="48" r="1.5" fill="#1E293B" />
            <path d="M22 54 Q25 57 28 54" stroke="#1E293B" strokeWidth="1.5" fill="none" />
          </svg>
          <span className="picture-caption-pill">{pictureLabel || 'a boy at a gate'}</span>
        </div>
      );
    }

    if (picture === 'cake') {
      return (
        <div className="picture-illustration-box" aria-label="A birthday cake">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            {/* Cake bottom layer */}
            <rect x="25" y="60" width="70" height="40" rx="8" fill="#F472B6" stroke="#BE185D" strokeWidth="3" />
            {/* Icing frosting */}
            <path d="M25 70 Q35 78 45 70 Q55 78 65 70 Q75 78 85 70 Q95 78 95 65 L95 60 L25 60 Z" fill="#FDF2F8" />
            {/* Candles */}
            <rect x="38" y="40" width="5" height="20" fill="#60A5FA" />
            <rect x="58" y="38" width="5" height="22" fill="#FBBF24" />
            <rect x="78" y="40" width="5" height="20" fill="#34D399" />
            {/* Flames */}
            <ellipse cx="40.5" cy="35" rx="3" ry="5" fill="#F97316" />
            <ellipse cx="60.5" cy="33" rx="3.5" ry="5.5" fill="#F97316" />
            <ellipse cx="80.5" cy="35" rx="3" ry="5" fill="#F97316" />
          </svg>
          <span className="picture-caption-pill">{pictureLabel || 'a cake'}</span>
        </div>
      );
    }

    if (picture === 'race') {
      return (
        <div className="picture-illustration-box" aria-label="Three kids running a race">
          <svg width="140" height="120" viewBox="0 0 140 120" fill="none">
            {/* Ground finish line */}
            <line x1="10" y1="105" x2="130" y2="105" stroke="#CBD5E1" strokeWidth="3" />
            <line x1="115" y1="30" x2="115" y2="105" stroke="#EF4444" strokeWidth="3" strokeDasharray="4 4" />
            {/* Runner 1 (Red) */}
            <g transform="translate(15, 30)">
              <circle cx="15" cy="15" r="9" fill="#FCA5A5" stroke="#DC2626" strokeWidth="2" />
              <path d="M15 24 L22 45 M15 32 L30 28 M15 32 L5 38 M22 45 L32 65 M22 45 L10 65" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
            </g>
            {/* Runner 2 (Blue) */}
            <g transform="translate(45, 20)">
              <circle cx="15" cy="15" r="9" fill="#93C5FD" stroke="#2563EB" strokeWidth="2" />
              <path d="M15 24 L24 45 M15 32 L32 26 M15 32 L2 35 M24 45 L35 65 M24 45 L12 65" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
            </g>
            {/* Runner 3 (Green) */}
            <g transform="translate(75, 25)">
              <circle cx="15" cy="15" r="9" fill="#86EFAC" stroke="#16A34A" strokeWidth="2" />
              <path d="M15 24 L22 45 M15 32 L30 28 M15 32 L5 38 M22 45 L32 65 M22 45 L10 65" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
            </g>
          </svg>
          <span className="picture-caption-pill">{pictureLabel || 'three kids in a race'}</span>
        </div>
      );
    }

    return null;
  };

  const maxSlots = Math.max(word.length, scrambled.length);

  return (
    <div className="letter-tiles-container">
      {/* Picture illustration or clue sentence */}
      {renderPicture()}

      {clueSentence && (
        <div className="clue-sentence-card">
          <p className="clue-sentence-text">
            {clueSentence.split(' ').map((token, i) => {
              const cleanToken = token.replace(/[.,!?]/g, '');
              const isTarget = cleanToken.toLowerCase() === scrambledWord.toLowerCase();
              return (
                <span
                  key={i}
                  className={isTarget ? 'scrambled-token-highlight' : ''}
                >
                  {token}{' '}
                </span>
              );
            })}
          </p>
        </div>
      )}

      {/* Answer Slots Row */}
      <div className="answer-slots-rack" role="group" aria-label="Spelled word slots">
        {Array.from({ length: maxSlots }).map((_, slotIdx) => {
          const placedIdx = placedIndices[slotIdx];
          const hasLetter = placedIdx !== undefined;
          const letter = hasLetter ? scrambled[placedIdx] : '';

          return (
            <button
              key={slotIdx}
              type="button"
              className={`letter-slot-box ${hasLetter ? 'slot-filled' : 'slot-empty'}`}
              disabled={disabled || !hasLetter}
              onClick={() => handlePlacedSlotClick(slotIdx)}
              title={hasLetter ? 'Click to remove letter' : 'Empty slot'}
              aria-label={hasLetter ? `Letter ${letter}. Click to remove.` : 'Empty slot'}
            >
              <span className="slot-letter-char">{letter}</span>
              {hasLetter && !disabled && <span className="slot-remove-badge">×</span>}
            </button>
          );
        })}
      </div>

      {/* Available Letter Tiles Rack */}
      <div className="available-tiles-rack" role="group" aria-label="Available letter tiles">
        {scrambled.map((letter, idx) => {
          const isPlaced = placedIndices.includes(idx);
          return (
            <button
              key={idx}
              type="button"
              className={`letter-tile-btn ${isPlaced ? 'tile-used' : 'tile-active'}`}
              disabled={disabled || isPlaced}
              onClick={() => handleTileClick(idx)}
              aria-label={`Letter tile ${letter.toUpperCase()}`}
            >
              <span className="tile-letter-char">{letter.toUpperCase()}</span>
            </button>
          );
        })}
      </div>

      {/* Action Controls: Undo, Clear, Check Word */}
      <div className="tile-controls-row">
        <button
          type="button"
          className="tile-action-btn undo-btn"
          disabled={disabled || placedIndices.length === 0}
          onClick={handleUndo}
          aria-label="Undo last letter"
        >
          ⌫ Undo
        </button>

        <button
          type="button"
          className="tile-action-btn clear-btn"
          disabled={disabled || placedIndices.length === 0}
          onClick={handleClear}
          aria-label="Clear all letters"
        >
          Clear
        </button>

        <button
          type="button"
          className="primary-submit-btn check-word-btn"
          disabled={disabled || placedIndices.length === 0}
          onClick={handleSubmit}
        >
          Check Word ✨
        </button>
      </div>
    </div>
  );
}
