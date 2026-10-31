import subjectOrPredicateData from '../content/subjectOrPredicate.json';

export default {
  id: 'english_subject_or_predicate',
  title: 'Compound Subject or Predicate?',
  icon: '👥',
  description: 'Choose whether a sentence has a compound subject or compound predicate.',
  getQuestions() {
    return subjectOrPredicateData.map(q => ({
      ...q,
      data: {
        ...q.data,
        options: ['Compound subject', 'Compound predicate']
      }
    }));
  }
};
