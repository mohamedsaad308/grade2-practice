import vocabSentencesData from '../content/vocabSentences.json';
import { shuffle } from '../../../utils/mathHelpers.js';

export default {
  id: 'english_vocab_sentences',
  title: 'Vocabulary: Complete the Sentence',
  icon: '📖',
  description: 'Choose the correct vocabulary word to finish each sentence.',
  getQuestions() {
    // Fixed question order, answer options shuffled
    return vocabSentencesData.map(q => ({
      ...q,
      data: {
        ...q.data,
        options: shuffle([...q.data.options])
      }
    }));
  }
};
