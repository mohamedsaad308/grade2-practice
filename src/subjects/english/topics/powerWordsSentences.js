import powerWordsSentencesData from '../content/powerWordsSentences.json';

export default {
  id: 'english_power_words_sentences',
  title: 'Power Words in Sentences',
  icon: '⭐',
  description: 'Complete each sentence using the Power Word bank.',
  getQuestions() {
    return powerWordsSentencesData.map(q => ({ ...q }));
  }
};
