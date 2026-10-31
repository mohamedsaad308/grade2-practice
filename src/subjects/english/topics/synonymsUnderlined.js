import synonymsUnderlinedData from '../content/synonymsUnderlined.json';

export default {
  id: 'english_synonyms_underlined',
  title: 'Synonyms in Sentences',
  icon: '🔍',
  description: 'Choose a synonym for the underlined word from the word bank.',
  getQuestions() {
    return synonymsUnderlinedData.map(q => ({ ...q }));
  }
};
