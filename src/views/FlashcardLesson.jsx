import React, { useState, useEffect, useRef } from 'react';
import PracticeHeader from '../components/PracticeHeader.jsx';
import Mascot from '../components/Mascot.jsx';
import ConfettiCanvas from '../components/ConfettiCanvas.jsx';
import MatchRenderer from '../engine/MatchRenderer.jsx';
import { playPop, playSuccessSound, playGentleWrongSound } from '../utils/audio.js';
import { isSpeechSupported, speakText, speakCardSequence, stopSpeaking } from '../utils/speech.js';
import { shuffle } from '../utils/mathHelpers.js';
import { recordSessionCompletion } from '../player/playerStorage.js';

/**
 * Tokenize a sentence into alternating word and separator spans,
 * tracking character offsets (for TTS onboundary sync) and flagging
 * target words to highlight in red.
 */
export function tokenizeExampleSentence(sentence, highlightTargets = []) {
  const text = String(sentence || '');
  if (!text) return { tokens: [], wordStarts: [] };

  const targetSet = new Set(
    (highlightTargets || []).map((w) => String(w || '').trim().toLowerCase()).filter(Boolean)
  );

  const tokens = [];
  const wordStarts = [];
  const wordRegex = /[A-Za-z0-9']+/g;
  let lastIdx = 0;
  let match;

  while ((match = wordRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      tokens.push({ type: 'sep', text: text.slice(lastIdx, match.index) });
    }
    const wordText = match[0];
    const wordIndex = wordStarts.length;
    wordStarts.push(match.index);
    tokens.push({
      type: 'word',
      text: wordText,
      wordIndex,
      start: match.index,
      isTarget: targetSet.has(wordText.toLowerCase())
    });
    lastIdx = match.index + wordText.length;
  }

  if (lastIdx < text.length) {
    tokens.push({ type: 'sep', text: text.slice(lastIdx) });
  }

  return { tokens, wordStarts };
}

function getCardHighlightTargets(card) {
  if (!card) return [];
  if (Array.isArray(card.highlightWords) && card.highlightWords.length > 0) {
    return card.highlightWords;
  }
  if (card.word) return [card.word];
  return [];
}

function HighlightedSentence({ sentence, targets, isSpeaking, activeWordIndex }) {
  const { tokens } = tokenizeExampleSentence(sentence, targets);
  return (
    <span className="flashcard-sentence-inline">
      {tokens.map((tok, i) => {
        if (tok.type !== 'word') {
          return <React.Fragment key={i}>{tok.text}</React.Fragment>;
        }
        const isSpoken = isSpeaking && tok.wordIndex === activeWordIndex;
        const classNames = ['sentence-word-token'];
        if (tok.isTarget) classNames.push('blend-red-highlight', 'sentence-target-word');
        if (isSpoken) classNames.push('spoken-word-active');
        return (
          <span key={i} className={classNames.join(' ')}>
            {tok.text}
          </span>
        );
      })}
    </span>
  );
}

export default function FlashcardLesson({
  player,
  termId = 'q2',
  subject,
  topic,
  settings,
  onToggleSound,
  onToggleSpokenPraise,
  onChangePlayer,
  onNavigateParent,
  onFinishSession,
  onExit
}) {
  const lesson = topic?.lessonData || {};
  const cards = lesson.cards || [];
  const activity = lesson.activity || null;

  const soundEnabled = settings?.soundEnabled !== false;
  const spokenPraiseEnabled = settings?.spokenPraiseEnabled !== false;
  const playerName = player?.name || 'Friend';

  const [phase, setPhase] = useState('cards'); // 'cards' | 'activity'
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speakingPart, setSpeakingPart] = useState(null); // 'word' | 'explanation' | 'example' | 'examples' | 'wordList' | null
  const [spokenWordIndex, setSpokenWordIndex] = useState(-1);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [mascotMood, setMascotMood] = useState('idle');

  // Swipe tracking refs
  const touchStartX = useRef(null);
  const swipedRecently = useRef(false);

  const clearSpeechState = () => {
    stopSpeaking();
    setSpeakingPart(null);
    setSpokenWordIndex(-1);
  };

  // Reset when topic changes
  useEffect(() => {
    setPhase('cards');
    setCardIndex(0);
    setIsFlipped(false);
    setMascotMood('idle');
    clearSpeechState();
    return () => stopSpeaking();
  }, [topic?.id]);

  // Hide 🔊 speech button automatically if Web Speech API is unavailable
  useEffect(() => {
    setSpeechSupported(isSpeechSupported());
  }, []);

  const currentCard = cards[cardIndex] || cards[0];
  const totalCards = cards.length;

  const goToCard = (nextIdx) => {
    if (nextIdx < 0 || nextIdx >= totalCards) return;
    playPop(soundEnabled);
    clearSpeechState();
    setCardIndex(nextIdx);
    setIsFlipped(false);
  };

  const handleCardFlip = () => {
    if (swipedRecently.current) {
      swipedRecently.current = false;
      return;
    }
    playPop(soundEnabled);
    clearSpeechState();
    setIsFlipped((prev) => !prev);
  };

  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || !e.changedTouches || e.changedTouches.length === 0) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 48) {
      swipedRecently.current = true;
      if (dx < 0 && cardIndex + 1 < totalCards) {
        goToCard(cardIndex + 1);
      } else if (dx > 0 && cardIndex > 0) {
        goToCard(cardIndex - 1);
      }
    }
  };

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse') {
      touchStartX.current = e.clientX;
    }
  };

  const handlePointerUp = (e) => {
    if (e.pointerType === 'mouse' && touchStartX.current !== null) {
      const dx = e.clientX - touchStartX.current;
      touchStartX.current = null;
      if (Math.abs(dx) > 55) {
        swipedRecently.current = true;
        if (dx < 0 && cardIndex + 1 < totalCards) {
          goToCard(cardIndex + 1);
        } else if (dx > 0 && cardIndex > 0) {
          goToCard(cardIndex - 1);
        }
      }
    }
  };

  const handleSpeakCard = (e) => {
    e.stopPropagation();
    if (!currentCard || !speechSupported) return;

    const parts = [];
    const wordOrTitle = isFlipped
      ? currentCard.word || currentCard.backTitle || currentCard.frontTitle
      : currentCard.word || currentCard.frontTitle;

    if (wordOrTitle) {
      parts.push({ id: 'word', text: wordOrTitle });
    }

    if (isFlipped && currentCard.explanation) {
      parts.push({ id: 'explanation', text: currentCard.explanation });
    }

    if (currentCard.example) {
      const { wordStarts } = tokenizeExampleSentence(
        currentCard.example,
        getCardHighlightTargets(currentCard)
      );
      parts.push({
        id: 'example',
        text: currentCard.example,
        trackWords: true,
        wordStarts
      });
    }

    if (isFlipped && Array.isArray(currentCard.examples) && currentCard.examples.length > 0) {
      parts.push({ id: 'examples', text: currentCard.examples.join('. ') });
    }

    if (currentCard.kind === 'wordList') {
      const allWords = [
        ...(currentCard.words || []),
        ...(currentCard.extraWords || [])
      ];
      if (allWords.length > 0) {
        const joined = allWords.join(', ');
        const { wordStarts } = tokenizeExampleSentence(joined, []);
        parts.push({
          id: 'wordList',
          text: joined,
          trackWords: true,
          wordStarts
        });
      }
    }

    speakCardSequence(parts, {
      lang: 'en-US',
      rate: 0.85,
      onPartStart: (partId) => {
        setSpeakingPart(partId);
        setSpokenWordIndex(-1);
      },
      onWordIndex: (partId, wordIdx) => {
        setSpeakingPart(partId);
        setSpokenWordIndex(wordIdx);
      },
      onEnd: () => {
        setSpeakingPart(null);
        setSpokenWordIndex(-1);
      }
    });
  };

  const startActivityPhase = () => {
    playPop(soundEnabled);
    clearSpeechState();
    setPhase('activity');
    setMascotMood('idle');
  };

  const completeLessonSession = (earnedStars, totalPossible, results = []) => {
    if (player?.id) {
      const safeResults =
        results.length > 0
          ? results
          : Array.from({ length: totalPossible || 1 }, (_, idx) => ({
              firstTry: idx < earnedStars,
              secondTry: false
            }));
      recordSessionCompletion(player.id, topic.id, earnedStars, safeResults, termId);
    }
    onFinishSession({
      stars: earnedStars,
      score: earnedStars,
      total: totalPossible || earnedStars || 1,
      maxStreak: earnedStars,
      termId,
      subject,
      topic,
      level: 1,
      isLesson: true
    });
  };

  const renderCardFront = (card) => {
    if (!card) return null;

    const targets = getCardHighlightTargets(card);
    const isWordSpeaking = !isFlipped && speakingPart === 'word';
    const isExampleSpeaking = !isFlipped && speakingPart === 'example';

    const renderFrontExample = () =>
      card.example ? (
        <div
          className={`flashcard-front-example-box ${isExampleSpeaking ? 'flashcard-sentence-speaking' : ''}`}
        >
          <p className="flashcard-front-example-text">
            <HighlightedSentence
              sentence={card.example}
              targets={targets}
              isSpeaking={isExampleSpeaking}
              activeWordIndex={spokenWordIndex}
            />
          </p>
        </div>
      ) : null;

    if (card.kind === 'blend') {
      return (
        <div className="flashcard-face-inner">
          {card.groupLabel && <span className="flashcard-category-pill">{card.groupLabel}</span>}
          <div className="flashcard-big-emoji" aria-hidden="true">{card.emoji}</div>
          <div className={`flashcard-blend-word ${isWordSpeaking ? 'flashcard-word-speaking' : ''}`}>
            <span>{card.prefix || ''}</span>
            <span className="blend-red-highlight">{card.blend}</span>
            <span>{card.suffix || ''}</span>
          </div>
          {renderFrontExample()}
          <span className="flashcard-tap-hint">Tap card to flip ↺</span>
        </div>
      );
    }

    if (card.kind === 'vocab') {
      return (
        <div className="flashcard-face-inner">
          <span className="flashcard-category-pill pill-vocab">Power Word</span>
          <div className="flashcard-big-emoji" aria-hidden="true">{card.emoji}</div>
          <div className={`flashcard-vocab-word ${isWordSpeaking ? 'flashcard-word-speaking' : ''}`}>
            {card.word}
          </div>
          {renderFrontExample()}
          <span className="flashcard-tap-hint">Tap card to see meaning ↺</span>
        </div>
      );
    }

    if (card.kind === 'wordList') {
      const coreCount = (card.words || []).length;
      const isListSpeaking = !isFlipped && speakingPart === 'wordList';
      return (
        <div className="flashcard-face-inner flashcard-wordlist-inner">
          <span className="flashcard-category-pill pill-list">Spelling Words List</span>
          <div className={`flashcard-list-heading ${isWordSpeaking ? 'flashcard-word-speaking' : ''}`}>
            <span>{card.emoji}</span> {card.frontTitle}
          </div>
          {renderFrontExample()}
          <div className="spelling-chips-grid">
            {(card.words || []).map((w, idx) => (
              <span
                key={w}
                className={`spelling-word-chip ${isListSpeaking && spokenWordIndex === idx ? 'chip-speaking' : ''}`}
              >
                {w}
              </span>
            ))}
          </div>
          {Array.isArray(card.extraWords) && card.extraWords.length > 0 && (
            <div className="extra-review-box">
              <span className="extra-review-label">Extra Review Words:</span>
              <div className="extra-chips-row">
                {card.extraWords.map((w, idx) => (
                  <span
                    key={w}
                    className={`spelling-extra-chip ${isListSpeaking && spokenWordIndex === coreCount + idx ? 'chip-speaking' : ''}`}
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}
          <span className="flashcard-tap-hint">Tap card for reading tip ↺</span>
        </div>
      );
    }

    // Intro or Rule card
    return (
      <div className="flashcard-face-inner">
        <span className="flashcard-category-pill pill-rule">
          {card.kind === 'intro' ? 'Lesson Guide' : 'Grammar Rule'}
        </span>
        <div className="flashcard-big-emoji flashcard-emoji-wide" aria-hidden="true">
          {card.emoji}
        </div>
        <h2 className={`flashcard-front-title ${isWordSpeaking ? 'flashcard-word-speaking' : ''}`}>
          {card.frontTitle}
        </h2>
        {renderFrontExample()}
        {card.frontHint && <p className="flashcard-front-sub">{card.frontHint}</p>}
        <span className="flashcard-tap-hint">Tap card to flip ↺</span>
      </div>
    );
  };

  const renderCardBack = (card) => {
    if (!card) return null;

    const targets = getCardHighlightTargets(card);
    const isWordSpeaking = isFlipped && speakingPart === 'word';
    const isMeaningSpeaking = isFlipped && speakingPart === 'explanation';
    const isExampleSpeaking = isFlipped && speakingPart === 'example';
    const isExamplesSpeaking = isFlipped && speakingPart === 'examples';
    const isListSpeaking = isFlipped && speakingPart === 'wordList';

    return (
      <div className="flashcard-face-inner flashcard-back-inner">
        <div className={`flashcard-back-top ${isWordSpeaking ? 'flashcard-word-speaking' : ''}`}>
          <span className="flashcard-back-emoji" aria-hidden="true">{card.emoji}</span>
          <h3 className="flashcard-back-title">
            {card.kind === 'blend' ? (
              <>
                <span>{card.prefix || ''}</span>
                <span className="blend-red-highlight">{card.blend}</span>
                <span>{card.suffix || ''}</span>
              </>
            ) : (
              card.word || card.backTitle || card.frontTitle
            )}
          </h3>
        </div>

        <div className={`flashcard-meaning-box ${isMeaningSpeaking ? 'flashcard-sentence-speaking' : ''}`}>
          <p className="flashcard-meaning-text">{card.explanation}</p>
        </div>

        {card.example && (
          <div className={`flashcard-example-box ${isExampleSpeaking ? 'flashcard-sentence-speaking' : ''}`}>
            <span className="flashcard-box-label">Example:</span>
            <p className="flashcard-example-text">
              <HighlightedSentence
                sentence={card.example}
                targets={targets}
                isSpeaking={isExampleSpeaking}
                activeWordIndex={spokenWordIndex}
              />
            </p>
          </div>
        )}

        {Array.isArray(card.examples) && card.examples.length > 0 && (
          <div className={`flashcard-examples-list ${isExamplesSpeaking ? 'flashcard-sentence-speaking' : ''}`}>
            {card.examples.map((ex, i) => (
              <div key={i} className="flashcard-example-row">
                {ex}
              </div>
            ))}
          </div>
        )}

        {card.kind === 'wordList' && (
          <div className={`flashcard-example-box ${isListSpeaking ? 'flashcard-sentence-speaking' : ''}`}>
            <span className="flashcard-box-label">Core + Extra Words:</span>
            <p className="flashcard-example-text">
              {[...(card.words || []), ...(card.extraWords || [])].join(' • ')}
            </p>
          </div>
        )}

        {card.tip && (
          <div className="flashcard-tip-pill">
            <span>💡 Tip: {card.tip}</span>
          </div>
        )}

        <span className="flashcard-tap-hint">Tap card to flip back ↺</span>
      </div>
    );
  };

  return (
    <div className="practice-session-view flashcard-lesson-view">
      <ConfettiCanvas trigger={confettiTrigger} />

      <PracticeHeader
        player={player}
        settings={settings}
        onToggleSound={onToggleSound}
        onToggleSpokenPraise={onToggleSpokenPraise}
        onChangePlayer={onChangePlayer}
        onNavigateParent={onNavigateParent}
        onExit={() => onExit(termId, subject?.id)}
        subjectTitle={subject?.title}
      />

      {phase === 'cards' ? (
        <div className="flashcard-stage-wrapper">
          {/* Header & Progress */}
          <div className="flashcard-lesson-top">
            <div className="flashcard-lesson-badge">
              <span>{topic?.icon}</span>
              <span>{topic?.title}</span>
            </div>
            <div className="flashcard-card-counter" aria-live="polite">
              Card {cardIndex + 1} of {totalCards}
            </div>
          </div>

          {/* Clickable Progress Dots */}
          <div className="flashcard-dots-row" role="tablist" aria-label="Lesson flashcards">
            {cards.map((c, idx) => (
              <button
                key={c.id || idx}
                type="button"
                role="tab"
                aria-selected={idx === cardIndex}
                aria-label={`Card ${idx + 1} of ${totalCards}`}
                className={`flashcard-dot-btn ${idx === cardIndex ? 'dot-active' : idx < cardIndex ? 'dot-seen' : ''}`}
                onClick={() => goToCard(idx)}
              />
            ))}
          </div>

          {/* Swipeable Flip Flashcard */}
          <div
            className={`flashcard-card ${isFlipped ? 'flashcard-is-flipped' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={isFlipped ? 'Flashcard back. Tap to flip to front.' : 'Flashcard front. Tap to flip to back.'}
            onClick={handleCardFlip}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardFlip();
              }
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            {speechSupported && (
              <button
                type="button"
                className={`flashcard-speech-btn ${speakingPart ? 'flashcard-speech-active' : ''}`}
                onClick={handleSpeakCard}
                title="Listen aloud"
                aria-label="Read card aloud"
              >
                🔊
              </button>
            )}

            {isFlipped ? renderCardBack(currentCard) : renderCardFront(currentCard)}
          </div>

          {/* Next / Back Buttons */}
          <div className="flashcard-nav-controls">
            <button
              type="button"
              className="flashcard-nav-btn btn-card-back"
              disabled={cardIndex === 0}
              onClick={() => goToCard(cardIndex - 1)}
            >
              ⬅ Back
            </button>

            {cardIndex + 1 < totalCards ? (
              <button
                type="button"
                className="flashcard-nav-btn btn-card-next"
                onClick={() => goToCard(cardIndex + 1)}
              >
                Next ➡
              </button>
            ) : activity ? (
              <button
                type="button"
                className="flashcard-nav-btn btn-card-activity"
                onClick={startActivityPhase}
              >
                {activity.title} 🎯
              </button>
            ) : (
              <button
                type="button"
                className="flashcard-nav-btn btn-card-activity"
                onClick={() => completeLessonSession(totalCards, totalCards)}
              >
                Finish Lesson 🏆
              </button>
            )}
          </div>

          {activity && cardIndex + 1 < totalCards && (
            <div className="flashcard-skip-row">
              <button
                type="button"
                className="flashcard-skip-btn"
                onClick={startActivityPhase}
              >
                Jump to Mini-Activity: {activity.title} 🎯
              </button>
            </div>
          )}
        </div>
      ) : (
        <MiniActivityRunner
          activity={activity}
          playerName={playerName}
          soundEnabled={soundEnabled}
          spokenPraiseEnabled={spokenPraiseEnabled}
          speechSupported={speechSupported}
          onBackToCards={() => setPhase('cards')}
          onCelebrate={() => {
            setConfettiTrigger(Date.now());
            setMascotMood('celebrating');
          }}
          onFeedbackMood={(mood) => setMascotMood(mood)}
          onComplete={completeLessonSession}
        />
      )}

      <div className="session-mascot-footer">
        <Mascot mood={mascotMood} size={60} />
      </div>
    </div>
  );
}

/* ============================================================================
   Mini-Activity Runner for Week 1 (Sort it!, Match it!, Add -s/-es?, Fix it!)
   ============================================================================ */
function MiniActivityRunner({
  activity,
  playerName,
  soundEnabled,
  spokenPraiseEnabled,
  speechSupported,
  onBackToCards,
  onCelebrate,
  onFeedbackMood,
  onComplete
}) {
  if (!activity) return null;

  return (
    <div className="mini-activity-card">
      <div className="mini-activity-header">
        <button type="button" className="mini-back-cards-btn" onClick={onBackToCards}>
          ⬅ Cards
        </button>
        <div className="mini-activity-title-group">
          <span className="mini-activity-pill">Mini-Activity</span>
          <h2 className="mini-activity-title">{activity.title}</h2>
        </div>
      </div>

      <p className="mini-activity-instruction">{activity.instruction}</p>

      {activity.type === 'sort_buckets' && (
        <SortBucketsActivity
          activity={activity}
          playerName={playerName}
          soundEnabled={soundEnabled}
          speechSupported={speechSupported}
          onCelebrate={onCelebrate}
          onFeedbackMood={onFeedbackMood}
          onComplete={onComplete}
        />
      )}

      {activity.type === 'match_pairs' && (
        <MatchPairsActivity
          activity={activity}
          playerName={playerName}
          soundEnabled={soundEnabled}
          onCelebrate={onCelebrate}
          onFeedbackMood={onFeedbackMood}
          onComplete={onComplete}
        />
      )}

      {(activity.type === 'tap_plural' || activity.type === 'fix_sentence') && (
        <TapQuizMiniActivity
          activity={activity}
          playerName={playerName}
          soundEnabled={soundEnabled}
          spokenPraiseEnabled={spokenPraiseEnabled}
          speechSupported={speechSupported}
          onCelebrate={onCelebrate}
          onFeedbackMood={onFeedbackMood}
          onComplete={onComplete}
        />
      )}
    </div>
  );
}

/* 1. Lesson 1: Sort it! (L blends / R blends / S blends) - Tap OR Drag */
function SortBucketsActivity({
  activity,
  playerName,
  soundEnabled,
  speechSupported,
  onCelebrate,
  onFeedbackMood,
  onComplete
}) {
  const [unsorted, setUnsorted] = useState(() => shuffle([...(activity.items || [])]));
  const [placed, setPlaced] = useState({ L: [], R: [], S: [] });
  const [selectedWord, setSelectedWord] = useState(null);
  const [draggedWord, setDraggedWord] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [firstTryWrongWords, setFirstTryWrongWords] = useState(() => new Set());

  const totalItems = (activity.items || []).length;
  const placedCount = totalItems - unsorted.length;
  const isFinished = unsorted.length === 0;

  const tryPlaceInBucket = (wordObj, bucketId) => {
    if (!wordObj) return;

    if (wordObj.bucket === bucketId) {
      playSuccessSound(soundEnabled);
      onFeedbackMood('celebrating');
      setUnsorted((prev) => prev.filter((item) => item.word !== wordObj.word));
      setPlaced((prev) => ({
        ...prev,
        [bucketId]: [...(prev[bucketId] || []), wordObj]
      }));
      setSelectedWord(null);
      setDraggedWord(null);
      setFeedback({
        ok: true,
        text: `✅ Great job, ${playerName}! "${wordObj.word}" goes in ${bucketId} blends!`
      });
      if (unsorted.length === 1) {
        onCelebrate();
      }
    } else {
      playGentleWrongSound(soundEnabled);
      onFeedbackMood('thinking');
      setFirstTryWrongWords((prev) => {
        const next = new Set(prev);
        next.add(wordObj.word);
        return next;
      });
      setFeedback({
        ok: false,
        text: `❌ Try again! Look at the blend letters in "${wordObj.word}".`
      });
    }
  };

  const firstTryWins = totalItems - firstTryWrongWords.size;

  return (
    <div className="sort-buckets-activity">
      {/* Unsorted Word Bank */}
      {!isFinished ? (
        <div className="sort-words-rack" aria-label="Words to sort">
          {unsorted.map((item) => {
            const isSelected = selectedWord?.word === item.word;
            return (
              <button
                key={item.word}
                type="button"
                draggable
                className={`sort-word-chip ${isSelected ? 'chip-selected' : ''}`}
                onClick={() => {
                  playPop(soundEnabled);
                  setSelectedWord(isSelected ? null : item);
                  if (speechSupported) {
                    speakText(item.word, { lang: 'en-US', rate: 0.85 });
                  }
                }}
                onDragStart={() => {
                  setDraggedWord(item);
                  setSelectedWord(item);
                }}
                onDragEnd={() => setDraggedWord(null)}
              >
                <span>{item.emoji}</span>
                <span>{item.word}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="sort-complete-banner">
          🎉 You sorted all {totalItems} blend words!
        </div>
      )}

      {selectedWord && !isFinished && (
        <div className="sort-selected-hint">
          Now tap the matching box below for <strong>{selectedWord.word}</strong>!
        </div>
      )}

      {/* 3 Target Boxes */}
      <div className="sort-boxes-grid">
        {(activity.buckets || []).map((bucket) => {
          const itemsInBox = placed[bucket.id] || [];
          return (
            <button
              key={bucket.id}
              type="button"
              className={`sort-bucket-box bucket-${bucket.id.toLowerCase()} ${selectedWord ? 'bucket-ready' : ''}`}
              onClick={() => {
                if (selectedWord) {
                  tryPlaceInBucket(selectedWord, bucket.id);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedWord || selectedWord) {
                  tryPlaceInBucket(draggedWord || selectedWord, bucket.id);
                }
              }}
            >
              <div className="bucket-header">
                <span className="bucket-emoji">{bucket.emoji}</span>
                <span className="bucket-title">{bucket.label}</span>
              </div>
              <span className="bucket-sub">{bucket.hint}</span>
              <div className="bucket-placed-list">
                {itemsInBox.map((p) => (
                  <span key={p.word} className="bucket-placed-pill">
                    {p.emoji} {p.word}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className={`mini-feedback-box ${feedback.ok ? 'mini-ok' : 'mini-retry'}`}>
          {feedback.text}
        </div>
      )}

      <div className="mini-progress-footer">
        <span>{placedCount} of {totalItems} sorted</span>
        {isFinished && (
          <button
            type="button"
            className="primary-submit-btn sticky-action-btn"
            onClick={() => {
              const results = (activity.items || []).map((it) => ({
                firstTry: !firstTryWrongWords.has(it.word),
                secondTry: firstTryWrongWords.has(it.word)
              }));
              onComplete(Math.max(1, firstTryWins), totalItems, results);
            }}
          >
            Finish Lesson 🏆
          </button>
        )}
      </div>
    </div>
  );
}

/* 2. Lesson 2: Match it! (Reuses shared MatchRenderer!) */
function MatchPairsActivity({
  activity,
  playerName,
  soundEnabled,
  onCelebrate,
  onFeedbackMood,
  onComplete
}) {
  const [roundNum, setRoundNum] = useState(1);
  const [pairs, setPairs] = useState(() =>
    shuffle([...(activity.allPairs || [])]).slice(0, activity.pairCount || 4)
  );
  const [isMatchedDone, setIsMatchedDone] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);

  const handleMatchSubmit = (userMatches) => {
    setAttempts((a) => a + 1);
    const allCorrect = pairs.every(([word, meaning]) => userMatches[word] === meaning);
    if (allCorrect) {
      playSuccessSound(soundEnabled);
      onCelebrate();
      setIsMatchedDone(true);
      setFeedback({
        ok: true,
        text: `✅ Fantastic, ${playerName}! You matched all 4 Power Words!`
      });
    } else {
      playGentleWrongSound(soundEnabled);
      onFeedbackMood('thinking');
      setFeedback({
        ok: false,
        text: '❌ One or more pairs do not match yet. Tap any pair to adjust and check again!'
      });
    }
  };

  const handleNewFourWords = () => {
    playPop(soundEnabled);
    setRoundNum((r) => r + 1);
    setPairs(shuffle([...(activity.allPairs || [])]).slice(0, activity.pairCount || 4));
    setIsMatchedDone(false);
    setFeedback(null);
  };

  return (
    <div className="match-mini-activity">
      <MatchRenderer
        question={{ id: `pw-match-${roundNum}`, type: 'match', pairs }}
        onSubmit={handleMatchSubmit}
        disabled={isMatchedDone}
        soundEnabled={soundEnabled}
      />

      {feedback && (
        <div className={`mini-feedback-box ${feedback.ok ? 'mini-ok' : 'mini-retry'}`}>
          {feedback.text}
        </div>
      )}

      {isMatchedDone && (
        <div className="mini-complete-actions">
          <button type="button" className="flashcard-nav-btn btn-card-back" onClick={handleNewFourWords}>
            🔄 Match 4 More Words
          </button>
          <button
            type="button"
            className="primary-submit-btn sticky-action-btn"
            onClick={() => {
              const firstTryBonus = attempts <= 1;
              const results = pairs.map(() => ({ firstTry: firstTryBonus, secondTry: !firstTryBonus }));
              onComplete(4, 4, results);
            }}
          >
            Finish Lesson 🏆
          </button>
        </div>
      )}
    </div>
  );
}

/* 3 & 4. Lesson 3 ("Add -s or -es?") & Lesson 4 ("Fix the sentence!") */
function TapQuizMiniActivity({
  activity,
  playerName,
  soundEnabled,
  spokenPraiseEnabled,
  speechSupported,
  onCelebrate,
  onFeedbackMood,
  onComplete
}) {
  const [items] = useState(() =>
    (activity.items || []).map((item) => ({
      ...item,
      options: shuffle([...(item.options || [])])
    }))
  );
  const [idx, setIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState([]);
  const [hadMissOnCurrent, setHadMissOnCurrent] = useState(false);

  const current = items[idx];
  if (!current) return null;
  const isSolved = Boolean(feedback?.ok);

  const handleOptionTap = (opt) => {
    if (isSolved) return;
    playPop(soundEnabled);
    setSelectedOpt(opt);

    if (opt === current.answer) {
      playSuccessSound(soundEnabled);
      onFeedbackMood('celebrating');
      if (idx + 1 === items.length) {
        onCelebrate();
      }
      setFeedback({
        ok: true,
        text: `✅ Way to go, ${playerName}! ${current.explanation}`
      });
      if (spokenPraiseEnabled && speechSupported) {
        speakText(opt, { lang: 'en-US', rate: 0.85 });
      }
      setResults((prev) => [
        ...prev,
        { firstTry: !hadMissOnCurrent, secondTry: hadMissOnCurrent }
      ]);
    } else {
      playGentleWrongSound(soundEnabled);
      onFeedbackMood('thinking');
      setHadMissOnCurrent(true);
      setFeedback({
        ok: false,
        text: '❌ Try again! Say the sentence/rule out loud carefully.'
      });
    }
  };

  const handleNext = () => {
    if (idx + 1 < items.length) {
      playPop(soundEnabled);
      setIdx((i) => i + 1);
      setSelectedOpt(null);
      setFeedback(null);
      setHadMissOnCurrent(false);
    } else {
      const score = results.filter((r) => r.firstTry).length;
      onComplete(Math.max(1, score), items.length, results);
    }
  };

  return (
    <div className="tap-mini-activity">
      <div className="mini-step-badge">
        Item {idx + 1} of {items.length}
      </div>

      {activity.type === 'tap_plural' ? (
        <div className="mini-prompt-card">
          {speechSupported && (
            <button
              type="button"
              className="mini-listen-pill"
              onClick={() => speakText(`What is the plural of ${current.singular}?`, { lang: 'en-US', rate: 0.85 })}
              aria-label="Listen"
            >
              🔊
            </button>
          )}
          <div className="mini-plural-picture">{current.picture}</div>
          <div className="mini-plural-question">
            What is the plural of <strong>{current.singular}</strong>?
          </div>
          <div className="mini-plural-word">
            One: <strong>{current.singular}</strong> → Many: <strong>___</strong>
          </div>
        </div>
      ) : (
        <div className="mini-prompt-card">
          {speechSupported && (
            <button
              type="button"
              className="mini-listen-pill"
              onClick={() => speakText(`Fix the sentence: ${current.wrongSentence}`, { lang: 'en-US', rate: 0.85 })}
              aria-label="Listen"
            >
              🔊
            </button>
          )}
          <span className="wrong-sentence-tag">Wrong Sentence ❌</span>
          <div className="wrong-sentence-text">{current.wrongSentence}</div>
        </div>
      )}

      <div className="choice-options-grid choice-options-1col">
        {(current.options || []).map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={isSolved}
            className={`choice-option-btn ${selectedOpt === opt ? 'choice-option-selected' : ''}`}
            onClick={() => handleOptionTap(opt)}
          >
            <span className="choice-option-label">{opt}</span>
          </button>
        ))}
      </div>

      {feedback && (
        <div className={`mini-feedback-box ${feedback.ok ? 'mini-ok' : 'mini-retry'}`}>
          {feedback.text}
        </div>
      )}

      {isSolved && (
        <div className="practice-sticky-bottom-bar">
          <button
            type="button"
            className="next-question-btn sticky-action-btn"
            onClick={handleNext}
          >
            {idx + 1 < items.length ? 'Next ➡' : 'Finish Lesson 🏆'}
          </button>
        </div>
      )}
    </div>
  );
}
