/**
 * Reading Subject Plugin Template
 */

export default {
  id: 'reading',
  title: 'Reading',
  icon: '📖',
  color: '#8B5CF6', // Purple
  lightColor: '#F5F3FF',
  description: 'Comprehension, sequencing, and story questions for Grade 2 readers!',
  isAvailable: false,
  topics: [
    /*
    {
      id: 'reading_sequencing',
      title: 'Story Sequencing',
      icon: '🔄',
      description: 'Order the story events: First, Next, and Last.',
      levels: [1, 2, 3],
      generateQuestion(level) {
        return {
          id: `read_seq_${Date.now()}`,
          type: 'DragToOrder',
          prompt: 'Put the story steps in order from First to Last:',
          data: {
            items: ['Eat the sandwich', 'Put peanut butter on bread', 'Get two slices of bread'],
            orderType: 'story',
            startLabel: 'First',
            endLabel: 'Last'
          },
          correctAnswer: ['Get two slices of bread', 'Put peanut butter on bread', 'Eat the sandwich'],
          hint: 'Think about what you need to do before making the sandwich!',
          explanation: 'First get the bread, then make it, then eat it!'
        };
      }
    }
    */
  ]
};
