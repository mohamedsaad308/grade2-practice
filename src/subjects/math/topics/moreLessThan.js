import { randomInt, pickRandom, getQuestionSignature } from '../../../utils/mathHelpers.js';

/**
 * Topic: More or Less Than
 * Examples:
 * "100 more than 482 is __"
 * "10 less than 561 is __"
 * "1 more than 379 is __"
 * "2 less than 630 is __"
 * "10 more than 295 is __"
 * "5 less than 417 is __"
 * "100 less than 850 is __"
 */
export default {
  id: 'math_more_less',
  title: 'More or Less Than',
  icon: '➕',
  description: 'Practice adding and subtracting 1, 2, 5, 10, or 100 with 3-digit numbers.',
  levels: [1, 2, 3],

  generateQuestion(level = 1) {
    let delta;
    let operation; // 'more' or 'less'
    let base;
    let answer;

    // Deltas and operations based on level across full 0-999 range
    if (level === 1) {
      // Level 1: Basic 1, 10, 100 across the full 10-999 range
      delta = pickRandom([1, 10, 100]);
      operation = pickRandom(['more', 'less']);

      if (operation === 'more') {
        const maxBase = 999 - delta;
        base = randomInt(10, maxBase);
        answer = base + delta;
      } else {
        const minBase = delta;
        base = randomInt(minBase, 999);
        answer = base - delta;
      }
    } else if (level === 2) {
      // Level 2: Includes 1, 2, 5, 10, 100, with varied transitions
      delta = pickRandom([1, 2, 5, 10, 100]);
      operation = pickRandom(['more', 'less']);

      const mode = Math.random();
      if (mode < 0.45) {
        // Crossing ten boundaries
        if (operation === 'less') {
          delta = pickRandom([2, 5, 10]);
          const tens = randomInt(1, 99); // across 2-digit and 3-digit
          const ones = delta === 2 ? pickRandom([0, 1]) : pickRandom([0, 1, 2, 3, 4]);
          base = Math.max(delta, tens * 10 + ones);
          if (base > 999) base = randomInt(100, 990);
          answer = base - delta;
        } else {
          delta = pickRandom([2, 5, 10]);
          // Crossing ten up (e.g. 295 + 10 -> 305, 388 + 5 -> 393, 429 + 2 -> 431)
          const h = randomInt(0, 8);
          const t = delta === 10 ? 9 : randomInt(0, 8);
          const ones = delta === 10 ? randomInt(0, 9) : randomInt(7, 9);
          base = Math.min(999 - delta, h * 100 + t * 10 + ones);
          answer = base + delta;
        }
      } else {
        // Full range 10-999
        if (operation === 'more') {
          base = randomInt(10, 999 - delta);
          answer = base + delta;
        } else {
          base = randomInt(delta, 999);
          answer = base - delta;
        }
      }
    } else {
      // Level 3: Advanced place value boundary crossings across the full 0-999 range
      const trickyTypes = [
        // 1 more than 9 or 99 boundary (e.g. 199 + 1 -> 200, 39 + 1 -> 40, 789 + 1 -> 790)
        () => {
          operation = 'more';
          delta = 1;
          const isDoubleNine = Math.random() < 0.5;
          if (isDoubleNine) {
            const h = randomInt(0, 8);
            base = h * 100 + 99;
          } else {
            const tens = randomInt(1, 98);
            base = tens * 10 + 9;
          }
          answer = base + 1;
        },
        // 1 less than 0 or 00 boundary (e.g. 400 - 1 -> 399, 210 - 1 -> 209)
        () => {
          operation = 'less';
          delta = 1;
          const isDoubleZero = Math.random() < 0.5;
          if (isDoubleZero) {
            const h = randomInt(1, 9);
            base = h * 100;
          } else {
            const tens = randomInt(2, 99);
            base = tens * 10;
          }
          answer = base - 1;
        },
        // 10 more crossing hundred (e.g. 295 + 10 -> 305, 92 + 10 -> 102)
        () => {
          operation = 'more';
          delta = 10;
          const h = randomInt(0, 8);
          base = h * 100 + 90 + randomInt(0, 9);
          answer = base + 10;
        },
        // 10 less crossing hundred (e.g. 405 - 10 -> 395, 102 - 10 -> 92)
        () => {
          operation = 'less';
          delta = 10;
          const h = randomInt(1, 9);
          base = h * 100 + randomInt(0, 9);
          answer = base - 10;
        },
        // 2 less crossing ten or hundred (e.g. 630 - 2 -> 628, 501 - 2 -> 499)
        () => {
          operation = 'less';
          delta = 2;
          const tens = randomInt(1, 99);
          base = tens * 10 + pickRandom([0, 1]);
          answer = base - 2;
        },
        // 5 less crossing ten or hundred (e.g. 502 - 5 -> 497, 413 - 5 -> 408)
        () => {
          operation = 'less';
          delta = 5;
          const tens = randomInt(1, 99);
          base = tens * 10 + randomInt(0, 4);
          answer = base - 5;
        },
        // 100 more across full spectrum
        () => {
          operation = 'more';
          delta = 100;
          base = randomInt(10, 899);
          answer = base + 100;
        },
        // 100 less across full spectrum
        () => {
          operation = 'less';
          delta = 100;
          base = randomInt(100, 999);
          answer = base - 100;
        }
      ];

      pickRandom(trickyTypes)();
    }

    // Strict safety clamp: guaranteed within [0, 999]
    if (answer < 0) {
      base = delta;
      answer = 0;
    } else if (answer > 999) {
      base = 999 - delta;
      answer = 999;
    }

    const promptText = `${delta} ${operation} than ${base} is`;

    // Teaching hint tailored to the operation and place value
    let hint;
    if (delta === 100) {
      hint = operation === 'more'
        ? `Look at the hundreds digit in ${base}. Add 1 to make it 100 more!`
        : `Look at the hundreds digit in ${base}. Subtract 1 to make it 100 less!`;
    } else if (delta === 10) {
      hint = operation === 'more'
        ? `Look at the tens digit in ${base}. Add 10 to it!`
        : `Look at the tens digit in ${base}. Subtract 10 from it!`;
    } else if (delta === 1) {
      hint = operation === 'more'
        ? `What number comes right after ${base}?`
        : `What number comes right before ${base}?`;
    } else {
      hint = operation === 'more'
        ? `Count up ${delta} steps starting from ${base}.`
        : `Count backwards ${delta} steps from ${base}.`;
    }

    const explanation = operation === 'more'
      ? `${base} + ${delta} = ${answer}. So ${delta} more than ${base} is ${answer}!`
      : `${base} - ${delta} = ${answer}. So ${delta} less than ${base} is ${answer}!`;

    const question = {
      id: `math_more_less_${Date.now()}_${randomInt(1000, 9999)}`,
      type: 'FillInNumber',
      prompt: `${promptText} _____`,
      promptSpeech: `${delta} ${operation} than ${base} is what number?`,
      data: {
        base,
        delta,
        operation
      },
      correctAnswer: answer,
      hint,
      explanation
    };

    question.signature = getQuestionSignature(question);
    return question;
  }
};
