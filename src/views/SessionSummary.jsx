import React, { useEffect, useState } from 'react';
import Mascot from '../components/Mascot.jsx';
import ConfettiCanvas from '../components/ConfettiCanvas.jsx';
import { getFeedback } from '../feedback/feedbackManager.js';
import { playCelebrationFanfare } from '../utils/audio.js';
import { speakText } from '../utils/speech.js';

export default function SessionSummary({
  summaryData,
  player,
  settings,
  onPlayAgain,
  onPracticeMissed,
  onBackToSubject,
  onBackToHome
}) {
  const { stars, score, total = 10, missedQuestions = [] } = summaryData;
  const playerName = player?.name || 'Friend';
  const soundEnabled = settings?.soundEnabled !== false;
  const spokenPraiseEnabled = settings?.spokenPraiseEnabled !== false;

  const [message, setMessage] = useState('');
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const isPerfect = score === total;
  const pct = total > 0 ? score / total : 1;
  const starTier = pct >= 0.8 ? '⭐⭐⭐' : pct >= 0.5 ? '⭐⭐' : '⭐';

  useEffect(() => {
    playCelebrationFanfare(soundEnabled);
    setConfettiTrigger(Date.now());

    const summaryMsg = isPerfect
      ? getFeedback('perfectSession', playerName)
      : getFeedback('sessionEnd', playerName, { n: stars, stars });

    setMessage(summaryMsg);

    if (spokenPraiseEnabled) {
      speakText(summaryMsg);
    }
  }, []);

  return (
    <div className="session-summary-container">
      <ConfettiCanvas trigger={confettiTrigger} />

      <div className="summary-card">
        {/* Mascot celebrating */}
        <div className="summary-mascot-box">
          <Mascot mood="celebrating" size={130} />
        </div>

        <h1 className="summary-title">
          {isPerfect ? '🌟 Superb Perfect Score! 🌟' : 'Awesome Effort! 👏'}
        </h1>

        <p className="summary-personalized-msg">{message}</p>

        {/* Stars Earned Showcase */}
        <div className="summary-score-display">
          <div className="summary-star-tier" aria-label={`Star rating: ${starTier}`}>
            {starTier}
          </div>
          <div className="score-badge-circle">
            <span className="score-number">{score}</span>
            <span className="score-total">/{total}</span>
          </div>
          <div className="stars-earned-banner">
            ⭐ +{stars} Stars added to your collection!
          </div>
        </div>

        {/* Action Buttons */}
        <div className="summary-action-buttons">
          <button
            type="button"
            className="summary-btn play-again-btn"
            onClick={onPlayAgain}
          >
            🔄 Play Again
          </button>

          {Array.isArray(missedQuestions) && missedQuestions.length > 0 && onPracticeMissed && (
            <button
              type="button"
              className="summary-btn practice-missed-btn"
              onClick={() => onPracticeMissed(missedQuestions)}
            >
              🎯 Practice the ones I missed ({missedQuestions.length})
            </button>
          )}

          {!summaryData.subject?.isReview && (
            <button
              type="button"
              className="summary-btn back-subject-btn"
              onClick={() => {
                if (onBackToSubject) {
                  onBackToSubject(summaryData.termId, summaryData.subject?.id);
                } else if (onBackToHome) {
                  onBackToHome(summaryData.termId);
                }
              }}
            >
              {summaryData.subject?.icon || '📚'} Back to {summaryData.subject?.title || 'Subject'} Topics
            </button>
          )}

          <button
            type="button"
            className="summary-btn back-home-btn"
            onClick={() => onBackToHome(summaryData.termId)}
          >
            🏠 All {String(summaryData.termId || 'Q1').toUpperCase()} Subjects
          </button>
        </div>
      </div>
    </div>
  );
}
