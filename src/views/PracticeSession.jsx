import React, { useState, useEffect, useRef } from 'react';
import QuestionDispatcher from '../engine/QuestionDispatcher.jsx';
import Mascot from '../components/Mascot.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import SpeechButton from '../components/SpeechButton.jsx';
import ConfettiCanvas from '../components/ConfettiCanvas.jsx';
import { getFeedback } from '../feedback/feedbackManager.js';
import { playSuccessSound, playGentleWrongSound, playCelebrationFanfare } from '../utils/audio.js';
import { speakText } from '../utils/speech.js';
import { recordSessionCompletion } from '../player/playerStorage.js';

const SESSION_LENGTH = 10;

export default function PracticeSession({
  player,
  subject,
  topic,
  level = 1,
  settings,
  onFinishSession,
  onExit
}) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attemptNumber, setAttemptNumber] = useState(1); // 1 or 2
  const [mascotMood, setMascotMood] = useState('idle');
  const [feedback, setFeedback] = useState(null); // { type, text, isCorrect, showExplanation, hint }
  const [sessionResults, setSessionResults] = useState([]); // array of { firstTry, secondTry }
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [isShake, setIsShake] = useState(false);
  const [sessionStars, setSessionStars] = useState(0);

  const playerName = player?.name || 'Friend';
  const soundEnabled = settings?.soundEnabled !== false;
  const spokenPraiseEnabled = settings?.spokenPraiseEnabled !== false;

  // Generate 10 unique non-repeating questions on mount or topic/level change
  useEffect(() => {
    const generated = [];
    const signatures = new Set();
    let safetyCounter = 0;

    while (generated.length < SESSION_LENGTH && safetyCounter < 100) {
      safetyCounter++;
      const q = topic.generateQuestion(level);
      const signature = `${q.prompt}_${JSON.stringify(q.data)}_${q.correctAnswer}`;
      if (!signatures.has(signature)) {
        signatures.add(signature);
        generated.push(q);
      }
    }

    // If topic produced few permutations, top up
    while (generated.length < SESSION_LENGTH) {
      generated.push(topic.generateQuestion(level));
    }

    setQuestions(generated);
    setCurrentIndex(0);
    setAttemptNumber(1);
    setMascotMood('idle');
    setFeedback(null);
    setSessionResults([]);
    setStreak(0);
    setMaxStreak(0);
    setSessionStars(0);
  }, [topic?.id, level]);

  const currentQuestion = questions[currentIndex];

  const checkAnswer = (userAnswer) => {
    if (!currentQuestion) return false;
    const { type, correctAnswer } = currentQuestion;

    if (type === 'DragToOrder') {
      if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) return false;
      return (
        userAnswer.length === correctAnswer.length &&
        userAnswer.every((val, idx) => Number(val) === Number(correctAnswer[idx]))
      );
    }

    if (type === 'FillInNumber') {
      return Number(userAnswer) === Number(correctAnswer);
    }

    return String(userAnswer).trim() === String(correctAnswer).trim();
  };

  const handleAnswerSubmit = (userAnswer) => {
    if (!currentQuestion || feedback?.isCorrect) return;

    const isCorrect = checkAnswer(userAnswer);

    if (isCorrect) {
      // Correct answer!
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      setSessionStars(prev => prev + 1);

      // Determine personalized message
      let msgType = 'correct';
      if (attemptNumber === 2) {
        msgType = 'correctSecondTry';
      } else if (newStreak === 3) {
        msgType = 'streak3';
      } else if (newStreak >= 5) {
        msgType = 'streak5';
      }

      const praise = getFeedback(msgType, playerName);
      setFeedback({
        type: msgType,
        text: praise,
        isCorrect: true,
        showExplanation: false
      });

      setMascotMood('celebrating');
      playSuccessSound(soundEnabled);
      setConfettiTrigger(Date.now());

      if (spokenPraiseEnabled) {
        speakText(praise);
      }

      // Record question result
      setSessionResults(prev => [
        ...prev,
        { firstTry: attemptNumber === 1, secondTry: attemptNumber === 2 }
      ]);
    } else {
      // Not correct
      setStreak(0);
      setIsShake(true);
      setTimeout(() => setIsShake(false), 600);
      playGentleWrongSound(soundEnabled);

      if (attemptNumber === 1) {
        // First try failed: gentle encouragement and teaching hint, allow retry!
        const gentleMsg = getFeedback('wrong', playerName);
        setFeedback({
          type: 'wrong',
          text: gentleMsg,
          isCorrect: false,
          showExplanation: false,
          hint: currentQuestion.hint
        });
        setMascotMood('thinking');
        setAttemptNumber(2);

        if (spokenPraiseEnabled) {
          speakText(gentleMsg);
        }
      } else {
        // Second try failed: reveal answer gently with explanation
        setFeedback({
          type: 'revealed',
          text: `You're working hard, ${playerName}! Here is the answer:`,
          isCorrect: false,
          showExplanation: true,
          correctAnswerDisplay: Array.isArray(currentQuestion.correctAnswer)
            ? currentQuestion.correctAnswer.join(', ')
            : currentQuestion.correctAnswer,
          explanation: currentQuestion.explanation
        });
        setMascotMood('supportive');

        // Record failed attempt
        setSessionResults(prev => [
          ...prev,
          { firstTry: false, secondTry: false }
        ]);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < SESSION_LENGTH) {
      setCurrentIndex(prev => prev + 1);
      setAttemptNumber(1);
      setMascotMood('idle');
      setFeedback(null);
    } else {
      // Completed all 10 questions!
      const totalStars = sessionStars;
      const updatedResults = [...sessionResults];

      if (player?.id) {
        recordSessionCompletion(player.id, topic.id, totalStars, updatedResults);
      }

      onFinishSession({
        stars: totalStars,
        score: totalStars,
        maxStreak,
        total: SESSION_LENGTH,
        subject,
        topic,
        level
      });
    }
  };

  if (!currentQuestion) {
    return (
      <div className="session-loading-state">
        <Mascot mood="thinking" size={100} />
        <p>Getting your practice ready...</p>
      </div>
    );
  }

  const isQuestionAnswered = feedback?.isCorrect || feedback?.showExplanation;

  return (
    <div className="practice-session-view">
      <ConfettiCanvas trigger={confettiTrigger} />

      {/* Top Header: Topic name, Exit button */}
      <div className="session-top-bar">
        <button
          type="button"
          className="exit-session-btn"
          onClick={onExit}
          aria-label="Exit session"
        >
          ✕ Exit
        </button>

        <div className="session-topic-title-badge">
          <span className="topic-icon-mini">{topic.icon}</span>
          <span className="topic-title-mini">{topic.title}</span>
          <span className="topic-level-mini">Level {level}</span>
        </div>

        <div className="session-stars-tracker">
          ⭐ <strong>{sessionStars}</strong> / {SESSION_LENGTH}
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar current={currentIndex + 1} total={SESSION_LENGTH} />

      {/* Main Question Card with Shake on gentle attempt error */}
      <div className={`question-stage-card ${isShake ? 'shake-animation' : ''}`}>
        <div className="question-header-row">
          <div className="question-prompt-group">
            <h2 className="question-prompt-text">{currentQuestion.prompt}</h2>
            {currentQuestion.promptSub && (
              <div className="question-sub-prompt">{currentQuestion.promptSub}</div>
            )}
          </div>
          <SpeechButton
            textToRead={currentQuestion.promptSpeech || currentQuestion.prompt}
            label="Listen"
          />
        </div>

        {/* Dynamic Engine Component */}
        <div className="question-interactive-body">
          <QuestionDispatcher
            question={currentQuestion}
            onSubmit={handleAnswerSubmit}
            disabled={isQuestionAnswered}
            soundEnabled={soundEnabled}
          />
        </div>

        {/* Feedback / Hint Banner */}
        {feedback && (
          <div className={`feedback-banner-box ${feedback.isCorrect ? 'banner-correct' : 'banner-retry'}`}>
            <div className="feedback-banner-content">
              <div className="feedback-text-message">{feedback.text}</div>

              {/* Teaching Hint (Attempt 1 retry) */}
              {!feedback.isCorrect && !feedback.showExplanation && feedback.hint && (
                <div className="hint-card-teaching">
                  <span className="hint-bulb">💡 Helpful Hint:</span>
                  <p className="hint-body-text">{feedback.hint}</p>
                </div>
              )}

              {/* Explanation (Attempt 2 reveal) */}
              {feedback.showExplanation && (
                <div className="explanation-card-box">
                  <div className="correct-answer-reveal">
                    Correct Answer: <strong>{feedback.correctAnswerDisplay}</strong>
                  </div>
                  <p className="explanation-body-text">{feedback.explanation}</p>
                </div>
              )}
            </div>

            {/* Next Question button when done */}
            {isQuestionAnswered && (
              <button
                type="button"
                className="next-question-btn"
                onClick={handleNextQuestion}
                autoFocus
              >
                {currentIndex + 1 === SESSION_LENGTH ? 'See Results! 🏆' : 'Next Question ➡'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Reactive Mascot Footer */}
      <div className="session-mascot-footer">
        <Mascot mood={mascotMood} size={110} />
        {streak >= 3 && !isQuestionAnswered && (
          <div className="streak-bubble-badge">
            🔥 {streak} in a row, {playerName}!
          </div>
        )}
      </div>
    </div>
  );
}
