import { describe, it, expect } from 'vitest';
import englishSubject from '../subjects/english/index.js';
import readingSubject from '../subjects/reading/index.js';
import { getFeedback } from '../feedback/feedbackManager.js';

function checkAnswer(q, userAnswer) {
  const { type } = q;
  if (type === 'choice') {
    if (!userAnswer) return false;
    const cleanUser = String(userAnswer).trim().toLowerCase();
    const cleanAns = String(q.answer).trim().toLowerCase();
    if (cleanUser === cleanAns) return true;
    if (Array.isArray(q.accepted)) {
      return q.accepted.some(acc => String(acc).trim().toLowerCase() === cleanUser);
    }
    return false;
  }
  if (type === 'two_step') {
    if (!userAnswer || typeof userAnswer !== 'object') return false;
    return (
      String(userAnswer.sentence).trim().toLowerCase() === String(q.answer).trim().toLowerCase() &&
      String(userAnswer.mark).trim() === String(q.answer_mark).trim()
    );
  }
  if (type === 'match') {
    if (!userAnswer || typeof userAnswer !== 'object') return false;
    if (!Array.isArray(q.pairs)) return false;
    return q.pairs.every(([word, meaning]) => userAnswer[word] === meaning);
  }
  if (type === 'MultipleChoice' || type === 'PassageComprehension') {
    const target = q.correctAnswer || q.answer;
    return String(userAnswer).trim().toLowerCase() === String(target).trim().toLowerCase();
  }
  return false;
}

function getSimulationUserAnswer(q) {
  if (q.type === 'choice') {
    return q.answer;
  }
  if (q.type === 'two_step') {
    return {
      sentence: q.answer,
      mark: q.answer_mark
    };
  }
  if (q.type === 'match') {
    const map = {};
    q.pairs.forEach(([w, m]) => {
      map[w] = m;
    });
    return map;
  }
  if (q.type === 'MultipleChoice' || q.type === 'PassageComprehension') {
    return q.correctAnswer;
  }
  return null;
}

describe('Full Session Simulation: All 18 English Cards (17 Topics + Mixed English Review)', () => {
  it('English subject contains exactly 18 cards', () => {
    expect(englishSubject.topics.length).toBe(18);
  });

  englishSubject.topics.forEach((topic) => {
    it(`Simulates a full session of "${topic.title}" with 100% accuracy and item verification`, () => {
      const questions = topic.getQuestions();
      expect(questions.length).toBeGreaterThan(0);
      expect(questions.length).toBeLessThanOrEqual(10);

      let starsEarned = 0;
      let streak = 0;

      questions.forEach((q) => {
        // (a) Verify item display exists
        if (q.type === 'choice' || q.type === 'two_step') {
          expect(typeof q.text === 'string' && q.text.trim().length > 0).toBe(true);
        } else if (q.type === 'match') {
          expect(Array.isArray(q.pairs) && q.pairs.length === 4).toBe(true);
        }

        // (b) Answer check
        const testAnswer = getSimulationUserAnswer(q);
        const isCorrect = checkAnswer(q, testAnswer);
        expect(isCorrect, `Correct answer for ${q.id} must be verified as true`).toBe(true);

        streak += 1;
        starsEarned += 1;

        // Feedback personalizer with child name
        const praise = getFeedback('correct', 'Aya');
        expect(praise).toContain('Aya');

        if (streak === 3) {
          const streakPraise = getFeedback('streak3', 'Aya');
          expect(streakPraise).toContain('Aya');
        }
      });

      expect(starsEarned).toBe(questions.length);
    });
  });
});

describe('Full Session Simulation: All 2 Reading Topics', () => {
  readingSubject.topics.forEach((topic) => {
    it(`Simulates a full session of "${topic.title}" with 100% accuracy`, () => {
      const questions = topic.getQuestions();
      expect(questions.length).toBeGreaterThan(0);

      let starsEarned = 0;

      questions.forEach((q) => {
        const testAnswer = getSimulationUserAnswer(q);
        const isCorrect = checkAnswer(q, testAnswer);
        expect(isCorrect).toBe(true);
        starsEarned += 1;
      });

      expect(starsEarned).toBe(questions.length);
    });
  });
});
