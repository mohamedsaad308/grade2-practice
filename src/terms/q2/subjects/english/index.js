import week1Data from './content/week1.json';
import { shuffle } from '../../../../utils/mathHelpers.js';
import { getItemOutcomes, getCurrentPlayer } from '../../../../player/playerStorage.js';

const QUIZ_CATEGORIES = ['phonics', 'vocabulary', 'nouns', 'agreement'];

/**
 * Sample 10 random quiz questions with AT LEAST 2 from each of the 4 topics
 * (phonics, vocabulary, nouns, agreement), prioritizing missed/unseen items
 * inside ('q2', 'english') and shuffling both question order and option order.
 */
export function selectWeekQuizQuestions(quizConfig, explicitPlayerId = null, termId = 'q2') {
  const allQuestions = Array.isArray(quizConfig?.questions) ? quizConfig.questions : [];
  const playerId = explicitPlayerId || getCurrentPlayer()?.id;
  const outcomes = getItemOutcomes(playerId, termId, 'english');

  const sortByAdaptive = (items) => {
    const missed = [];
    const unseen = [];
    const mastered = [];
    for (const q of items) {
      const stat = outcomes[q.id];
      if (!stat) {
        unseen.push(q);
      } else if (stat.lastOutcome === 'missed' || (stat.missed > 0 && !stat.firstTry)) {
        missed.push(q);
      } else {
        mastered.push(q);
      }
    }
    return [...shuffle(missed), ...shuffle(unseen), ...shuffle(mastered)];
  };

  const chosen = [];
  const chosenIds = new Set();

  // Guarantee at least 2 questions from each of the 4 categories
  for (const cat of QUIZ_CATEGORIES) {
    const catPool = sortByAdaptive(allQuestions.filter((q) => q.category === cat));
    const picks = catPool.slice(0, 2);
    for (const q of picks) {
      chosen.push(q);
      chosenIds.add(q.id);
    }
  }

  // Fill remaining slots (up to 10 total) randomly from remaining questions
  const remainingPool = sortByAdaptive(allQuestions.filter((q) => !chosenIds.has(q.id)));
  const needed = Math.max(0, 10 - chosen.length);
  const extras = remainingPool.slice(0, needed);

  const finalTen = shuffle([...chosen, ...extras]);

  return finalTen.map((q) => ({
    ...q,
    type: 'choice',
    topicId: quizConfig.id,
    topicTitle: quizConfig.title,
    topicIcon: quizConfig.icon || '🏆',
    topicHint: q.hint || quizConfig.hint,
    hint: q.hint || quizConfig.hint,
    options: shuffle([...(q.options || [])]),
    showExplanationOnCorrect: true,
    explanation: q.explanation || `The correct answer is "${q.answer}".`
  }));
}

/**
 * Helper to turn any structured week JSON file (like week1.json or future week2.json)
 * into clickable Q2 English lesson & quiz topics.
 */
export function createWeekTopics(weekData) {
  const weekId = weekData.weekId || 'week1';
  const weekTitle = weekData.weekTitle || 'Week 1';
  const weekSubtitle = weekData.weekSubtitle || '';

  const lessonTopics = (weekData.lessons || []).map((lesson) => ({
    id: lesson.id,
    weekId,
    weekTitle,
    weekSubtitle,
    mode: 'lesson',
    title: lesson.title,
    icon: lesson.icon || '📖',
    description: lesson.description,
    hint: lesson.hint,
    cardCount: (lesson.cards || []).length,
    lessonData: lesson,
    levels: [1]
  }));

  const topics = [...lessonTopics];

  if (weekData.quiz) {
    const quiz = weekData.quiz;
    topics.push({
      id: quiz.id,
      weekId,
      weekTitle,
      weekSubtitle,
      mode: 'quiz',
      title: quiz.title,
      icon: quiz.icon || '🏆',
      description: quiz.description,
      hint: quiz.hint,
      questionCount: 10,
      quizData: quiz,
      levels: [1],
      getQuestions(level = 1, playerId = null, termId = 'q2') {
        return selectWeekQuizQuestions(quiz, playerId, termId);
      }
    });
  }

  return topics;
}

/**
 * Q2 English Subject
 * Adding Week 2 later: import week2Data from './content/week2.json'
 * and append ...createWeekTopics(week2Data) below.
 */
export default {
  id: 'english',
  title: 'English',
  icon: '📚',
  color: '#EC4899',
  lightColor: '#FDF2F8',
  description: 'Week 1 lessons, flashcards, mini-activities, and quiz for Grade 2 superstars!',
  topics: [
    ...createWeekTopics(week1Data)
  ]
};
