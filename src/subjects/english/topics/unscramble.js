import unscrambleData from '../content/unscramble.json';

export default {
  id: 'english_unscramble',
  title: 'Unscramble the Letters',
  icon: '🧩',
  description: 'Unscramble the letters to write the correct word in the sentence.',
  getQuestions() {
    return unscrambleData.map(q => ({
      ...q,
      data: {
        ...q.data,
        scrambled: [...q.data.scrambled]
      }
    }));
  }
};
