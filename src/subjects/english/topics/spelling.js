import spellingData from '../content/spelling.json';

export default {
  id: 'english_spelling',
  title: 'Spelling with Pictures',
  icon: '🔤',
  description: 'Look at the picture and tap letter tiles to spell the word.',
  getQuestions() {
    // Return fixed questions in exact order
    return spellingData.map(q => ({
      ...q,
      data: {
        ...q.data,
        scrambled: [...q.data.scrambled]
      }
    }));
  }
};
