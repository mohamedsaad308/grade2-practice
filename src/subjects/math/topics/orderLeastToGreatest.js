import { randomInt, pickRandom, shuffle, generatePermutations3Digits, getQuestionSignature } from '../../../utils/mathHelpers.js';

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
      // 3 distinct hundreds digits across the full 0-999 range
      const hundreds = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
      numbers = hundreds.map(h => h * 100 + randomInt(0, 9) * 10 + randomInt(0, 9));
    } else if (level === 2) {
      // 2 numbers share the same hundred digit, 1 has a different hundred
      const sharedHundred = randomInt(1, 9);
      let otherHundred = randomInt(1, 9);
      while (otherHundred === sharedHundred) otherHundred = randomInt(1, 9);

      const t1 = randomInt(0, 9);
      let t2 = randomInt(0, 9);
      while (t2 === t1) t2 = randomInt(0, 9);

      const n1 = sharedHundred * 100 + t1 * 10 + randomInt(0, 9);
      const n2 = sharedHundred * 100 + t2 * 10 + randomInt(0, 9);
      const n3 = otherHundred * 100 + randomInt(0, 9) * 10 + randomInt(0, 9);
      numbers = [n1, n2, n3];
    } else {
      // Level 3: Dynamic anagrams and tricky digit patterns (not a short fixed list)
      const patternMode = Math.random();

      if (patternMode < 0.65) {
        // Dynamic distinct 3-digit anagrams from full 0-9 pool
        let attempts = 0;
        let perms = [];
        while (perms.length < 3 && attempts < 20) {
          attempts++;
          const d1 = randomInt(1, 9);
          const d2 = randomInt(0, 9);
          const d3 = randomInt(0, 9);
          if (d1 !== d2 && d2 !== d3 && d1 !== d3) {
            const seed = d1 * 100 + d2 * 10 + d3;
            perms = generatePermutations3Digits(seed);
          }
        }
        if (perms.length >= 3) {
          numbers = shuffle(perms).slice(0, 3);
        } else {
          const base = randomInt(100, 850);
          numbers = [base, base + 9, base + 90];
        }
      } else if (patternMode < 0.85) {
        // Double digit patterns (e.g. 177, 717, 771)
        const dA = randomInt(1, 9);
        let dB = randomInt(1, 9);
        while (dB === dA) dB = randomInt(1, 9);
        numbers = shuffle([
          dA * 100 + dA * 10 + dB,
          dA * 100 + dB * 10 + dA,
          dB * 100 + dA * 10 + dA
        ]);
      } else {
        // Subtle close numbers sharing same hundred and tens
        const h = randomInt(1, 9);
        const t = randomInt(0, 9);
        const ones = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
        numbers = ones.map(o => h * 100 + t * 10 + o);
      }
    }

    // Ensure all 3 numbers are unique and strictly in [0, 999]
    numbers = Array.from(new Set(numbers.map(n => Math.max(0, Math.min(999, n)))));
    while (numbers.length < 3) {
      numbers.push(randomInt(10, 999));
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

    const question = {
      id: `math_order_asc_${Date.now()}_${randomInt(1000, 9999)}`,
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

    question.signature = getQuestionSignature(question);
    return question;
  }
};
