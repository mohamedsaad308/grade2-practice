import matchPairsData from '../content/matchPairs.json';

export default {
  id: 'english_vocab_match',
  title: 'Vocabulary: Match Word with Meaning',
  icon: '🔗',
  description: 'Tap a vocabulary word, then tap its meaning to pair them together.',
  getQuestions() {
    return matchPairsData.map(q => ({
      ...q,
      data: {
        ...q.data,
        pairs: [...q.data.pairs]
      }
    }));
  }
};
