import subjectOrPredicateData from '../content/subjectOrPredicate.json';
import { shuffle } from '../../../utils/mathHelpers.js';

export default {
  id: 'english_subject_or_predicate',
  title: 'Compound Subject or Predicate?',
  icon: '👥',
  description: 'Identify if the sentence has two doers (subject) or two actions (predicate).',
  getQuestions() {
    return subjectOrPredicateData.map(q => ({
      ...q,
      data: {
        ...q.data,
        options: shuffle([...q.data.options])
      }
    }));
  }
};
