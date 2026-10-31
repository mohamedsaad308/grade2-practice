import characterTraitsData from '../content/characterTraits.json';
import { shuffle } from '../../../utils/mathHelpers.js';

export default {
  id: 'reading_character_traits',
  title: 'Character Traits',
  icon: '🎭',
  description: 'Read the short paragraph and choose the word that describes the character.',
  getQuestions() {
    // Return questions in fixed order with options shuffled
    return characterTraitsData.map(q => ({
      ...q,
      data: {
        ...q.data,
        options: shuffle([...q.data.options])
      }
    }));
  }
};
