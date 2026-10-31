import { describe, it, expect } from 'vitest';
import englishSubject from '../subjects/english/index.js';

describe('English Topics Gameplay & Answer Verification', () => {
  englishSubject.topics.forEach((topic) => {
    it(`Topic: "${topic.title}" returns questions that pass answer checks`, () => {
      const questions = topic.getQuestions();
      expect(questions.length).toBeGreaterThan(0);

      questions.forEach((q) => {
        const { type, correctAnswer } = q;

        // Verify correct answer structure based on type
        if (type === 'LetterTiles' || type === 'WordBank' || type === 'MultipleChoice') {
          expect(typeof correctAnswer).toBe('string');
          expect(correctAnswer.trim().length).toBeGreaterThan(0);
        } else if (type === 'MatchPairs') {
          expect(typeof correctAnswer).toBe('object');
          const keys = Object.keys(correctAnswer);
          expect(keys.length).toBe(4);
          keys.forEach(k => {
            expect(typeof correctAnswer[k]).toBe('string');
            expect(correctAnswer[k].length).toBeGreaterThan(0);
          });
        } else if (type === 'TapToSelect') {
          expect(Array.isArray(correctAnswer)).toBe(true);
          expect(correctAnswer.length).toBe(2);
        } else if (type === 'TwoStep') {
          expect(typeof correctAnswer).toBe('object');
          expect(typeof correctAnswer.sentence).toBe('string');
          expect(typeof correctAnswer.punctuation).toBe('string');
        }
      });
    });
  });
});
