import wordBankData from '../content/wordBank.json';

export default {
  id: 'english_word_bank',
  title: 'Complete the Sentence (Word Bank)',
  icon: '🪁',
  description: 'Tap a word card from the word bank to complete each sentence.',
  getQuestions() {
    // Word bank cards remain in their stated order (kit, kite, fin, fine)
    return wordBankData.map(q => ({
      ...q,
      data: {
        ...q.data,
        wordBank: [...q.data.wordBank]
      }
    }));
  }
};
