import week1Data from './content/week1.json';
import { shuffle } from '../../../../utils/mathHelpers.js';
import { getItemOutcomes, getCurrentPlayer } from '../../../../player/playerStorage.js';

const QUIZ_CATEGORIES = ['colors', 'sentences', 'song'];

function sortByAdaptive(items, explicitPlayerId = null, termId = 'q2') {
  const playerId = explicitPlayerId || getCurrentPlayer()?.id;
  const outcomes = getItemOutcomes(playerId, termId, 'german');

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
}

/**
 * Sample 10 adaptive practice questions from a single category inside quiz.questions,
 * prioritizing missed/unseen items and shuffling both question order and option order.
 */
export function selectPracticeCategoryQuestions(quizConfig, practiceConfig, explicitPlayerId = null, termId = 'q2') {
  const allQuestions = Array.isArray(quizConfig?.questions) ? quizConfig.questions : [];
  const categoryPool = practiceConfig?.category
    ? allQuestions.filter((q) => q.category === practiceConfig.category)
    : allQuestions;

  const ordered = sortByAdaptive(categoryPool, explicitPlayerId, termId);
  const count = Math.min(practiceConfig?.questionCount || 10, ordered.length);
  const picked = shuffle(ordered.slice(0, count));

  return picked.map((q) => ({
    ...q,
    type: 'choice',
    topicId: practiceConfig.id,
    topicTitle: practiceConfig.title,
    topicIcon: practiceConfig.icon || '🇩🇪',
    topicHint: q.hint || practiceConfig.hint,
    hint: q.hint || practiceConfig.hint,
    options: shuffle([...(q.options || [])]),
    showExplanationOnCorrect: true,
    explanation: q.explanation || `The correct answer is "${q.answer}".`
  }));
}

/**
 * Sample 10 random quiz questions with AT LEAST 3 from each of the 3 topics
 * (colors, sentences, song), prioritizing missed/unseen items inside ('q2', 'german')
 * and shuffling both question order and option order.
 */
export function selectWeekQuizQuestions(quizConfig, explicitPlayerId = null, termId = 'q2') {
  const allQuestions = Array.isArray(quizConfig?.questions) ? quizConfig.questions : [];

  const chosen = [];
  const chosenIds = new Set();

  // Guarantee at least 3 questions from each of the 3 categories (9 + 1 extra = 10)
  for (const cat of QUIZ_CATEGORIES) {
    const catPool = sortByAdaptive(
      allQuestions.filter((q) => q.category === cat),
      explicitPlayerId,
      termId
    );
    const picks = catPool.slice(0, 3);
    for (const q of picks) {
      chosen.push(q);
      chosenIds.add(q.id);
    }
  }

  const remainingPool = sortByAdaptive(
    allQuestions.filter((q) => !chosenIds.has(q.id)),
    explicitPlayerId,
    termId
  );
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
 * Helper to turn structured German week JSON files into clickable
 * flashcard lessons, topic practices, and the week final quiz.
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
    icon: lesson.icon || '🇩🇪',
    description: lesson.description,
    hint: lesson.hint,
    cardCount: (lesson.cards || []).length,
    lessonData: lesson,
    levels: [1]
  }));

  const topics = [...lessonTopics];

  if (weekData.quiz && Array.isArray(weekData.practices)) {
    weekData.practices.forEach((practice) => {
      const poolSize = (weekData.quiz.questions || []).filter(
        (q) => !practice.category || q.category === practice.category
      ).length;
      const sessionCount = Math.min(practice.questionCount || 10, poolSize || 10);
      topics.push({
        id: practice.id,
        weekId,
        weekTitle,
        weekSubtitle,
        mode: 'practice',
        practiceLabel: practice.practiceLabel || 'German Practice',
        title: practice.title,
        icon: practice.icon || '✏️',
        description: practice.description,
        hint: practice.hint,
        questionCount: sessionCount,
        totalPoolSize: poolSize,
        practiceData: practice,
        levels: [1],
        getQuestions(level = 1, playerId = null, termId = 'q2') {
          return selectPracticeCategoryQuestions(weekData.quiz, practice, playerId, termId);
        }
      });
    });
  }

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
 * Q2 German Subject
 * Week 1 ("Die Farben" & "Grün, grün, grün sind alle meine Kleider") is active.
 */
export default {
  id: 'german',
  title: 'German',
  icon: '🇩🇪',
  color: '#D97706',
  lightColor: '#FEF3C7',
  description: 'Week 1: Die Farben (12 Colors), Greetings, Likes & Song Story — with Say-It guides & German audio!',
  topics: [
    ...createWeekTopics(week1Data)
  ]
};
