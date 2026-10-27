import { randomInt, pickRandom, shuffle, generatePermutations3Digits } from '../../../utils/mathHelpers.js';

/**
 * Topic: Order three numbers from greatest to least
 * Examples from worksheet:
 * a) 243, 234, 324 -> 324, 243, 234
 * b) 718, 781, 178 -> 781, 718, 178
 * c) 456, 465, 546 -> 546, 465, 456
 * d) 309, 390, 903 -> 903, 390, 309
 */
export default {
  id: 'math_order_desc',
  title: 'Order: Greatest to Least',
  icon: '📉',
  description: 'Arrange 3 numbers starting with the biggest (greatest) down to the smallest (least).',
  levels: [1, 2, 3],

  generateQuestion(level = 1) {
    let numbers = [];

    if (level === 1) {
      // 3 distinct hundreds digits
      const hundreds = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
      numbers = hundreds.map(h => h * 100 + randomInt(1, 9) * 10 + randomInt(0, 9));
    } else if (level === 2) {
      // 2 numbers share the same hundred digit, 1 has a different hundred
      const sharedHundred = randomInt(1, 8);
      let otherHundred = randomInt(1, 9);
      while (otherHundred === sharedHundred) otherHundred = randomInt(1, 9);

      const t1 = randomInt(1, 8);
      let t2 = randomInt(1, 8);
      while (t2 === t1) t2 = randomInt(1, 8);

      const n1 = sharedHundred * 100 + t1 * 10 + randomInt(0, 9);
      const n2 = sharedHundred * 100 + t2 * 10 + randomInt(0, 9);
      const n3 = otherHundred * 100 + randomInt(1, 9) * 10 + randomInt(0, 9);
      numbers = [n1, n2, n3];
    } else {
      // Level 3: Numbers that share digits (anagram digits, e.g. 243, 234, 324 or 309, 390, 903)
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
        // Fallback close numbers
        const base = randomInt(200, 800);
        numbers = [base, base + 9, base + 90];
      }
    }

    // Ensure all 3 numbers are unique and > 0
    numbers = Array.from(new Set(numbers));
    while (numbers.length < 3) {
      numbers.push(randomInt(100, 999));
      numbers = Array.from(new Set(numbers));
    }

    // Sort greatest to least for the correct answer
    const sorted = [...numbers].sort((a, b) => b - a);

    // Make sure initial display is not accidentally already sorted
    let initialOrder = shuffle(numbers);
    if (initialOrder.every((val, idx) => val === sorted[idx])) {
      initialOrder = [sorted[1], sorted[0], sorted[2]];
    }

    const hint = 'Find the biggest number first by checking the hundreds place. Put that one on the left (Greatest)!';
    const explanation = `${sorted[0]} is greater than ${sorted[1]}, and ${sorted[1]} is greater than ${sorted[2]}. So the order from Greatest to Least is: ${sorted.join(', ')}.`;

    return {
      id: `math_order_desc_${Date.now()}_${randomInt(100, 999)}`,
      type: 'DragToOrder',
      prompt: 'Order the numbers from Greatest to Least',
      promptSpeech: `Order the numbers ${numbers.join(', ')} from greatest to least.`,
      data: {
        items: initialOrder,
        orderType: 'descending',
        startLabel: 'Greatest',
        endLabel: 'Least'
      },
      correctAnswer: sorted,
      hint,
      explanation
    };
  }
};
