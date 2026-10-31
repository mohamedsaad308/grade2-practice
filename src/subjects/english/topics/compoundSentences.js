import compoundSentencesData from '../content/compoundSentences.json';
import { shuffle } from '../../../utils/mathHelpers.js';

export default {
  id: 'english_compound_sentences',
  title: 'Find the Compound Sentences',
  icon: '🪢',
  description: 'Tap to select the sentences that join two complete thoughts.',
  getQuestions() {
    return compoundSentencesData.map(q => ({
      ...q,
      data: {
        ...q.data,
        options: shuffle([...q.data.options])
      }
    }));
  }
};
