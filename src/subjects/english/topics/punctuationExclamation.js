import punctuationExclData from '../content/punctuationExclamation.json';
import { shuffle } from '../../../utils/mathHelpers.js';

export default {
  id: 'english_punct_exclamation',
  title: 'Punctuation: Find the Exclamation',
  icon: '❗',
  description: 'Pick the sentence that shows an exclamation, then choose the correct end mark.',
  getQuestions() {
    return punctuationExclData.map(q => ({
      ...q,
      data: {
        ...q.data,
        options: shuffle([...q.data.options])
      }
    }));
  }
};
