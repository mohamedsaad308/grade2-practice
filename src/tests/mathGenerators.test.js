import { describe, it, expect } from 'vitest';
import moreLessThan from '../subjects/math/topics/moreLessThan.js';
import compareNumbers from '../subjects/math/topics/compareNumbers.js';
import orderGreatestToLeast from '../subjects/math/topics/orderGreatestToLeast.js';
import orderLeastToGreatest from '../subjects/math/topics/orderLeastToGreatest.js';
import { toExpandedForm, decomposeNumber } from '../utils/mathHelpers.js';

describe('Math Helpers', () => {
  it('correctly decomposes numbers into hundreds, tens, ones', () => {
    expect(decomposeNumber(325)).toEqual({ hundreds: 300, tens: 20, ones: 5 });
    expect(decomposeNumber(502)).toEqual({ hundreds: 500, tens: 0, ones: 2 });
    expect(decomposeNumber(190)).toEqual({ hundreds: 100, tens: 90, ones: 0 });
  });

  it('generates expanded form matching Grade 2 conventions', () => {
    expect(toExpandedForm(325)).toBe('300 + 20 + 5');
    expect(toExpandedForm(502)).toBe('500 + 2');
    expect(toExpandedForm(190)).toBe('100 + 90');
    expect(toExpandedForm(70)).toBe('70');
    expect(toExpandedForm(8)).toBe('8');
  });
});

describe('Topic: More / Less Than', () => {
  it('generates valid questions across all levels 1-3 with answers 0-999 and non-negative', () => {
    for (const level of [1, 2, 3]) {
      for (let i = 0; i < 50; i++) {
        const q = moreLessThan.generateQuestion(level);
        expect(q.type).toBe('FillInNumber');
        expect(typeof q.correctAnswer).toBe('number');
        expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
        expect(q.correctAnswer).toBeLessThanOrEqual(999);
        expect(q.prompt).toBeDefined();
        expect(q.hint).toBeDefined();
        expect(q.explanation).toBeDefined();

        // Verify mathematical correctness
        const { base, delta, operation } = q.data;
        if (operation === 'more') {
          expect(q.correctAnswer).toBe(base + delta);
        } else {
          expect(q.correctAnswer).toBe(base - delta);
        }
      }
    }
  });
});

describe('Topic: Compare Numbers (> < =)', () => {
  it('generates mathematically accurate comparisons and valid answers across levels 1-3', () => {
    const validSymbols = new Set(['>', '<', '=']);
    let equalCount = 0;

    for (const level of [1, 2, 3]) {
      for (let i = 0; i < 50; i++) {
        const q = compareNumbers.generateQuestion(level);
        expect(q.type).toBe('CompareSymbols');
        expect(validSymbols.has(q.correctAnswer)).toBe(true);

        const { leftVal, rightVal } = q.data;
        expect(leftVal).toBeGreaterThanOrEqual(0);
        expect(leftVal).toBeLessThanOrEqual(999);
        expect(rightVal).toBeGreaterThanOrEqual(0);
        expect(rightVal).toBeLessThanOrEqual(999);

        if (leftVal > rightVal) {
          expect(q.correctAnswer).toBe('>');
        } else if (leftVal < rightVal) {
          expect(q.correctAnswer).toBe('<');
        } else {
          expect(q.correctAnswer).toBe('=');
          equalCount++;
        }
      }
    }

    // Ensure '=' is generated sometimes (around 20-40% of the time)
    expect(equalCount).toBeGreaterThan(15);
  });
});

describe('Topic: Order Numbers (Greatest to Least & Least to Greatest)', () => {
  it('generates 3 unique numbers and mathematically accurate descending order', () => {
    for (const level of [1, 2, 3]) {
      for (let i = 0; i < 30; i++) {
        const q = orderGreatestToLeast.generateQuestion(level);
        expect(q.type).toBe('DragToOrder');
        expect(Array.isArray(q.correctAnswer)).toBe(true);
        expect(q.correctAnswer.length).toBe(3);

        const [a, b, c] = q.correctAnswer;
        expect(a).toBeGreaterThan(b);
        expect(b).toBeGreaterThan(c);
        expect(a).toBeLessThanOrEqual(999);
        expect(c).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('generates 3 unique numbers and mathematically accurate ascending order', () => {
    for (const level of [1, 2, 3]) {
      for (let i = 0; i < 30; i++) {
        const q = orderLeastToGreatest.generateQuestion(level);
        expect(q.type).toBe('DragToOrder');
        expect(Array.isArray(q.correctAnswer)).toBe(true);
        expect(q.correctAnswer.length).toBe(3);

        const [a, b, c] = q.correctAnswer;
        expect(a).toBeLessThan(b);
        expect(b).toBeLessThan(c);
        expect(c).toBeLessThanOrEqual(999);
        expect(a).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
