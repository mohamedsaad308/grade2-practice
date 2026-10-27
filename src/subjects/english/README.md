# English Subject Guide

This folder contains the English subject module.

## How to add a new topic to English:

1. Create a topic file in `src/subjects/english/topics/<topicName>.js`:
```javascript
export default {
  id: 'english_nouns_verbs',
  title: 'Nouns and Verbs',
  icon: '🏃',
  description: 'Identify action words and naming words.',
  levels: [1, 2, 3],
  generateQuestion(level) {
    return {
      id: `eng_nv_${Date.now()}_${Math.random()}`,
      type: 'MultipleChoice',
      prompt: 'Which word is a NOUN (a person, place, or thing)?',
      data: {
        options: ['Elephant', 'Jump', 'Quickly', 'Sing']
      },
      correctAnswer: 'Elephant',
      hint: 'A noun is an animal, person, place, or thing you can see or touch!',
      explanation: 'Elephant is a noun because it is an animal.'
    };
  }
};
```

2. Register the topic in `src/subjects/english/index.js`.
3. Set `isAvailable: true` in `index.js`.
4. It will immediately show up in the Grade 2 Stars home screen!
