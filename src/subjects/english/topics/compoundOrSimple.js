import compoundOrSimpleData from '../content/compoundOrSimple.json';

export default {
  id: 'english_compound_or_simple',
  title: 'Simple or Compound Sentence?',
  icon: '⚖️',
  description: 'Identify if a sentence is simple or compound.',
  getQuestions() {
    return compoundOrSimpleData.map(q => ({
      ...q,
      data: {
        ...q.data,
        options: ['Compound sentence', 'Simple sentence']
      }
    }));
  }
};
