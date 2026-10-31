import powerWordsQuestionsData from '../content/powerWordsQuestions.json';
import { shuffle } from '../../../utils/mathHelpers.js';

export default {
  id: 'english_power_words_questions',
  title: 'Power Words Q&A',
  icon: '🤔',
  description: 'Answer questions about natural disasters, feelings, and words.',
  getQuestions() {
    return powerWordsQuestionsData.map(q => ({
      ...q,
      data: {
        ...q.data,
        options: shuffle([...q.data.options])
      }
    }));
  }
};
