import sentenceTypesData from '../content/sentenceTypes.json';
import { shuffle } from '../../../utils/mathHelpers.js';

export default {
  id: 'english_sentence_types',
  title: 'Kinds of Sentences',
  icon: '💬',
  description: 'Identify statement, question, command, or exclamation.',
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
