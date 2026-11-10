import math from './subjects/math/index.js';
import english from './subjects/english/index.js';
import reading from './subjects/reading/index.js';
import social_studies from './subjects/social_studies/index.js';
import { shuffle, pickRandom, getQuestionSignature } from '../../utils/mathHelpers.js';
import { getRecentQuestionSignatures } from '../../player/playerStorage.js';

const q1Subjects = [
  math,
  english,
  reading,
  social_studies
];

/**
 * Q1 Review: Mixed 10-question session drawing strictly across active Q1 subjects
 * (Math, English, Reading, Social Studies).
 */
const reviewTopic = {
  id: 'q1_review',
  title: 'Q1 Review',
  icon: '⭐',
  description: 'A mixed 10-question challenge across Math, English, Reading, and Social Studies!',
  hint: 'Take your time, read carefully, and show what you mastered in Q1!',
  levels: [1],
  getQuestions(level = 1, playerId = null) {
    const recentSet = new Set(getRecentQuestionSignatures(playerId, 'q1', 'review'));
    const chosenSignatures = new Set();

    // 1. Math (3 varied questions across Q1 Math topics)
    const mathQuestions = [];
    const mathTopicsShuffled = shuffle([...math.topics]);
    let safety = 0;
    while (mathQuestions.length < 3 && safety < 60) {
      safety++;
      const t = mathTopicsShuffled[safety % mathTopicsShuffled.length];
      const lvl = pickRandom(t.levels || [1]);
      const q = t.generateQuestion(lvl);
      const sig = q.signature || getQuestionSignature(q);
      if (!chosenSignatures.has(sig) && (!recentSet.has(sig) || safety > 35)) {
        chosenSignatures.add(sig);
        mathQuestions.push({
          ...q,
          topicTitle: `${t.title}`
        });
      }
    }

    // 2. English (3 adaptive questions across Q1 English, prioritizing missed/unseen)
    const engMixed = english.topics.find((t) => t.id === 'mixed-english-review');
    const englishQuestions = (engMixed ? engMixed.getQuestions(1, playerId) : []).slice(0, 3);

    // 3. Reading (2 questions sampled across Q1 Reading topics)
    const allReading = reading.topics.flatMap((t) =>
      (typeof t.getQuestions === 'function' ? t.getQuestions() : []).map((q) => ({
        ...q,
        topicTitle: t.title
      }))
    );
    const readingQuestions = shuffle(allReading).slice(0, 2);

    // 4. Social Studies (2 questions sampled across Q1 Social Studies)
    const socMixed = social_studies.topics.find((t) => t.id === 'soc_mixed_review');
    const socQuestions = (socMixed ? socMixed.getQuestions() : []).slice(0, 2);

    return shuffle([
      ...mathQuestions,
      ...englishQuestions,
      ...readingQuestions,
      ...socQuestions
    ]).slice(0, 10);
  }
};

export default {
  id: 'q1',
  shortName: 'Q1',
  title: 'First Quarter',
  description: 'Term 1 Math, English, Reading, and Social Studies curriculum.',
  subjects: q1Subjects,
  reviewTopic
};
