import vocabRevisionData from '../content/vocabRevision.json';
import { shuffle } from '../../../utils/mathHelpers.js';

export default {
  id: 'english_vocab_revision',
  title: 'Vocabulary Exam Revision',
  icon: '🎯',
  description: 'Vocabulary matching and sentence completion for exam revision.',
  getQuestions() {
    return vocabRevisionData.map(q => {
      if (q.type === 'MultipleChoice' && q.data?.options) {
        return {
          ...q,
          data: {
            ...q.data,
            options: shuffle([...q.data.options])
          }
        };
      }
      return { ...q };
    });
  }
};
