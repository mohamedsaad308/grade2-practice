import csOrCpData from '../content/csOrCp.json';
import { shuffle } from '../../../utils/mathHelpers.js';

export default {
  id: 'english_cs_or_cp',
  title: 'Identify C.S or C.P',
  icon: '✍️',
  description: 'Select C.S for Compound Subject or C.P for Compound Predicate.',
  getQuestions() {
    return csOrCpData.map(q => ({
      ...q,
      data: {
        ...q.data,
        options: shuffle([...q.data.options])
      }
    }));
  }
};
