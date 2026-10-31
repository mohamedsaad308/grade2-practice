import spelling from './topics/spelling.js';
import unscramble from './topics/unscramble.js';
import completeSentence from './topics/completeSentence.js';
import synonyms from './topics/synonyms.js';
import vocabMatchPairs from './topics/vocabMatchPairs.js';
import vocabSentences from './topics/vocabSentences.js';
import punctuationExclamation from './topics/punctuationExclamation.js';
import punctuationStatement from './topics/punctuationStatement.js';
import sentenceTypes from './topics/sentenceTypes.js';
import compoundSentences from './topics/compoundSentences.js';
import simpleOrCompound from './topics/simpleOrCompound.js';
import subjectOrPredicate from './topics/subjectOrPredicate.js';
import csOrCp from './topics/csOrCp.js';

export default {
  id: 'english',
  title: 'English',
  icon: '📚',
  color: '#EC4899', // Playful Pink
  lightColor: '#FDF2F8',
  description: 'Spelling, vocabulary, sentence types, and grammar for Grade 2 superstars!',
  isAvailable: true,
  topics: [
    spelling,
    unscramble,
    completeSentence,
    synonyms,
    vocabMatchPairs,
    vocabSentences,
    punctuationExclamation,
    punctuationStatement,
    sentenceTypes,
    compoundSentences,
    simpleOrCompound,
    subjectOrPredicate,
    csOrCp
  ]
};
