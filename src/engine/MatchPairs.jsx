import React, { useState, useEffect } from 'react';
import { playPop } from '../utils/audio.js';
import { shuffle } from '../utils/mathHelpers.js';

const PAIR_COLORS = [
  { bg: '#EFF6FF', border: '#3B82F6', badge: '#2563EB', badgeText: '#FFFFFF', num: '1' },
  { bg: '#ECFDF5', border: '#10B981', badge: '#059669', badgeText: '#FFFFFF', num: '2' },
  { bg: '#FFFBEB', border: '#F59E0B', badge: '#D97706', badgeText: '#FFFFFF', num: '3' },
  { bg: '#FDF2F8', border: '#EC4899', badge: '#DB2777', badgeText: '#FFFFFF', num: '4' }
];

export default function MatchPairs({
  question,
  onSubmit,
  disabled = false,
  soundEnabled = true
}) {
  const { pairs = [] } = question.data || {};

  const [words, setWords] = useState([]);
  const [meanings, setMeanings] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedMeaning, setSelectedMeaning] = useState(null);
  // Map of word -> meaning
  const [matches, setMatches] = useState({});

  useEffect(() => {
    const wordList = pairs.map(p => p.word);
    const meaningList = shuffle(pairs.map(p => p.meaning));
    setWords(wordList);
    setMeanings(meaningList);
    setSelectedWord(null);
    setSelectedMeaning(null);
    setMatches({});
  }, [question?.id]);

  const handleWordClick = (word) => {
    if (disabled) return;
    playPop(soundEnabled);

    // If meaning is already selected, form a match immediately
    if (selectedMeaning) {
      setMatches(prev => ({
        ...prev,
        [word]: selectedMeaning
      }));
      setSelectedWord(null);
      setSelectedMeaning(null);
    } else {
      // Toggle word selection
      setSelectedWord(prev => (prev === word ? null : word));
    }
  };

  const handleMeaningClick = (meaning) => {
    if (disabled) return;
    playPop(soundEnabled);

    // If word is already selected, form a match immediately
    if (selectedWord) {
      setMatches(prev => ({
        ...prev,
        [selectedWord]: meaning
      }));
      setSelectedWord(null);
      setSelectedMeaning(null);
    } else {
      // Toggle meaning selection
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
    if (disabled || Object.keys(matches).length < pairs.length) return;
    onSubmit(matches);
  };

  // Find color index for a matched pair
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

  const isComplete = Object.keys(matches).length === pairs.length;

  return (
    <div className="match-pairs-container">
      <div className="match-pairs-instruction-bar">
        <span>Tap a word on the left, then tap its meaning on the right to connect them!</span>
      </div>

      <div className="match-columns-grid">
        {/* Left Column: Words */}
        <div className="match-column words-column" role="group" aria-label="Vocabulary words">
          <h3 className="column-title">Vocabulary Word</h3>
          <div className="match-cards-list">
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
                  aria-label={`Word ${word}${isPaired ? ' (matched)' : ''}`}
                >
                  <span className="card-main-text">{word}</span>
                  {isPaired && style && (
                    <span
                      className="pair-number-badge"
                      style={{ backgroundColor: style.badge, color: style.badgeText }}
                    >
                      Pair {style.num}
                    </span>
                  )}
                  {isPaired && !disabled && (
                    <span
                      className="card-unpair-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnmatch(word);
                      }}
                      title="Unmatch"
                    >
                      ✕
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Meanings */}
        <div className="match-column meanings-column" role="group" aria-label="Word meanings">
          <h3 className="column-title">Meaning / Definition</h3>
          <div className="match-cards-list">
            {meanings.map((meaning, idx) => {
              const isSelected = selectedMeaning === meaning;
              const matchedWord = getWordForMeaning(meaning);
              const isPaired = Boolean(matchedWord);
              const style = matchedWord ? getPairStyle(matchedWord) : null;

              return (
                <button
                  key={idx}
                  type="button"
                  className={`match-card-btn meaning-card ${isSelected ? 'card-selected' : ''} ${isPaired ? 'card-paired' : ''}`}
                  style={isPaired && style ? { backgroundColor: style.bg, borderColor: style.border } : {}}
                  disabled={disabled}
                  onClick={() => handleMeaningClick(meaning)}
                  aria-label={`Meaning: ${meaning}${isPaired ? ` (matched with ${matchedWord})` : ''}`}
                >
                  <span className="card-main-text">{meaning}</span>
                  {isPaired && style && (
                    <span
                      className="pair-number-badge"
                      style={{ backgroundColor: style.badge, color: style.badgeText }}
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

      {/* Progress & Submit */}
      <div className="match-footer-bar">
        <span className="matched-counter">
          {Object.keys(matches).length} of {pairs.length} pairs connected
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
