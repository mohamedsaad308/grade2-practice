import React, { useState, useEffect } from 'react';
import QuestionDispatcher from '../engine/QuestionDispatcher.jsx';
import Mascot from '../components/Mascot.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import PracticeHeader from '../components/PracticeHeader.jsx';
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
  onToggleSound,
  onToggleSpokenPraise,
  onChangePlayer,
  onNavigateParent,
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
    const { type } = currentQuestion;

    // English: choice
    if (type === 'choice') {
      if (!userAnswer) return false;
      const cleanUser = String(userAnswer).trim().toLowerCase();
      const cleanAns = String(currentQuestion.answer).trim().toLowerCase();
      if (cleanUser === cleanAns) return true;
      if (Array.isArray(currentQuestion.accepted)) {
        return currentQuestion.accepted.some(
          acc => String(acc).trim().toLowerCase() === cleanUser
        );
      }
      return false;
    }

    // English: two_step
    if (type === 'two_step') {
      if (!userAnswer || typeof userAnswer !== 'object') return false;
      const sentenceMatch =
        String(userAnswer.sentence).trim().toLowerCase() ===
        String(currentQuestion.answer).trim().toLowerCase();
      const markMatch =
        String(userAnswer.mark).trim() ===
        String(currentQuestion.answer_mark).trim();
      return sentenceMatch && markMatch;
    }

    // English: match
    if (type === 'match') {
      if (!userAnswer || typeof userAnswer !== 'object') return false;
      if (!Array.isArray(currentQuestion.pairs)) return false;
      return currentQuestion.pairs.every(([word, meaning]) => {
        return userAnswer[word] === meaning;
      });
    }

    // Math: DragToOrder
    if (type === 'DragToOrder') {
      const correctAnswer = currentQuestion.correctAnswer;
      if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) return false;
      return (
        userAnswer.length === correctAnswer.length &&
        userAnswer.every((val, idx) => Number(val) === Number(correctAnswer[idx]))
      );
    }

    // Math: FillInNumber
    if (type === 'FillInNumber') {
      return Number(userAnswer) === Number(currentQuestion.correctAnswer);
    }

    // Math: CompareSymbols / Reading: MultipleChoice / PassageComprehension
    const target = currentQuestion.correctAnswer || currentQuestion.answer;
    return String(userAnswer).trim().toLowerCase() === String(target).trim().toLowerCase();
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
        // First try failed: gentle encouragement and topic hint, allow retry!
        const gentleMsg = getFeedback('wrong', playerName);
        setFeedback({
          type: 'wrong',
          text: gentleMsg,
          isCorrect: false,
          showExplanation: false,
          hint: currentQuestion.topicHint || currentQuestion.hint
        });
        setMascotMood('thinking');
        setAttemptNumber(2);

        if (spokenPraiseEnabled) {
          speakText(gentleMsg);
        }
      } else {
        // Second try failed: reveal answer gently with explanation
        let displayAns = currentQuestion.answer || currentQuestion.correctAnswer;
        if (currentQuestion.type === 'two_step') {
          displayAns = `"${currentQuestion.answer}" with end mark [ ${currentQuestion.answer_mark} ]`;
        } else if (currentQuestion.type === 'match' && Array.isArray(currentQuestion.pairs)) {
          displayAns = currentQuestion.pairs.map(([w, m]) => `${w} = ${m}`).join(' | ');
        } else if (Array.isArray(displayAns)) {
          displayAns = displayAns.join(', ');
        }

        setFeedback({
          type: 'revealed',
          text: `You're working hard, ${playerName}! Here is the answer:`,
          isCorrect: false,
          showExplanation: true,
          correctAnswerDisplay: displayAns,
          explanation: currentQuestion.explanation || currentQuestion.topicHint || currentQuestion.hint
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

  // Build audio text for the read aloud button: reads instruction, then text (say "blank" for ___), then options
  const buildSpeechAudioText = (q) => {
    if (!q) return '';

    // English choice
    if (q.type === 'choice') {
      const parts = [];
      const instruction = q.prompt || q.instruction || topic?.instruction;
      if (instruction) parts.push(instruction.replace(/[:]+$/, ''));
      if (q.text) {
        parts.push(q.text.replace(/_+/g, 'blank'));
      }
      if (Array.isArray(q.options) && q.options.length > 0) {
        parts.push('Options: ' + q.options.join(', '));
      }
      return parts.join('. ');
    }

    // English two_step
    if (q.type === 'two_step') {
      const parts = [];
      if (q.text) parts.push(q.text);
      if (Array.isArray(q.options)) {
        parts.push('Sentence choices: ' + q.options.join(', '));
      }
      if (Array.isArray(q.marks)) {
        const markNames = q.marks.map(m =>
          m === '.' ? 'period' : m === '?' ? 'question mark' : 'exclamation point'
        );
        parts.push('Marks: ' + markNames.join(', '));
      }
      return parts.join('. ');
    }

    // English match
    if (q.type === 'match') {
      const parts = [];
      const instruction = q.instruction || topic?.instruction || 'Match each word with its meaning.';
      parts.push(instruction);
      if (Array.isArray(q.pairs)) {
        const words = q.pairs.map(p => p[0]);
        parts.push('Words to match: ' + words.join(', '));
      }
      return parts.join('. ');
    }

    // Math & Reading existing fallback
    const prompt = (q.prompt || '').trim();
    const data = q.data || {};

    let item = '';
    if (data.sentence) {
      item = data.sentence;
    } else if (data.paragraph) {
      item = data.paragraph;
    } else if (data.story) {
      item = data.story;
    } else if (data.clueSentence) {
      item = data.clueSentence;
    } else if (data.pictureLabel) {
      item = data.pictureLabel;
    }

    const cleanPrompt = prompt.replace(/_+/g, 'blank');
    const cleanItem = item.replace(/_+/g, 'blank').trim();

    if (cleanItem && !cleanPrompt.toLowerCase().includes(cleanItem.toLowerCase())) {
      const basePrompt = cleanPrompt.replace(/[:]+$/, '');
      return `${basePrompt}. ${cleanItem}`;
    }

    if (q.type === 'TapToSelect' && Array.isArray(data.options)) {
      const basePrompt = cleanPrompt.replace(/[:]+$/, '');
      return `${basePrompt}. Choices: ${data.options.join('. ')}`;
    }

    if (q.promptSpeech) {
      return q.promptSpeech.replace(/_+/g, 'blank');
    }

    return cleanPrompt;
  };

  const fullSpeechPrompt = buildSpeechAudioText(currentQuestion);

  const displayHeaderInstruction =
    currentQuestion.prompt ||
    currentQuestion.instruction ||
    topic?.instruction ||
    topic?.description ||
    topic?.title ||
    currentQuestion.text;

  return (
    <div className="practice-session-view">
      <ConfettiCanvas trigger={confettiTrigger} />

      {/* Slim Header: Avatar+Name, Stars, Menu, Exit */}
      <PracticeHeader
        player={player}
        settings={settings}
        onToggleSound={onToggleSound}
        onToggleSpokenPraise={onToggleSpokenPraise}
        onChangePlayer={onChangePlayer}
        onNavigateParent={onNavigateParent}
        onExit={() => onExit(subject?.id)}
        subjectTitle={subject?.title}
      />

      {/* Single-row Progress Bar with Question Counter */}
      <div className="practice-progress-sticky-line">
        <ProgressBar current={currentIndex + 1} total={sessionTotal} />
      </div>

      {/* Main Question Card with Shake on gentle attempt error */}
      <div className={`question-stage-card ${isShake ? 'shake-animation' : ''}`}>
        <div className="question-header-row">
          <div className="question-prompt-group">
            <h2 className="question-prompt-text">{displayHeaderInstruction}</h2>
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
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar for Next Question / Finish */}
      {isQuestionAnswered && (
        <div className="practice-sticky-bottom-bar" role="region" aria-label="Action bar">
          <button
            type="button"
            className="next-question-btn sticky-action-btn"
            onClick={handleNextQuestion}
            autoFocus
          >
            {currentIndex + 1 === sessionTotal ? 'See Results! 🏆' : 'Next Question ➡'}
          </button>
        </div>
      )}

      {/* Reactive Mascot Footer */}
      <div className="session-mascot-footer">
        <Mascot mood={mascotMood} size={64} />
        {streak >= 3 && !isQuestionAnswered && (
          <div className="streak-bubble-badge">
            🔥 {streak} in a row, {playerName}!
          </div>
        )}
      </div>
    </div>
  );
}
