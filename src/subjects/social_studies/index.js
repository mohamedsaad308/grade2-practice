import shapesContent from './content/shapesAndDimensions.json';
import mapSkillsContent from './content/mapSkillsAndColors.json';
import northernAfricaContent from './content/northernAfricaMap.json';
import matchContent from './content/socialStudiesMatch.json';
import { shuffle } from '../../utils/mathHelpers.js';

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

const topics = rawTopics.map((topic) => ({
  id: topic.id,
  title: topic.title,
  icon: topic.icon,
  description: topic.instruction,
  type: topic.type,
  hint: topic.hint,
  items: topic.items,
  levels: [1],
  getQuestions() {
    const sessionCount = Math.min(10, topic.items.length);
    const selectedItems = shuffle([...topic.items]).slice(0, sessionCount);
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
  getQuestions() {
    const allItems = [];
    rawTopics.forEach((t) => {
      t.items.forEach((item) => {
        allItems.push({ item, topic: t });
      });
    });

    const chosen = shuffle(allItems).slice(0, 10);
    return chosen.map(({ item, topic }) => createQuestionInstance(item, topic));
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
