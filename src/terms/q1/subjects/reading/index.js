import characterTraits from './topics/characterTraits.js';
import butterfliesPassage from './topics/butterfliesPassage.js';

export default {
  id: 'reading',
  title: 'Reading',
  icon: '📖',
  color: '#8B5CF6', // Friendly Purple
  lightColor: '#F5F3FF',
  description: 'Character traits, story passages, and reading comprehension for Grade 2 superstars!',
  isAvailable: true,
  topics: [
    characterTraits,
    butterfliesPassage
  ]
};
