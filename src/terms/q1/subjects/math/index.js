import moreLessThan from './topics/moreLessThan.js';
import compareNumbers from './topics/compareNumbers.js';
import orderGreatestToLeast from './topics/orderGreatestToLeast.js';
import orderLeastToGreatest from './topics/orderLeastToGreatest.js';

export default {
  id: 'math',
  title: 'Math',
  icon: '🔢',
  color: '#4F46E5', // Playful Indigo
  lightColor: '#EEF2FF',
  description: 'Numbers, place values, comparing, and ordering for Grade 2 superstars!',
  topics: [
    moreLessThan,
    compareNumbers,
    orderGreatestToLeast,
    orderLeastToGreatest
  ]
};
