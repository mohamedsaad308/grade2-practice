import rawEnglishContent from '../../../content-source/english_content.json';
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
  getQuestions() {
    const sessionCount = Math.min(10, topic.items.length);
    // Pick up to 10 questions at random without repeats
    const selectedItems = shuffle([...topic.items]).slice(0, sessionCount);
    return selectedItems.map((item) => createQuestionInstance(item, topic));
  }
}));

/**
 * 18th Card: "Mixed English Review"
 * Picks 10 random questions across all English topics without repeats
 */
const mixedReviewTopic = {
  id: 'mixed-english-review',
  title: 'Mixed English Review',
  icon: '⭐',
  description: 'Practice 10 random English questions across all topics!',
  type: 'choice', // default topic card type; each item preserves its own item.type
  hint: 'Take your time, read each question carefully, and do your best!',
  levels: [1],
  getQuestions() {
    // Collect all items across all topics paired with their parent topic
    const allItemsWithTopic = rawEnglishContent.topics.flatMap((t) =>
      t.items.map((item) => ({ item, topic: t }))
    );

    const selected = shuffle(allItemsWithTopic).slice(0, 10);
    return selected.map(({ item, topic }) => createQuestionInstance(item, topic));
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
