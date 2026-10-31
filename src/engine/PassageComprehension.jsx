import React, { useState, useEffect } from 'react';
import { playPop } from '../utils/audio.js';
import { speakText, stopSpeaking } from '../utils/speech.js';

export default function PassageComprehension({
  question,
  onSubmit,
  disabled = false,
  soundEnabled = true
}) {
  const {
    passageTitle = 'Reading Passage',
    passage = '',
    options = []
  } = question.data || {};

  const [activeSentence, setActiveSentence] = useState(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);

  useEffect(() => {
    setActiveSentence(null);
    setIsPlayingAll(false);
    stopSpeaking();
  }, [question?.id]);

  const handleSelectOption = (choice) => {
    if (disabled) return;
    playPop(soundEnabled);
    stopSpeaking();
    onSubmit(choice);
  };

  const handleSentenceClick = (sentence) => {
    if (!sentence) return;
    playPop(soundEnabled);
    setIsPlayingAll(false);
    setActiveSentence(sentence.trim());
    speakText(sentence.trim());
  };

  const handleReadWholePassage = () => {
    if (!passage) return;
    playPop(soundEnabled);
    setActiveSentence(null);
    setIsPlayingAll(true);
    speakText(passage);
  };

  const handleStopSpeech = () => {
    stopSpeaking();
    setIsPlayingAll(false);
    setActiveSentence(null);
  };

  // Split passage into paragraphs and sentences
  const paragraphs = passage.split('\n\n').filter(Boolean);

  const splitIntoSentences = (text) => {
    const matches = text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g);
    return matches ? matches.map(s => s.trim()).filter(Boolean) : [text];
  };

  return (
    <div className="passage-comprehension-container">
      {/* Scrollable Passage Box */}
      <div className="passage-card-wrapper">
        <div className="passage-card-header">
          <div className="passage-title-group">
            <span className="passage-book-icon">📖</span>
            <h3 className="passage-card-title">{passageTitle}</h3>
          </div>

          <div className="passage-audio-controls">
            <button
              type="button"
              className={`passage-read-all-btn ${isPlayingAll ? 'audio-playing-pulse' : ''}`}
              onClick={handleReadWholePassage}
              title="Listen to the entire passage read aloud"
              aria-label="Read whole passage aloud"
            >
              <span>🔊</span>
              <span>Read Whole Story</span>
            </button>

            {(isPlayingAll || activeSentence) && (
              <button
                type="button"
                className="passage-stop-speech-btn"
                onClick={handleStopSpeech}
                title="Stop reading voice"
                aria-label="Stop reading"
              >
                ⏹️ Stop
              </button>
            )}
          </div>
        </div>

        <div className="passage-tap-hint-bar">
          💡 Tap any sentence in the story to hear it read aloud!
        </div>

        {/* Scrollable Story Text Body */}
        <div
          className="passage-scrollable-body"
          tabIndex={0}
          role="region"
          aria-label="Scrollable reading passage"
        >
          {paragraphs.map((para, pIdx) => {
            const sentences = splitIntoSentences(para);
            return (
              <p key={pIdx} className="passage-paragraph">
                {sentences.map((sent, sIdx) => {
                  const isActive = activeSentence === sent;
                  return (
                    <span
                      key={sIdx}
                      className={`passage-sentence ${isActive ? 'sentence-active-glow' : ''}`}
                      onClick={() => handleSentenceClick(sent)}
                      title="Tap to listen to this sentence"
                    >
                      {sent}{' '}
                    </span>
                  );
                })}
              </p>
            );
          })}
        </div>
      </div>

      {/* Answer Options Grid */}
      <div className="passage-question-section">
        <div className="passage-options-prompt">
          <span>Choose the correct answer:</span>
        </div>

        <div className="options-grid passage-options-grid" role="group" aria-label="Passage question choices">
          {options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              className="option-choice-btn passage-choice-btn"
              disabled={disabled}
              onClick={() => handleSelectOption(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
