import changeSentenceTypesData from '../content/changeSentenceTypes.json';
import { shuffle } from '../../../utils/mathHelpers.js';

export default {
  id: 'english_change_sentence_types',
  title: 'Change Kinds of Sentences',
  icon: '🔄',
  description: 'Change sentences to statements, questions, or commands.',
  getQuestions() {
    return changeSentenceTypesData.map(q => ({
      ...q,
      data: {
        ...q.data,
        options: shuffle([...q.data.options])
      }
    }));
  }
};
