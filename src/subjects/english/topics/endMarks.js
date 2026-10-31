import endMarksData from '../content/endMarks.json';

export default {
  id: 'english_end_marks',
  title: 'Punctuation: End Marks (. ? !)',
  icon: '❓',
  description: 'Write the correct end mark for statements, questions, commands, and exclamations.',
  getQuestions() {
    return endMarksData.map(q => ({
      ...q,
      data: {
        ...q.data,
        options: ['.', '?', '!']
      }
    }));
  }
};
