import powerWordsTrueFalseData from '../content/powerWordsTrueFalse.json';

export default {
  id: 'english_power_words_true_false',
  title: 'Power Words: True or False',
  icon: '✔️',
  description: 'Decide if each vocabulary statement is True or False.',
  getQuestions() {
    return powerWordsTrueFalseData.map(q => ({
      ...q,
      data: {
        ...q.data,
        options: ['True', 'False']
      }
    }));
  }
};
