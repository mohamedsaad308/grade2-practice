import shapesContent from './content/shapesAndDimensions.json';
import mapSkillsContent from './content/mapSkillsAndColors.json';
import northernAfricaContent from './content/northernAfricaMap.json';
import matchContent from './content/socialStudiesMatch.json';
import { shuffle } from '../../../../utils/mathHelpers.js';
import { getItemOutcomes, getCurrentPlayer } from '../../../../player/playerStorage.js';

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
    // Shuffle options for choice questions
    options: item.options ? shuffle([...item.options]) : undefined,
    hint: topic.hint,
    explanation:
      item.explanation ||
      (item.answer
        ? `The correct answer is: "${item.answer}"`
        : 'Review the matching pairs and try again!')
  };
}

const rawTopics = [
  { ...shapesContent, type: 'choice' },
  { ...mapSkillsContent, type: 'choice' },
  { ...northernAfricaContent, type: 'choice' },
  { ...matchContent, type: 'match' }
];

function selectAdaptiveSocialItems(items, count, explicitPlayerId = null, termId = 'q1') {
  const playerId = explicitPlayerId || getCurrentPlayer()?.id;
  const outcomes = getItemOutcomes(playerId, termId, 'social_studies');

  const missed = [];
  const unseen = [];
  const mastered = [];

  for (const item of items) {
    const itemId = item.id || item.item?.id;
    const stat = itemId ? outcomes[itemId] : null;
    if (!stat) {
      unseen.push(item);
    } else if (stat.lastOutcome === 'missed' || (stat.missed > 0 && !stat.firstTry)) {
      missed.push(item);
    } else {
      mastered.push(item);
    }
  }

  const priorityPool = [...shuffle(missed), ...shuffle(unseen)];
  const remainingPool = shuffle(mastered);

  let selected = [];
  if (priorityPool.length >= count) {
    selected = priorityPool.slice(0, count);
  } else {
    selected = [...priorityPool, ...remainingPool.slice(0, count - priorityPool.length)];
  }
  return shuffle(selected);
}

const topics = rawTopics.map((topic) => ({
  id: topic.id,
  title: topic.title,
  icon: topic.icon,
  description: topic.instruction,
  type: topic.type,
  hint: topic.hint,
  items: topic.items,
  levels: [1],
  getQuestions(level = 1, playerId = null, termId = 'q1') {
    const sessionCount = Math.min(10, topic.items.length);
    const selectedItems = selectAdaptiveSocialItems(topic.items, sessionCount, playerId, termId);
    return selectedItems.map((item) => createQuestionInstance(item, topic));
  }
}));

/**
 * 5th Card: "Mixed Review (SOC STUD)"
 * Picks 10 random questions across all Social Studies topics
 */
const mixedReviewTopic = {
  id: 'soc_mixed_review',
  title: 'Mixed Review (SOC STUD)',
  icon: '⭐',
  description: 'Practice 10 random questions across all Social Studies topics!',
  hint: 'Take your time, think about what you learned about maps, colors, shapes, and Northern Africa!',
  levels: [1],
  getQuestions(level = 1, playerId = null, termId = 'q1') {
    const allItems = [];
    rawTopics.forEach((t) => {
      t.items.forEach((item) => {
        allItems.push({ ...item, _topicRef: t });
      });
    });

    const chosen = selectAdaptiveSocialItems(allItems, 10, playerId, termId);
    return chosen.map(({ _topicRef, ...cleanItem }) => createQuestionInstance(cleanItem, _topicRef));
  }
};

export default {
  id: 'social_studies',
  title: 'Social Studies (SOC STUD)',
  shortTitle: 'SOC STUD',
  icon: '🌍',
  color: '#D97706',
  lightColor: '#FEF3C7',
  description: 'Maps, 2D & 3D shapes, map keys, colors, and Northern Africa countries!',
  isAvailable: true,
  topics: [...topics, mixedReviewTopic]
};
