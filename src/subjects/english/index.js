import powerWordsSentences from './topics/powerWordsSentences.js';
import powerWordsDefinitions from './topics/powerWordsDefinitions.js';
import powerWordsTrueFalse from './topics/powerWordsTrueFalse.js';
import powerWordsQuestions from './topics/powerWordsQuestions.js';
import synonymsMultipleChoice from './topics/synonymsMultipleChoice.js';
import synonymsUnderlined from './topics/synonymsUnderlined.js';
import vocabRevision from './topics/vocabRevision.js';
import endMarks from './topics/endMarks.js';
import sentenceTypes from './topics/sentenceTypes.js';
import punctuationTwoStep from './topics/punctuationTwoStep.js';
import changeSentenceTypes from './topics/changeSentenceTypes.js';
import compoundOrSimple from './topics/compoundOrSimple.js';
import formingCompoundSentences from './topics/formingCompoundSentences.js';
import subjectOrPredicate from './topics/subjectOrPredicate.js';
import csOrCp from './topics/csOrCp.js';

export default {
  id: 'english',
  title: 'English',
  icon: '📚',
  color: '#EC4899', // Playful Pink
  lightColor: '#FDF2F8',
  description: 'Power words, vocabulary, synonyms, punctuation, and sentence grammar for Grade 2 superstars!',
  isAvailable: true,
  topics: [
    powerWordsSentences,
    powerWordsDefinitions,
    powerWordsTrueFalse,
    powerWordsQuestions,
    synonymsMultipleChoice,
    synonymsUnderlined,
    vocabRevision,
    endMarks,
    sentenceTypes,
    punctuationTwoStep,
    changeSentenceTypes,
    compoundOrSimple,
    formingCompoundSentences,
    subjectOrPredicate,
    csOrCp
  ]
};
