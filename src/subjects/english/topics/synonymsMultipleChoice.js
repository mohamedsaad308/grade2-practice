import synonymsMultipleChoiceData from '../content/synonymsMultipleChoice.json';
import { shuffle } from '../../../utils/mathHelpers.js';

export default {
  id: 'english_synonyms_multiple_choice',
  title: 'Synonyms (Words That Mean the Same)',
  icon: '👯',
  description: 'Find the synonym for fast, easy, begin, beautiful, and more.',
  getQuestions() {
    return synonymsMultipleChoiceData.map(q => ({
      ...q,
      data: {
        ...q.data,
        options: shuffle([...q.data.options])
      }
    }));
  }
};
