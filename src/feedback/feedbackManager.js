import { feedbackMessages } from './messages.js';

// Tracks the last chosen template per category to prevent repeating twice consecutively
const lastChosenTemplate = {};

/**
 * Resets the history of chosen templates (useful for unit tests).
 */
export function resetFeedbackHistory() {
  for (const key in lastChosenTemplate) {
    delete lastChosenTemplate[key];
  }
}

/**
 * Retrieves a personalized feedback string.
 * Guarantees the same template is never returned twice consecutively for the same type.
 *
 * @param {string} type - 'correct' | 'correctSecondTry' | 'streak3' | 'streak5' | 'perfectSession' | 'wrong' | 'sessionEnd'
 * @param {string} playerName - Child's first name
 * @param {object} [extra] - e.g. { n: 10, stars: 10 }
 * @returns {string} Formatted personalized praise or gentle hint message
 */
export function getFeedback(type, playerName, extra = {}) {
  const templates = feedbackMessages[type] || feedbackMessages.correct;
  const name = (playerName && playerName.trim()) ? playerName.trim() : 'Friend';

  if (!templates || templates.length === 0) {
    return `Great job, ${name}!`;
  }

  // Filter out the last chosen template if more than 1 template is available
  const last = lastChosenTemplate[type];
  let eligible = templates.filter(t => t !== last);
  if (eligible.length === 0) {
    eligible = templates;
  }

  const chosen = eligible[Math.floor(Math.random() * eligible.length)];
  lastChosenTemplate[type] = chosen;

  // Substitute {name} and {n}
  let message = chosen.replace(/{name}/g, name);
  const nVal = extra.n !== undefined ? extra.n : (extra.stars !== undefined ? extra.stars : 0);
  message = message.replace(/{n}/g, String(nVal));

  return message;
}

/**
 * Strips the player's dynamic name from a formatted feedback message so
 * static pre-generated MP3 audio clips match feedback templates cleanly.
 */
export function getFeedbackAudioText(message, playerName) {
  let out = String(message || '').trim();
  const name = (playerName && playerName.trim()) ? playerName.trim() : 'Friend';
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  out = out
    .replace(new RegExp(`^${escaped},\\s*`, 'i'), '')
    .replace(new RegExp(`\\s+for\\s+${escaped}(?=[!.?]|$)`, 'gi'), '')
    .replace(new RegExp(`,\\s*${escaped}(?=[!.?,]|$)`, 'gi'), '')
    .replace(new RegExp(`\\s+${escaped}(?=[!.?,]|$)`, 'gi'), '')
    .replace(/\s+/g, ' ')
    .trim();

  if (out) {
    out = out.charAt(0).toUpperCase() + out.slice(1);
  }
  return out;
}
