import { randomInt, pickRandom, shuffle, generatePermutations3Digits } from '../../../utils/mathHelpers.js';

/**
 * Topic: Order three numbers from least to greatest
 * Examples from worksheet:
 * Arranging 3 numbers ascending
 * e.g. 178, 718, 781
 */
export default {
  id: 'math_order_asc',
  title: 'Order: Least to Greatest',
  icon: '📈',
  description: 'Arrange 3 numbers starting with the smallest (least) up to the biggest (greatest).',
  levels: [1, 2, 3],

  generateQuestion(level = 1) {
    let numbers = [];

    if (level === 1) {
      // 3 distinct hundreds digits
      const hundreds = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
      numbers = hundreds.map(h => h * 100 + randomInt(1, 9) * 10 + randomInt(0, 9));
    } else if (level === 2) {
      // 2 numbers share the same hundred digit, 1 has a different hundred
      const sharedHundred = randomInt(2, 9);
      let otherHundred = randomInt(1, 8);
      while (otherHundred === sharedHundred) otherHundred = randomInt(1, 8);

      const t1 = randomInt(1, 8);
      let t2 = randomInt(1, 8);
      while (t2 === t1) t2 = randomInt(1, 8);

      const n1 = sharedHundred * 100 + t1 * 10 + randomInt(0, 9);
      const n2 = sharedHundred * 100 + t2 * 10 + randomInt(0, 9);
      const n3 = otherHundred * 100 + randomInt(1, 9) * 10 + randomInt(0, 9);
      numbers = [n1, n2, n3];
    } else {
      // Level 3: Numbers sharing digits (anagrams, e.g. 309, 390, 903 or 456, 465, 546)
      const templates = [
        [2, 3, 4],
        [1, 7, 8],
        [4, 5, 6],
        [3, 0, 9],
        [1, 5, 9],
        [2, 7, 9],
        [3, 4, 8],
        [6, 1, 7]
      ];
      const digits = pickRandom(templates);
      const seed = digits[0] * 100 + digits[1] * 10 + digits[2];
      const perms = generatePermutations3Digits(seed);

      if (perms.length >= 3) {
        numbers = shuffle(perms).slice(0, 3);
      } else {
        const base = randomInt(200, 800);
        numbers = [base, base + 9, base + 90];
      }
    }

    numbers = Array.from(new Set(numbers));
    while (numbers.length < 3) {
      numbers.push(randomInt(100, 999));
      numbers = Array.from(new Set(numbers));
    }

    // Sort least to greatest for the correct answer
    const sorted = [...numbers].sort((a, b) => a - b);

    // Make sure initial display is not accidentally already sorted
    let initialOrder = shuffle(numbers);
    if (initialOrder.every((val, idx) => val === sorted[idx])) {
      initialOrder = [sorted[1], sorted[0], sorted[2]];
    }

    const hint = 'Find the smallest number first by checking the hundreds place. Put that one on the left (Least)!';
    const explanation = `${sorted[0]} is less than ${sorted[1]}, and ${sorted[1]} is less than ${sorted[2]}. So the order from Least to Greatest is: ${sorted.join(', ')}.`;

    return {
      id: `math_order_asc_${Date.now()}_${randomInt(100, 999)}`,
      type: 'DragToOrder',
      prompt: 'Order the numbers from Least to Greatest',
      promptSpeech: `Order the numbers ${numbers.join(', ')} from least to greatest.`,
      data: {
        items: initialOrder,
        orderType: 'ascending',
        startLabel: 'Least',
        endLabel: 'Greatest'
      },
      correctAnswer: sorted,
      hint,
      explanation
    };
  }
};
