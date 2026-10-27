/**
 * English Subject Plugin Template
 *
 * To activate English:
 * 1. Implement topic generator(s) in topics/ (e.g. sightWords.js, punctuation.js, nounsVerbs.js)
 * 2. Export the topics below and set isAvailable: true
 * 3. Import and add this subject to src/subjects/index.js
 */

export default {
  id: 'english',
  title: 'English',
  icon: '📚',
  color: '#EC4899', // Playful Pink
  lightColor: '#FDF2F8',
  description: 'Spelling, phonics, sight words, and grammar for Grade 2!',
  isAvailable: false, // Set to true when topics are ready to play!
  topics: [
    /*
    {
      id: 'english_sight_words',
      title: 'Sight Words & Spelling',
      icon: '🔤',
      description: 'Fill in the missing letters or pick the correct word.',
      levels: [1, 2, 3],
      generateQuestion(level) {
        return {
          id: `eng_sight_${Date.now()}`,
          type: 'MultipleChoice', // or 'FillInNumber' or custom
          prompt: 'Choose the word that rhymes with "light":',
          data: {
            options: ['night', 'coat', 'tree', 'jump']
          },
          correctAnswer: 'night',
          hint: 'Words that rhyme have the same ending sound!',
          explanation: '"light" and "night" both end with the "-ight" sound.'
        };
      }
    }
    */
  ]
};
