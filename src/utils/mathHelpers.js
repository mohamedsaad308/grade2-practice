/**
 * Math helper utilities for Grade 2 practice generators.
 * All operations guarantee values strictly within [0, 999] and never negative.
 */

export function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickRandom(array) {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

export function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Splits a number (0-999) into hundreds, tens, and ones parts.
 */
export function decomposeNumber(num) {
  const hundreds = Math.floor(num / 100) * 100;
  const remainder = num % 100;
  const tens = Math.floor(remainder / 10) * 10;
  const ones = remainder % 10;
  return { hundreds, tens, ones };
}

/**
 * Formats a number in expanded form like the Grade 2 worksheet:
 * 325 -> "300 + 20 + 5"
 * 502 -> "500 + 2"
 * 190 -> "100 + 90"
 */
export function toExpandedForm(num) {
  const { hundreds, tens, ones } = decomposeNumber(num);
  const parts = [];
  if (hundreds > 0) parts.push(String(hundreds));
  if (tens > 0) parts.push(String(tens));
  if (ones > 0 || parts.length === 0) parts.push(String(ones));
  return parts.join(' + ');
}

/**
 * Generates digit anagrams for numbers (e.g. 243 -> 234, 324, etc.)
 */
export function generatePermutations3Digits(num) {
  const digits = String(num).padStart(3, '0').split('');
  const permutations = new Set();

  function permute(arr, memo = []) {
    if (arr.length === 0) {
      const val = parseInt(memo.join(''), 10);
      if (val >= 100 && val <= 999) {
        permutations.add(val);
      }
      return;
    }
    for (let i = 0; i < arr.length; i++) {
      const curr = arr.slice();
      const next = curr.splice(i, 1);
      permute(curr, memo.concat(next));
    }
  }

  permute(digits);
  return Array.from(permutations);
}
