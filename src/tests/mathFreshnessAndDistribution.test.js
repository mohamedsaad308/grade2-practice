import { describe, it, expect, beforeEach } from 'vitest';
import moreLessThan from '../subjects/math/topics/moreLessThan.js';
import compareNumbers from '../subjects/math/topics/compareNumbers.js';
import orderGreatestToLeast from '../subjects/math/topics/orderGreatestToLeast.js';
import orderLeastToGreatest from '../subjects/math/topics/orderLeastToGreatest.js';
import englishSubject from '../subjects/english/index.js';
import {
  clearAllStorage,
  createPlayer,
  getCurrentPlayer,
  getRecentQuestionSignatures,
  addRecentQuestionSignatures,
  recordItemOutcome
} from '../player/playerStorage.js';
import { getQuestionSignature } from '../utils/mathHelpers.js';

describe('Math Freshness, Distribution & Anti-Memorization (500 Sessions Simulation)', () => {
  beforeEach(() => {
    clearAllStorage();
    createPlayer('Alex', 'fox');
  });

  const mathTopics = [
    { name: 'More or Less Than', topic: moreLessThan },
    { name: 'Compare Numbers (> < =)', topic: compareNumbers },
    { name: 'Order: Greatest to Least', topic: orderGreatestToLeast },
    { name: 'Order: Least to Greatest', topic: orderLeastToGreatest }
  ];

  mathTopics.forEach(({ name, topic }) => {
    topic.levels.forEach((level) => {
      it(`${name} - Level ${level}: 500 sessions simulation with zero intra-session duplicates and valid bounds`, () => {
        const player = getCurrentPlayer();
        const SESSIONS_COUNT = 500;
        const SESSION_LEN = 10;
        let totalQuestions = 0;
        let consecutiveOverlapCount = 0;
        const symbolCounts = { '>': 0, '<': 0, '=': 0 };
        const initialFirstPosCounts = { 0: 0, 1: 0, 2: 0 };

        let previousSessionSignatures = new Set();

        for (let s = 0; s < SESSIONS_COUNT; s++) {
          const session = [];
          const sessionSignatures = new Set();
          const recent200 = new Set(getRecentQuestionSignatures(player.id));
          let attempts = 0;

          // Mimic PracticeSession generation with recent 200 memory
          while (session.length < SESSION_LEN && attempts < 150) {
            attempts++;
            const q = topic.generateQuestion(level);
            const sig = q.signature || getQuestionSignature(q);
            if (!sessionSignatures.has(sig) && !recent200.has(sig)) {
              sessionSignatures.add(sig);
              session.push(q);
            }
          }

          // Fallback pass if pool exhausted
          attempts = 0;
          while (session.length < SESSION_LEN && attempts < 100) {
            attempts++;
            const q = topic.generateQuestion(level);
            const sig = q.signature || getQuestionSignature(q);
            if (!sessionSignatures.has(sig)) {
              sessionSignatures.add(sig);
              session.push(q);
            }
          }

          expect(session.length).toBe(SESSION_LEN);

          // 1. Assert NO duplicate questions inside any session
          expect(sessionSignatures.size).toBe(SESSION_LEN);

          // 2. Measure overlap with immediately preceding session
          session.forEach((q) => {
            const sig = q.signature || getQuestionSignature(q);
            if (previousSessionSignatures.has(sig)) {
              consecutiveOverlapCount++;
            }
          });
          previousSessionSignatures = new Set(sessionSignatures);

          // 3. Update player's recent 200 memory in localStorage
          addRecentQuestionSignatures(player.id, Array.from(sessionSignatures));

          // 4. Validate each question's correctness and [0, 999] bounds
          session.forEach((q) => {
            totalQuestions++;

            if (q.type === 'FillInNumber') {
              expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
              expect(q.correctAnswer).toBeLessThanOrEqual(999);
              expect(q.data.base).toBeGreaterThanOrEqual(0);
              expect(q.data.base).toBeLessThanOrEqual(999);
              if (q.data.operation === 'more') {
                expect(q.correctAnswer).toBe(q.data.base + q.data.delta);
              } else {
                expect(q.correctAnswer).toBe(q.data.base - q.data.delta);
              }
            }

            if (q.type === 'CompareSymbols') {
              expect(q.data.leftVal).toBeGreaterThanOrEqual(0);
              expect(q.data.leftVal).toBeLessThanOrEqual(999);
              expect(q.data.rightVal).toBeGreaterThanOrEqual(0);
              expect(q.data.rightVal).toBeLessThanOrEqual(999);

              if (q.data.leftVal === q.data.rightVal) {
                expect(q.correctAnswer).toBe('=');
              } else if (q.data.leftVal > q.data.rightVal) {
                expect(q.correctAnswer).toBe('>');
              } else {
                expect(q.correctAnswer).toBe('<');
              }
              symbolCounts[q.correctAnswer]++;
            }

            if (q.type === 'DragToOrder') {
              expect(q.correctAnswer.length).toBe(3);
              q.correctAnswer.forEach((n) => {
                expect(n).toBeGreaterThanOrEqual(0);
                expect(n).toBeLessThanOrEqual(999);
              });
              if (q.data.orderType === 'descending') {
                expect(q.correctAnswer[0]).toBeGreaterThan(q.correctAnswer[1]);
                expect(q.correctAnswer[1]).toBeGreaterThan(q.correctAnswer[2]);
              } else {
                expect(q.correctAnswer[0]).toBeLessThan(q.correctAnswer[1]);
                expect(q.correctAnswer[1]).toBeLessThan(q.correctAnswer[2]);
              }
              // Track position of the first target item in the initial display
              const firstTarget = q.correctAnswer[0];
              const initialPos = q.data.items.indexOf(firstTarget);
              if (initialPos !== -1) initialFirstPosCounts[initialPos]++;
            }
          });
        }

        // Assert low consecutive session overlap (< 5% overall, typically ~0% with recent 200 memory)
        const consecutiveOverlapRate = (consecutiveOverlapCount / totalQuestions) * 100;
        expect(consecutiveOverlapRate).toBeLessThan(5);

        // For Compare Numbers: assert balanced symbol distribution with '=' near 1 in 6 (~16.7%)
        if (topic.id === 'math_compare') {
          const eqPercent = (symbolCounts['='] / totalQuestions) * 100;
          const gtPercent = (symbolCounts['>'] / totalQuestions) * 100;
          const ltPercent = (symbolCounts['<'] / totalQuestions) * 100;

          // '=' should be around 16.7% (1 in 6)
          expect(eqPercent).toBeGreaterThan(12);
          expect(eqPercent).toBeLessThan(22);

          // '>' and '<' should each be around 41.6% and close to each other
          expect(gtPercent).toBeGreaterThan(36);
          expect(gtPercent).toBeLessThan(46);
          expect(ltPercent).toBeGreaterThan(36);
          expect(ltPercent).toBeLessThan(46);
          expect(Math.abs(gtPercent - ltPercent)).toBeLessThan(6);
        }

        // For DragToOrder: assert initial position of first target element is balanced
        if (topic.id === 'math_order_desc' || topic.id === 'math_order_asc') {
          const pos0Percent = (initialFirstPosCounts[0] / totalQuestions) * 100;
          const pos1Percent = (initialFirstPosCounts[1] / totalQuestions) * 100;
          const pos2Percent = (initialFirstPosCounts[2] / totalQuestions) * 100;

          expect(pos0Percent).toBeGreaterThan(15);
          expect(pos1Percent).toBeGreaterThan(15);
          expect(pos2Percent).toBeGreaterThan(15);
        }
      });
    });
  });

  describe('English Adaptive Practice (Spaced Learning / Prioritization)', () => {
    it('prioritizes missed and unseen items without duplicates in consecutive sessions', () => {
      const player = getCurrentPlayer();
      const topic = englishSubject.topics[0]; // e.g. synonyms

      // Session 1: All items are unseen initially
      const s1 = topic.getQuestions(1, player.id);
      expect(s1.length).toBeGreaterThanOrEqual(1);
      const s1Ids = s1.map((q) => q.id);
      expect(new Set(s1Ids).size).toBe(s1.length); // 0 duplicates in session

      // Suppose the player answered question 0 correctly on first try, but missed question 1
      recordItemOutcome(player.id, s1[0].id, true);
      recordItemOutcome(player.id, s1[1].id, false);

      // Session 2: Missed item should be prioritized
      const s2 = topic.getQuestions(1, player.id);
      const s2Ids = s2.map((q) => q.id);
      expect(s2Ids).toContain(s1[1].id); // The missed question is included!
      expect(new Set(s2Ids).size).toBe(s2.length); // 0 duplicates in session
    });

    it('shuffles option orders every time so correct answer position varies', () => {
      const topic = englishSubject.topics.find((t) => t.type === 'choice' && t.items[0]?.options?.length > 2);
      if (!topic) return;

      const firstItem = topic.items[0];
      const positions = [];

      for (let i = 0; i < 50; i++) {
        const questions = topic.getQuestions(1);
        const match = questions.find((q) => q.id === firstItem.id);
        if (match && match.options) {
          positions.push(match.options.indexOf(match.answer));
        }
      }

      // Check that the answer appears in multiple different positions across 50 generations
      const uniquePositions = new Set(positions);
      expect(uniquePositions.size).toBeGreaterThan(1);
    });
  });
});
