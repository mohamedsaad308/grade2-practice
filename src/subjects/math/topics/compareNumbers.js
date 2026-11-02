import { randomInt, pickRandom, toExpandedForm, getQuestionSignature } from '../../../utils/mathHelpers.js';

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

    // "=" included at a natural rate of about 1 in 6 (~16.7%)
    const shouldBeEqual = Math.random() < (1 / 6);

    if (shouldBeEqual) {
      const val = randomInt(10, 999);
      leftVal = val;
      rightVal = val;

      const formatStyle = pickRandom(['right_expanded', 'left_expanded', 'both_plain']);
      if (formatStyle === 'right_expanded') {
        leftDisplay = String(val);
        rightDisplay = toExpandedForm(val);
      } else if (formatStyle === 'left_expanded') {
        leftDisplay = toExpandedForm(val);
        rightDisplay = String(val);
      } else {
        leftDisplay = String(val);
        rightDisplay = String(val);
      }
    } else {
      // Unequal: strictly 50% left is bigger (>), 50% right is bigger (<)
      const leftIsBigger = Math.random() < 0.5;
      let v1 = 0;
      let v2 = 0;

      if (level === 1) {
        // Level 1: Clear difference in hundreds or simple tens across full 0-999
        const style = pickRandom(['plain', 'expanded']);
        if (style === 'plain') {
          let h1 = randomInt(1, 9);
          let h2 = randomInt(1, 9);
          while (h2 === h1) h2 = randomInt(1, 9);
          v1 = h1 * 100 + randomInt(0, 9) * 10 + randomInt(0, 9);
          v2 = h2 * 100 + randomInt(0, 9) * 10 + randomInt(0, 9);
        } else {
          v1 = randomInt(100, 950);
          const delta = pickRandom([10, 20, 100, 200]);
          v2 = Math.min(999, Math.max(10, v1 + (Math.random() < 0.5 ? delta : -delta)));
          if (v1 === v2) v2 = v1 + 10;
        }
      } else if (level === 2) {
        // Level 2: Tens swap or subtle expanded differences
        const style = pickRandom(['tens_swap', 'expanded_subtle']);
        if (style === 'tens_swap') {
          const d1 = randomInt(1, 9);
          let d2 = randomInt(1, 9);
          while (d2 === d1) d2 = randomInt(1, 9);
          const d3 = randomInt(0, 9);
          v1 = d1 * 100 + d2 * 10 + d3;
          v2 = d2 * 100 + d1 * 10 + d3;
        } else {
          // Subtle difference with expanded form
          const base = randomInt(100, 950);
          const diff = pickRandom([1, 2, 5, 10, 20]);
          v1 = base;
          v2 = Math.min(999, Math.max(10, base + diff));
        }
      } else {
        // Level 3: Tricky digit permutations across the full range
        const swapType = pickRandom(['swap_tens_ones', 'zero_tens', 'hundreds_tens_swap']);
        if (swapType === 'swap_tens_ones') {
          // e.g. 418 vs 481, 345 vs 354
          const h = randomInt(1, 9);
          const t = randomInt(0, 9);
          let o = randomInt(0, 9);
          while (o === t) o = randomInt(0, 9);
          v1 = h * 100 + t * 10 + o;
          v2 = h * 100 + o * 10 + t;
        } else if (swapType === 'zero_tens') {
          // e.g. 207 vs 270, 502 vs 520
          const h = randomInt(1, 9);
          const digit = randomInt(1, 9);
          v1 = h * 100 + digit;        // e.g. 207
          v2 = h * 100 + digit * 10;   // e.g. 270
        } else {
          // e.g. 650 vs 560
          const h = randomInt(1, 9);
          let t = randomInt(1, 9);
          while (t === h) t = randomInt(1, 9);
          const o = randomInt(0, 9);
          v1 = h * 100 + t * 10 + o;
          v2 = t * 100 + h * 10 + o;
        }
      }

      // Safety: ensure v1 and v2 are distinct and in range [0, 999]
      if (v1 === v2) v2 = Math.min(999, v1 + 10);
      v1 = Math.max(0, Math.min(999, v1));
      v2 = Math.max(0, Math.min(999, v2));

      const smaller = Math.min(v1, v2);
      const bigger = Math.max(v1, v2);

      leftVal = leftIsBigger ? bigger : smaller;
      rightVal = leftIsBigger ? smaller : bigger;

      // Decide presentation format (plain vs expanded)
      const useExpanded = Math.random() < 0.4;
      if (useExpanded) {
        if (Math.random() < 0.5) {
          leftDisplay = String(leftVal);
          rightDisplay = toExpandedForm(rightVal);
        } else {
          leftDisplay = toExpandedForm(leftVal);
          rightDisplay = String(rightVal);
        }
      } else {
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

    const question = {
      id: `math_compare_${Date.now()}_${randomInt(1000, 9999)}`,
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

    question.signature = getQuestionSignature(question);
    return question;
  }
};
