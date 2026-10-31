import punctuationTwoStepData from '../content/punctuationTwoStep.json';
import { shuffle } from '../../../utils/mathHelpers.js';

export default {
  id: 'english_punctuation_two_step',
  title: 'Find the Sentence & Punctuate It',
  icon: '✏️',
  description: 'Pick the sentence type, then choose the matching end mark.',
  getQuestions() {
    return punctuationTwoStepData.map(q => ({
      ...q,
      data: {
        ...q.data,
        options: shuffle([...q.data.options])
      }
    }));
  }
};
