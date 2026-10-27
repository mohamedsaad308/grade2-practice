/**
 * Science Subject Plugin Template
 */

export default {
  id: 'science',
  title: 'Science',
  icon: '🔬',
  color: '#059669', // Emerald Green
  lightColor: '#ECFDF5',
  description: 'Animals, habitats, plants, and the solar system!',
  isAvailable: false,
  topics: [
    /*
    {
      id: 'science_animal_habitats',
      title: 'Animal Habitats',
      icon: '🌿',
      description: 'Match animals to where they live.',
      levels: [1, 2, 3],
      generateQuestion(level) {
        return {
          id: `sci_hab_${Date.now()}`,
          type: 'MultipleChoice',
          prompt: 'Where does an Emperor Penguin live?',
          data: {
            options: ['Antarctic Ice', 'Desert', 'Tropical Rainforest', 'Oak Forest']
          },
          correctAnswer: 'Antarctic Ice',
          hint: 'Penguins love cold icy oceans and snow!',
          explanation: 'Emperor penguins live on the ice of Antarctica.'
        };
      }
    }
    */
  ]
};
