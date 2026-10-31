import sentenceTypesData from '../content/sentenceTypes.json';
import { shuffle } from '../../../utils/mathHelpers.js';

export default {
  id: 'english_sentence_types',
  title: 'What Kind of Sentence Is It?',
  icon: '❓',
  description: 'Decide if the sentence is a command, exclamation, statement, or question.',
  getQuestions() {
    return sentenceTypesData.map(q => ({
      ...q,
      data: {
        ...q.data,
        options: shuffle([...q.data.options])
      }
    }));
  }
};
