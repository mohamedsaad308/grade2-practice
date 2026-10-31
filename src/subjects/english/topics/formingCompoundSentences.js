import formingCompoundSentencesData from '../content/formingCompoundSentences.json';
import { shuffle } from '../../../utils/mathHelpers.js';

export default {
  id: 'english_forming_compound_sentences',
  title: 'Forming Compound Sentences',
  icon: '🔗',
  description: 'Combine sentences using a comma and a conjunction (and, but, or).',
  getQuestions() {
    return formingCompoundSentencesData.map(q => ({
      ...q,
      data: {
        ...q.data,
        options: shuffle([...q.data.options])
      }
    }));
  }
};
