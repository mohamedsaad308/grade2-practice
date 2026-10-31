import csOrCpData from '../content/csOrCp.json';

export default {
  id: 'english_cs_or_cp',
  title: 'Identify C.S or C.P',
  icon: '✍️',
  description: 'Write C.S for Compound Subject or C.P for Compound Predicate.',
  getQuestions() {
    return csOrCpData.map(q => ({
      ...q,
      data: {
        ...q.data,
        options: ['C.S', 'C.P']
      }
    }));
  }
};
