import butterflyPassageData from '../content/butterflyPassage.json';
import { shuffle } from '../../../utils/mathHelpers.js';

export default {
  id: 'reading_butterflies_passage',
  title: 'Story: All About Butterflies',
  icon: '🦋',
  description: 'Read the passage about butterflies and answer the reading comprehension questions.',
  getQuestions() {
    // Return questions in fixed order with options shuffled
    return butterflyPassageData.map(q => ({
      ...q,
      data: {
        ...q.data,
        options: shuffle([...q.data.options])
      }
    }));
  }
};
