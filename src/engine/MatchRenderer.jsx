import React, { useState, useEffect } from 'react';
import { playPop } from '../utils/audio.js';
import { shuffle } from '../utils/mathHelpers.js';

const PAIR_COLORS = [
  { bg: '#EFF6FF', border: '#3B82F6', badge: '#2563EB', text: '#1E3A8A', num: '1' },
  { bg: '#ECFDF5', border: '#10B981', badge: '#059669', text: '#064E3B', num: '2' },
  { bg: '#FFFBEB', border: '#F59E0B', badge: '#D97706', text: '#78350F', num: '3' },
  { bg: '#FDF2F8', border: '#EC4899', badge: '#DB2777', text: '#831843', num: '4' }
];

/**
 * Renderer for "match" questions:
 * Tap a word, then tap its meaning; matched pairs lock with a color.
 * All 4 pairs must be matched to submit.
 *
 * Throws a visible error if pairs are missing.
 */
export default function MatchRenderer({
  question,
  onSubmit,
  disabled = false,
  soundEnabled = true
}) {
  if (!question) return null;

  // Strict quality check
  if (!Array.isArray(question.pairs) || question.pairs.length === 0) {
    throw new Error(
      `MatchRenderer: question "${question.id || 'unknown'}" is missing required "pairs" array.`
    );
  }

  const [words, setWords] = useState(() => (question?.pairs ? question.pairs.map(p => p[0]) : []));
  const [meanings, setMeanings] = useState(() => (question?.pairs ? shuffle(question.pairs.map(p => p[1])) : []));
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedMeaning, setSelectedMeaning] = useState(null);
  // Map of word -> meaning
  const [matches, setMatches] = useState({});

  useEffect(() => {
    const wordList = question.pairs.map(p => p[0]);
    const meaningList = shuffle(question.pairs.map(p => p[1]));
    setWords(wordList);
    setMeanings(meaningList);
    setSelectedWord(null);
    setSelectedMeaning(null);
    setMatches({});
  }, [question.id]);

  const handleWordClick = (word) => {
    if (disabled) return;
    playPop(soundEnabled);

    if (selectedMeaning) {
      setMatches(prev => ({
        ...prev,
        [word]: selectedMeaning
      }));
      setSelectedWord(null);
      setSelectedMeaning(null);
    } else {
      setSelectedWord(prev => (prev === word ? null : word));
    }
  };

  const handleMeaningClick = (meaning) => {
    if (disabled) return;
    playPop(soundEnabled);

    if (selectedWord) {
      setMatches(prev => ({
        ...prev,
        [selectedWord]: meaning
      }));
      setSelectedWord(null);
      setSelectedMeaning(null);
    } else {
      setSelectedMeaning(prev => (prev === meaning ? null : meaning));
    }
  };

  const handleUnmatch = (word) => {
    if (disabled) return;
    playPop(soundEnabled);
    setMatches(prev => {
      const next = { ...prev };
      delete next[word];
      return next;
    });
  };

  const handleSubmit = () => {
    if (disabled || Object.keys(matches).length < question.pairs.length) return;
    onSubmit(matches);
  };

  const getPairStyle = (word) => {
    const matchedWords = Object.keys(matches);
    const pairIdx = matchedWords.indexOf(word);
    if (pairIdx !== -1) {
      return PAIR_COLORS[pairIdx % PAIR_COLORS.length];
    }
    return null;
  };

  const getWordForMeaning = (meaning) => {
    return Object.keys(matches).find(w => matches[w] === meaning);
  };

  const isComplete = Object.keys(matches).length === question.pairs.length;

  return (
    <div className="match-renderer-container">
      <div className="match-instruction-bar">
        <span>👉 Tap a word on the left, then tap its meaning on the right!</span>
      </div>

      <div className="match-columns-grid">
        {/* Words Column */}
        <div className="match-column words-column" role="group" aria-label="Vocabulary words">
          <h4 className="match-column-header">Vocabulary Word</h4>
          <div className="match-cards-stack">
            {words.map((word) => {
              const isSelected = selectedWord === word;
              const isPaired = Boolean(matches[word]);
              const style = getPairStyle(word);

              return (
                <button
                  key={word}
                  type="button"
                  className={`match-card-btn word-card ${isSelected ? 'card-selected' : ''} ${isPaired ? 'card-paired' : ''}`}
                  style={isPaired && style ? { backgroundColor: style.bg, borderColor: style.border } : {}}
                  disabled={disabled}
                  onClick={() => handleWordClick(word)}
                  aria-pressed={isSelected}
                  aria-label={`Word ${word}${isPaired ? ' (matched)' : ''}`}
                >
                  <span className="card-text-primary">{word}</span>
                  {isPaired && style && (
                    <span
                      className="pair-lock-badge"
                      style={{ backgroundColor: style.badge, color: '#FFFFFF' }}
                    >
                      Pair {style.num}
                    </span>
                  )}
                  {isPaired && !disabled && (
                    <span
                      className="card-unmatch-x"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnmatch(word);
                      }}
                      title="Undo match"
                    >
                      ✕
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meanings Column */}
        <div className="match-column meanings-column" role="group" aria-label="Word meanings">
          <h4 className="match-column-header">Meaning</h4>
          <div className="match-cards-stack">
            {meanings.map((meaning, idx) => {
              const isSelected = selectedMeaning === meaning;
              const matchedWord = getWordForMeaning(meaning);
              const isPaired = Boolean(matchedWord);
              const style = matchedWord ? getPairStyle(matchedWord) : null;

              return (
                <button
                  key={`${meaning}-${idx}`}
                  type="button"
                  className={`match-card-btn meaning-card ${isSelected ? 'card-selected' : ''} ${isPaired ? 'card-paired' : ''}`}
                  style={isPaired && style ? { backgroundColor: style.bg, borderColor: style.border } : {}}
                  disabled={disabled}
                  onClick={() => handleMeaningClick(meaning)}
                  aria-pressed={isSelected}
                  aria-label={`Meaning ${meaning}${isPaired ? ` (matched with ${matchedWord})` : ''}`}
                >
                  <span className="card-text-primary">{meaning}</span>
                  {isPaired && style && (
                    <span
                      className="pair-lock-badge"
                      style={{ backgroundColor: style.badge, color: '#FFFFFF' }}
                    >
                      Pair {style.num}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress & Submit Bar */}
      <div className="match-footer-bar">
        <span className="match-status-counter">
          {Object.keys(matches).length} of {question.pairs.length} pairs matched
        </span>
        <button
          type="button"
          className="primary-submit-btn check-matches-btn"
          disabled={disabled || !isComplete}
          onClick={handleSubmit}
        >
          Check Matches ✨
        </button>
      </div>
    </div>
  );
}
