import synonymsData from '../content/synonyms.json';

export default {
  id: 'english_synonyms',
  title: 'Synonyms of Underlined Words',
  icon: '🤝',
  description: 'Find the word in the word bank that means the same as the underlined word.',
  getQuestions() {
    // Word bank cards remain in their stated order (glad, large, warm, clever)
    return synonymsData.map(q => ({
      ...q,
      data: {
        ...q.data,
        wordBank: [...q.data.wordBank]
      }
    }));
  }
};
