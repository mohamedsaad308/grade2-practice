import simpleOrCompoundData from '../content/simpleOrCompound.json';
import { shuffle } from '../../../utils/mathHelpers.js';

export default {
  id: 'english_simple_or_compound',
  title: 'Simple or Compound Sentence?',
  icon: '⚖️',
  description: 'Identify whether each sentence is simple or compound.',
  getQuestions() {
    return simpleOrCompoundData.map(q => ({
      ...q,
      data: {
        ...q.data,
        options: shuffle([...q.data.options])
      }
    }));
  }
};
