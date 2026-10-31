import powerWordsDefinitionsData from '../content/powerWordsDefinitions.json';

export default {
  id: 'english_power_words_definitions',
  title: 'Power Word Definitions',
  icon: '📖',
  description: 'Match each definition with the correct Power Word.',
  getQuestions() {
    return powerWordsDefinitionsData.map(q => ({ ...q }));
  }
};
