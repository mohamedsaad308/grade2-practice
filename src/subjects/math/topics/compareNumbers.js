import { randomInt, pickRandom, toExpandedForm } from '../../../utils/mathHelpers.js';

/**
 * Topic: Compare numbers with >, <, or =
 * Examples from worksheet:
 * 325 vs 300 + 20 + 5 (=)
 * 418 vs 481 (<)
 * 650 vs 560 (>)
 * 207 vs 270 (<)
 * 190 vs 100 + 90 (=)
 * 345 vs 354 (<)
 * 502 vs 500 + 2 (=)
 */
export default {
  id: 'math_compare',
  title: 'Compare Numbers (> < =)',
  icon: '⚖️',
  description: 'Compare 3-digit numbers in plain and expanded form using >, <, or =.',
  levels: [1, 2, 3],

  generateQuestion(level = 1) {
    let leftDisplay;
    let rightDisplay;
    let leftVal;
    let rightVal;

    // Determine question archetype
    // In all levels, ~30% probability of equality
    const shouldBeEqual = Math.random() < 0.32;

    if (shouldBeEqual) {
      const val = randomInt(105, 989);
      leftVal = val;
      rightVal = val;

      const expandedStyle = pickRandom(['right_expanded', 'left_expanded']);
      if (expandedStyle === 'right_expanded') {
        leftDisplay = String(val);
        rightDisplay = toExpandedForm(val);
      } else {
        leftDisplay = toExpandedForm(val);
        rightDisplay = String(val);
      }
    } else if (level === 1) {
      // Clear difference in hundreds or simple tens
      const style = pickRandom(['plain', 'expanded']);
      if (style === 'plain') {
        let h1 = randomInt(1, 8);
        let h2 = randomInt(1, 8);
        while (h2 === h1) h2 = randomInt(1, 8);
        leftVal = h1 * 100 + randomInt(1, 9) * 10 + randomInt(0, 9);
        rightVal = h2 * 100 + randomInt(1, 9) * 10 + randomInt(0, 9);
        leftDisplay = String(leftVal);
        rightDisplay = String(rightVal);
      } else {
        // Plain vs expanded unequal
        leftVal = randomInt(150, 890);
        const diff = pickRandom([-100, 100, -10, 10]);
        rightVal = Math.max(100, Math.min(999, leftVal + diff));
        leftDisplay = String(leftVal);
        rightDisplay = toExpandedForm(rightVal);
      }
    } else if (level === 2) {
      // Plain vs expanded or tens difference (e.g. 650 vs 560, 502 vs 500 + 20)
      const style = pickRandom(['tens_swap', 'expanded_subtle']);
      if (style === 'tens_swap') {
        // e.g. 650 vs 560
        const d1 = randomInt(2, 9);
        const d2 = randomInt(2, 9);
        const d3 = randomInt(0, 9);
        leftVal = d1 * 100 + d2 * 10 + d3;
        rightVal = d2 * 100 + d1 * 10 + d3;
        leftDisplay = String(leftVal);
        rightDisplay = String(rightVal);
      } else {
        // Subtle expanded difference
        const base = randomInt(1, 9) * 100 + randomInt(1, 9);
        leftVal = base;
        rightVal = base + (Math.random() < 0.5 ? 10 : 20);
        leftDisplay = String(leftVal);
        rightDisplay = toExpandedForm(rightVal);
      }
    } else {
      // Level 3: Close numbers with swapped digits (418 vs 481, 207 vs 270, 345 vs 354)
      const swapType = pickRandom(['swap_tens_ones', 'swap_hundreds_tens', 'zero_tens']);
      if (swapType === 'swap_tens_ones') {
        // 418 vs 481 or 345 vs 354
        const h = randomInt(1, 9);
        const t = randomInt(1, 8);
        let o = randomInt(1, 9);
        while (o === t) o = randomInt(1, 9);
        leftVal = h * 100 + t * 10 + o;
        rightVal = h * 100 + o * 10 + t;
        leftDisplay = String(leftVal);
        rightDisplay = String(rightVal);
      } else if (swapType === 'zero_tens') {
        // 207 vs 270 or 502 vs 520
        const h = randomInt(1, 9);
        const nonZero = randomInt(1, 9);
        leftVal = h * 100 + nonZero; // e.g. 207
        rightVal = h * 100 + nonZero * 10; // e.g. 270
        if (Math.random() < 0.5) {
          leftDisplay = String(leftVal);
          rightDisplay = String(rightVal);
        } else {
          leftDisplay = String(rightVal);
          rightDisplay = toExpandedForm(leftVal);
        }
      } else {
        // 418 vs 481
        const h = randomInt(1, 8);
        const t = randomInt(1, 8);
        const o = randomInt(1, 8);
        leftVal = h * 100 + t * 10 + o;
        rightVal = h * 100 + o * 10 + t;
        leftDisplay = String(leftVal);
        rightDisplay = String(rightVal);
      }
    }

    // Determine correct symbol
    let correctAnswer = '=';
    if (leftVal > rightVal) correctAnswer = '>';
    else if (leftVal < rightVal) correctAnswer = '<';

    // Pedagogical hint
    let hint;
    if (leftDisplay.includes('+') || rightDisplay.includes('+')) {
      hint = 'Calculate the expanded addition first, then compare the numbers!';
    } else {
      hint = 'First compare the hundreds. If they are the same, compare the tens, then the ones!';
    }

    // Friendly explanation
    let explanation;
    if (leftVal === rightVal) {
      explanation = `${leftDisplay} and ${rightDisplay} both equal ${leftVal}, so they are equal (=)!`;
    } else if (leftVal > rightVal) {
      explanation = `${leftVal} is greater than ${rightVal}, so ${leftDisplay} > ${rightDisplay}! The alligator mouth opens to the bigger number.`;
    } else {
      explanation = `${leftVal} is less than ${rightVal}, so ${leftDisplay} < ${rightDisplay}! The alligator mouth opens to the bigger number.`;
    }

    return {
      id: `math_compare_${Date.now()}_${randomInt(100, 999)}`,
      type: 'CompareSymbols',
      prompt: 'Compare the numbers. Write >, <, or =',
      promptSpeech: `Compare ${leftDisplay} and ${rightDisplay}. Is it greater than, less than, or equal?`,
      data: {
        leftDisplay,
        rightDisplay,
        leftVal,
        rightVal
      },
      correctAnswer,
      hint,
      explanation
    };
  }
};
