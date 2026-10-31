import React, { useState, useEffect } from 'react';
import QuestionDispatcher from '../engine/QuestionDispatcher.jsx';
import Mascot from '../components/Mascot.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import SpeechButton from '../components/SpeechButton.jsx';
import ConfettiCanvas from '../components/ConfettiCanvas.jsx';
import { getFeedback } from '../feedback/feedbackManager.js';
import { playSuccessSound, playGentleWrongSound, playCelebrationFanfare } from '../utils/audio.js';
import { speakText } from '../utils/speech.js';
import { recordSessionCompletion } from '../player/playerStorage.js';

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

  // Initialize questions: if topic provides fixed questions via getQuestions(), use them in order.
  // Otherwise, if topic provides generateQuestion(), generate a session of 10 unique questions.
  useEffect(() => {
    let generated = [];

    if (typeof topic.getQuestions === 'function') {
      generated = topic.getQuestions(level);
    } else if (typeof topic.generateQuestion === 'function') {
      const SESSION_LENGTH = 10;
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

      while (generated.length < SESSION_LENGTH) {
        generated.push(topic.generateQuestion(level));
      }
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

  const sessionTotal = questions.length || 10;
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

    if (type === 'MatchPairs') {
      if (!userAnswer || typeof userAnswer !== 'object') return false;
      const keys = Object.keys(correctAnswer);
      return (
        keys.length === Object.keys(userAnswer).length &&
        keys.every(k => userAnswer[k] === correctAnswer[k])
      );
    }

    if (type === 'TapToSelect') {
      if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) return false;
      if (userAnswer.length !== correctAnswer.length) return false;
      const userSorted = [...userAnswer].map(s => String(s).trim().toLowerCase()).sort();
      const correctSorted = [...correctAnswer].map(s => String(s).trim().toLowerCase()).sort();
      return userSorted.every((val, idx) => val === correctSorted[idx]);
    }

    if (type === 'TwoStep') {
      if (!userAnswer || typeof userAnswer !== 'object') return false;
      return (
        String(userAnswer.sentence).trim().toLowerCase() === String(correctAnswer.sentence).trim().toLowerCase() &&
        String(userAnswer.punctuation).trim() === String(correctAnswer.punctuation).trim()
      );
    }

    // Default string comparison (LetterTiles, WordBank, MultipleChoice)
    return String(userAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();
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
        let displayAns = currentQuestion.correctAnswer;
        if (Array.isArray(currentQuestion.correctAnswer)) {
          displayAns = currentQuestion.correctAnswer.join(', ');
        } else if (currentQuestion.type === 'TwoStep' && typeof currentQuestion.correctAnswer === 'object') {
          const optObj = currentQuestion.data?.options?.find(o => o.id === currentQuestion.correctAnswer.sentence);
          const sentText = optObj ? optObj.text : currentQuestion.correctAnswer.sentence;
          displayAns = `"${sentText}" with end mark [ ${currentQuestion.correctAnswer.punctuation} ]`;
        } else if (typeof currentQuestion.correctAnswer === 'object' && currentQuestion.correctAnswer !== null) {
          displayAns = Object.entries(currentQuestion.correctAnswer).map(([w, m]) => `${w} = ${m}`).join(' | ');
        }

        setFeedback({
          type: 'revealed',
          text: `You're working hard, ${playerName}! Here is the answer:`,
          isCorrect: false,
          showExplanation: true,
          correctAnswerDisplay: displayAns,
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
    if (currentIndex + 1 < sessionTotal) {
      setCurrentIndex(prev => prev + 1);
      setAttemptNumber(1);
      setMascotMood('idle');
      setFeedback(null);
    } else {
      // Completed all questions in the topic session!
      const totalStars = sessionStars;
      const updatedResults = [...sessionResults];

      if (player?.id) {
        recordSessionCompletion(player.id, topic.id, totalStars, updatedResults);
      }

      onFinishSession({
        stars: totalStars,
        score: totalStars,
        maxStreak,
        total: sessionTotal,
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

  // Build audio text for the read aloud button
  let fullSpeechPrompt = currentQuestion.promptSpeech || currentQuestion.prompt;
  if (currentQuestion.data?.sentence && !fullSpeechPrompt.includes(currentQuestion.data.sentence)) {
    fullSpeechPrompt = `${fullSpeechPrompt}. ${currentQuestion.data.sentence}`;
  }

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
          {topic.levels && topic.levels.length > 1 && (
            <span className="topic-level-mini">Level {level}</span>
          )}
        </div>

        <div className="session-stars-tracker">
          ⭐ <strong>{sessionStars}</strong> / {sessionTotal}
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar current={currentIndex + 1} total={sessionTotal} />

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
            textToRead={fullSpeechPrompt}
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
                {currentIndex + 1 === sessionTotal ? 'See Results! 🏆' : 'Next Question ➡'}
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
