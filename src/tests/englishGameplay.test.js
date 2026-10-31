import { describe, it, expect } from 'vitest';
import englishSubject from '../subjects/english/index.js';

describe('English Topics Gameplay & Answer Verification', () => {
  it('has 15 topics in the English subject', () => {
    expect(englishSubject.topics.length).toBe(15);
  });

  englishSubject.topics.forEach((topic) => {
    it(`Topic: "${topic.title}" returns questions that pass answer checks`, () => {
      const questions = topic.getQuestions();
      expect(questions.length).toBeGreaterThan(0);

      questions.forEach((q) => {
        const { type, correctAnswer } = q;

        // Verify correct answer structure based on type
        if (type === 'WordBank' || type === 'MultipleChoice') {
          expect(typeof correctAnswer).toBe('string');
          expect(correctAnswer.trim().length).toBeGreaterThan(0);
        } else if (type === 'MatchPairs') {
          expect(typeof correctAnswer).toBe('object');
          const keys = Object.keys(correctAnswer);
          expect(keys.length).toBeGreaterThanOrEqual(4);
          keys.forEach(k => {
            expect(typeof correctAnswer[k]).toBe('string');
            expect(correctAnswer[k].length).toBeGreaterThan(0);
          });
        } else if (type === 'TwoStep') {
          expect(typeof correctAnswer).toBe('object');
          expect(typeof correctAnswer.sentence).toBe('string');
          expect(typeof correctAnswer.punctuation).toBe('string');
        }
      });
    });
  });
});
