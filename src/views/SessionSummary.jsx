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
  onBackToHome
}) {
  const { stars, score, total = 10, topic, level } = summaryData;
  const playerName = player?.name || 'Friend';
  const soundEnabled = settings?.soundEnabled !== false;
  const spokenPraiseEnabled = settings?.spokenPraiseEnabled !== false;

  const [message, setMessage] = useState('');
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const isPerfect = score === total;

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
            🔄 Practice Again
          </button>

          <button
            type="button"
            className="summary-btn back-home-btn"
            onClick={onBackToHome}
          >
            🏠 Choose Another Topic
          </button>
        </div>
      </div>
    </div>
  );
}
