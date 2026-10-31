import punctuationStmtData from '../content/punctuationStatement.json';
import { shuffle } from '../../../utils/mathHelpers.js';

export default {
  id: 'english_punct_statement',
  title: 'Punctuation: Find the Statement',
  icon: '🖊️',
  description: 'Pick the sentence that is a statement, then choose the correct end mark.',
  getQuestions() {
    return punctuationStmtData.map(q => ({
      ...q,
      data: {
        ...q.data,
        options: shuffle([...q.data.options])
      }
    }));
  }
};
