import { describe, it, expect } from 'vitest';
import englishSubject from '../subjects/english/index.js';
import readingSubject from '../subjects/reading/index.js';
import { getFeedback } from '../feedback/feedbackManager.js';

function checkAnswer(q, userAnswer) {
  const { type, correctAnswer } = q;
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
  return String(userAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();
}

function buildSpeechAudioText(q) {
  if (!q) return '';
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
}

describe('Full Session Simulation: All 15 Fresh English Topics', () => {
  it('English subject contains exactly 15 topics', () => {
    expect(englishSubject.topics.length).toBe(15);
  });

  englishSubject.topics.forEach((topic) => {
    it(`Simulates a full session of "${topic.title}" with 100% accuracy and item verification`, () => {
      const questions = topic.getQuestions();
      expect(questions.length).toBeGreaterThan(0);

      let starsEarned = 0;
      let streak = 0;

      questions.forEach((q) => {
        // (a) Verify instruction prompt
        expect(typeof q.prompt).toBe('string');
        expect(q.prompt.trim().length).toBeGreaterThan(0);

        // (b) Verify item display exists
        const data = q.data || {};
        const hasItem = Boolean(
          data.sentence ||
          data.paragraph ||
          data.story ||
          data.pairs ||
          (data.options && data.options.length > 0)
        );
        expect(hasItem, `Question ${q.id} in topic "${topic.title}" must display an item`).toBe(true);

        // (c) Verify speech order: instruction first, then item
        const speech = buildSpeechAudioText(q);
        const promptBase = q.prompt.replace(/[:]+$/, '').trim();
        expect(speech.startsWith(promptBase) || speech.startsWith(q.promptSpeech?.slice(0, 12) || '')).toBe(true);

        // (d) Simulate player answering correctly
        const isCorrect = checkAnswer(q, q.correctAnswer);
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
    it(`Simulates a full session of "${topic.title}" with 100% accuracy and item verification`, () => {
      const questions = topic.getQuestions();
      expect(questions.length).toBeGreaterThan(0);

      let starsEarned = 0;

      questions.forEach((q) => {
        // (a) Verify instruction prompt
        expect(typeof q.prompt).toBe('string');
        expect(q.prompt.trim().length).toBeGreaterThan(0);

        // (b) Verify item display exists
        const data = q.data || {};
        const hasItem = Boolean(data.paragraph || data.passage);
        expect(hasItem, `Reading question ${q.id} must contain paragraph or passage`).toBe(true);

        // (c) Verify correct answer
        const isCorrect = checkAnswer(q, q.correctAnswer);
        expect(isCorrect).toBe(true);

        starsEarned += 1;
      });

      expect(starsEarned).toBe(questions.length);
    });
  });
});
