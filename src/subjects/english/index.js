import rawEnglishContent from '../../../content-source/english_content.json';
import { shuffle } from '../../utils/mathHelpers.js';
import { getItemOutcomes, getCurrentPlayer } from '../../player/playerStorage.js';

/**
 * Build a question instance with shuffled options/marks and topic metadata
 */
function createQuestionInstance(item, topic) {
  if (!item) return null;

  return {
    ...item,
    topicId: topic.id,
    topicTitle: topic.title,
    topicIcon: topic.icon,
    topicHint: topic.hint,
    type: topic.type,
    // Shuffle options and marks each session without mutating original content
    options: item.options ? shuffle([...item.options]) : undefined,
    marks: item.marks ? shuffle([...item.marks]) : undefined,
    // Topic hint shown on first mistake; item explanation on second mistake
    hint: topic.hint,
    explanation:
      item.explanation ||
      (item.answer
        ? `The correct answer is: "${item.answer}"`
        : 'Review the matching pairs and try again!')
  };
}

/**
 * Select questions adaptively per player:
 * Prioritize items missed or unseen first, then fill with first-try mastered items.
 * Shuffles order of selected questions every session.
 */
function selectAdaptiveItems(items, count, explicitPlayerId = null) {
  const playerId = explicitPlayerId || getCurrentPlayer()?.id;
  const outcomes = getItemOutcomes(playerId);

  const missed = [];
  const unseen = [];
  const mastered = [];

  for (const item of items) {
    const stat = outcomes[item.id];
    if (!stat) {
      unseen.push(item);
    } else if (stat.lastOutcome === 'missed' || (stat.missed > 0 && !stat.firstTry)) {
      missed.push(item);
    } else {
      mastered.push(item);
    }
  }

  // Priority pool: missed first, then unseen
  const priorityPool = [...shuffle(missed), ...shuffle(unseen)];
  const remainingPool = shuffle(mastered);

  let selected = [];
  if (priorityPool.length >= count) {
    selected = priorityPool.slice(0, count);
  } else {
    selected = [...priorityPool, ...remainingPool.slice(0, count - priorityPool.length)];
  }

  // Final shuffle so child sees no pattern in question order
  return shuffle(selected);
}

/**
 * Generate 17 individual topics directly from english_content.json
 */
const topics = rawEnglishContent.topics.map((topic) => ({
  id: topic.id,
  title: topic.title,
  icon: topic.icon,
  description: topic.instruction,
  type: topic.type,
  hint: topic.hint,
  source: topic.source,
  items: topic.items,
  // Single level only
  levels: [1],
  getQuestions(level = 1, playerId = null) {
    const sessionCount = Math.min(10, topic.items.length);
    const selectedItems = selectAdaptiveItems(topic.items, sessionCount, playerId);
    return selectedItems.map((item) => createQuestionInstance(item, topic));
  }
}));

/**
 * 18th Card: "Mixed English Review"
 * Picks 10 random English questions across all topics prioritizing missed/unseen
 */
const mixedReviewTopic = {
  id: 'mixed-english-review',
  title: 'Mixed English Review',
  icon: '⭐',
  description: 'Practice 10 random English questions across all topics!',
  type: 'choice', // default topic card type; each item preserves its own item.type
  hint: 'Take your time, read each question carefully, and do your best!',
  levels: [1],
  getQuestions(level = 1, playerId = null) {
    // Collect all items across all topics paired with their parent topic
    const allItemsWithTopic = rawEnglishContent.topics.flatMap((t) =>
      t.items.map((item) => ({ ...item, _parentTopic: t }))
    );

    const selected = selectAdaptiveItems(allItemsWithTopic, 10, playerId);
    return selected.map((item) => createQuestionInstance(item, item._parentTopic));
  }
};

export default {
  id: 'english',
  title: 'English',
  icon: '📚',
  color: '#EC4899', // Playful Pink
  lightColor: '#FDF2F8',
  description: 'Power words, vocabulary, synonyms, punctuation, and sentence grammar for Grade 2 superstars!',
  isAvailable: true,
  topics: [...topics, mixedReviewTopic]
};
