import { randomInt, pickRandom } from '../../../utils/mathHelpers.js';

/**
 * Topic: More / Less Than
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

    // Deltas based on level
    if (level === 1) {
      // Basic 1, 10, 100 without crossing boundaries
      delta = pickRandom([1, 10, 100]);
      operation = pickRandom(['more', 'less']);

      if (operation === 'more') {
        if (delta === 100) base = randomInt(1, 8) * 100 + randomInt(0, 9) * 10 + randomInt(0, 9);
        else if (delta === 10) base = randomInt(1, 8) * 100 + randomInt(0, 7) * 10 + randomInt(0, 9);
        else base = randomInt(1, 8) * 100 + randomInt(0, 8) * 10 + randomInt(0, 7);
        answer = base + delta;
      } else {
        if (delta === 100) base = randomInt(2, 9) * 100 + randomInt(0, 9) * 10 + randomInt(0, 9);
        else if (delta === 10) base = randomInt(1, 9) * 100 + randomInt(2, 9) * 10 + randomInt(0, 9);
        else base = randomInt(1, 9) * 100 + randomInt(0, 9) * 10 + randomInt(2, 9);
        answer = base - delta;
      }
    } else if (level === 2) {
      // Includes 2 and 5, some crossing tens place (e.g. 630 - 2, 417 - 5, 295 + 10)
      delta = pickRandom([1, 2, 5, 10, 100]);
      operation = pickRandom(['more', 'less']);

      const scenarios = [
        // Crossing ten down: ends in 0..1 with -2, or ends in 0..4 with -5
        () => {
          operation = 'less';
          delta = pickRandom([2, 5]);
          const tens = randomInt(1, 9);
          base = randomInt(1, 8) * 100 + tens * 10 + (delta === 2 ? 0 : randomInt(0, 4));
          answer = base - delta;
        },
        // Crossing ten up: e.g. 295 + 10 -> 305
        () => {
          operation = 'more';
          delta = 10;
          base = randomInt(1, 8) * 100 + 90 + randomInt(0, 9);
          answer = base + delta;
        },
        // Standard 100 more or less
        () => {
          delta = 100;
          operation = pickRandom(['more', 'less']);
          base = operation === 'more' ? randomInt(100, 850) : randomInt(150, 950);
          answer = operation === 'more' ? base + 100 : base - 100;
        },
        // 5 or 2 more/less standard
        () => {
          delta = pickRandom([2, 5]);
          operation = pickRandom(['more', 'less']);
          base = randomInt(100, 890);
          answer = operation === 'more' ? base + delta : base - delta;
        }
      ];

      pickRandom(scenarios)();
    } else {
      // Level 3: Crossing place values (e.g. 1 more than 399 -> 400, 10 less than 405 -> 395, 2 less than 630 -> 628)
      const trickyScenarios = [
        // 1 more than 99 boundary (e.g. 399 + 1 -> 400)
        () => {
          operation = 'more';
          delta = 1;
          const h = randomInt(1, 8);
          base = h * 100 + 99;
          answer = base + 1;
        },
        // 10 more crossing hundred (e.g. 295 + 10 -> 305)
        () => {
          operation = 'more';
          delta = 10;
          const h = randomInt(1, 8);
          base = h * 100 + 90 + randomInt(0, 9);
          answer = base + 10;
        },
        // 2 less crossing ten (e.g. 630 - 2 -> 628)
        () => {
          operation = 'less';
          delta = 2;
          base = randomInt(1, 8) * 100 + randomInt(1, 9) * 10;
          answer = base - 2;
        },
        // 10 less crossing hundred (e.g. 405 - 10 -> 395)
        () => {
          operation = 'less';
          delta = 10;
          base = randomInt(2, 9) * 100 + randomInt(0, 9);
          answer = base - 10;
        },
        // 100 less than numbers with tens/ones (e.g. 100 less than 850 is 750)
        () => {
          operation = 'less';
          delta = 100;
          base = randomInt(2, 9) * 100 + randomInt(0, 9) * 10 + randomInt(0, 9);
          answer = base - 100;
        },
        // 5 less than tricky (e.g. 5 less than 417 is 412, or 5 less than 502 is 497)
        () => {
          operation = 'less';
          delta = 5;
          base = pickRandom([
            randomInt(1, 8) * 100 + randomInt(1, 9) * 10 + 7, // 417 -> 412
            randomInt(2, 8) * 100 + randomInt(0, 4)           // 502 -> 497
          ]);
          answer = base - 5;
        }
      ];

      pickRandom(trickyScenarios)();
    }

    // Safety checks: within 0 to 999
    if (answer < 0) {
      base = 100;
      delta = 10;
      operation = 'more';
      answer = 110;
    }
    if (answer > 999) {
      base = 800;
      delta = 100;
      operation = 'less';
      answer = 700;
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

    return {
      id: `math_more_less_${Date.now()}_${randomInt(100, 999)}`,
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
  }
};
