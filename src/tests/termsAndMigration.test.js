import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  DEFAULT_TERM_ID,
  terms,
  isSubjectActive,
  getTermById,
  getSubjectsForTerm,
  getSubjectByTermAndId,
  getTopicByTermSubjectAndId
} from '../terms/index.js';
import {
  STORAGE_VERSION,
  STORAGE_KEY,
  LEGACY_STORAGE_KEY_V1,
  clearAllStorage,
  getAppState,
  createPlayer,
  getCurrentPlayer,
  setPlayerLastTerm,
  recordSessionCompletion,
  getPlayerTermStars,
  getPlayerTotalStars,
  getPlayerTopicAccuracyRows,
  resetPlayerProgress,
  recordItemOutcome,
  getItemOutcomes,
  addRecentQuestionSignatures,
  getRecentQuestionSignatures
} from '../player/playerStorage.js';
import {
  resolveRoute,
  buildHomeRoute,
  buildSubjectRoute,
  buildTopicRoute,
  getExitRoute
} from '../utils/routes.js';
import QuestionDispatcher from '../engine/QuestionDispatcher.jsx';
import HomeView from '../views/HomeView.jsx';
import SubjectTopicsView from '../views/SubjectTopicsView.jsx';
import FlashcardLesson from '../views/FlashcardLesson.jsx';
import SessionSummary from '../views/SessionSummary.jsx';
import ParentDashboard from '../views/ParentDashboard.jsx';
import week1Data from '../terms/q2/subjects/english/content/week1.json';
import { selectWeekQuizQuestions } from '../terms/q2/subjects/english/index.js';

describe('School Term Registry, Routes, Migration & UI Isolation', () => {
  beforeEach(() => {
    clearAllStorage();
  });

  it('1. loads only Q1 and Q2 terms in the registry (no Q3/Q4)', () => {
    expect(terms.map((t) => t.id)).toEqual(['q1', 'q2']);
    expect(getTermById('q1').shortName).toBe('Q1');
    expect(getTermById('q1').title).toBe('First Quarter');
    expect(getTermById('q2').shortName).toBe('Q2');
    expect(getTermById('q2').title).toBe('Second Quarter');
    expect(getTermById('q3')).toBeNull();
    expect(getTermById('q4')).toBeNull();
    expect(DEFAULT_TERM_ID).toBe('q2');
  });

  it('2. Q2 has 5 subjects in exact order (English, Math, Science, Social, German): ONLY English is active with Week 1; Math, Science, Social, German stay Coming soon', () => {
    const q2Subjects = getSubjectsForTerm('q2');
    expect(q2Subjects.map((s) => s.title)).toEqual([
      'English',
      'Math',
      'Science',
      'Social',
      'German'
    ]);
    expect(q2Subjects.map((s) => s.icon)).toEqual(['📚', '🔢', '🔬', '🌍', '🇩🇪']);

    // Only English is unlocked with Week 1 topics
    expect(isSubjectActive(q2Subjects[0])).toBe(true);
    expect(q2Subjects[0].topics.length).toBe(5);

    // Math, Science, Social, German stay inactive Coming soon
    q2Subjects.slice(1).forEach((subj) => {
      expect(subj.topics).toEqual([]);
      expect(isSubjectActive(subj)).toBe(false);
    });
  });

  it('3. every Q1 topic (and Q1 Review) is reachable via its canonical /#/q1/<subject>/<topic> route', () => {
    const q1 = getTermById('q1');
    expect(q1.subjects.length).toBeGreaterThanOrEqual(3);

    q1.subjects.forEach((subj) => {
      expect(isSubjectActive(subj)).toBe(true);

      const subjRoute = buildSubjectRoute('q1', subj.id);
      const resolvedSubj = resolveRoute(subjRoute, 'q2');
      expect(resolvedSubj.view).toBe('subject');
      expect(resolvedSubj.termId).toBe('q1');
      expect(resolvedSubj.subjectId).toBe(subj.id);

      subj.topics.forEach((topic) => {
        const topicRoute = buildTopicRoute('q1', subj.id, topic.id, topic.levels?.[1] || 1);
        const resolved = resolveRoute(topicRoute, 'q2');
        expect(resolved.view).toBe('practice');
        expect(resolved.termId).toBe('q1');
        expect(resolved.subjectId).toBe(subj.id);
        expect(resolved.topicId).toBe(topic.id);

        const resolvedTopicObj = getTopicByTermSubjectAndId('q1', resolved.subjectId, resolved.topicId);
        expect(resolvedTopicObj).toBe(topic);
      });
    });

    // Q1 Review route
    const reviewResolved = resolveRoute('#/q1/review', 'q2');
    expect(reviewResolved.view).toBe('practice');
    expect(reviewResolved.termId).toBe('q1');
    expect(reviewResolved.subjectId).toBe('review');
    const reviewTopic = getTopicByTermSubjectAndId('q1', reviewResolved.subjectId, reviewResolved.topicId);
    expect(reviewTopic).toBe(q1.reviewTopic);

    // Exit returns to the same subject inside the same term (or term home for review)
    expect(getExitRoute('q1', 'english')).toBe('#/q1/english');
    expect(getExitRoute('q1', 'review')).toBe('#/q1');
  });

  it('4. redirects legacy bookmark routes cleanly to Q1 while keeping /#/parent intact', () => {
    expect(resolveRoute('#/subject/english')).toEqual({
      view: 'subject',
      termId: 'q1',
      subjectId: 'english',
      redirectTo: '#/q1/english'
    });

    expect(resolveRoute('#/subject/math')).toEqual({
      view: 'subject',
      termId: 'q1',
      subjectId: 'math',
      redirectTo: '#/q1/math'
    });

    expect(resolveRoute('#/subject/soc_stud')).toEqual({
      view: 'subject',
      termId: 'q1',
      subjectId: 'social_studies',
      redirectTo: '#/q1/social_studies'
    });

    expect(resolveRoute('#/practice/math/math_more_less?level=3')).toEqual({
      view: 'practice',
      termId: 'q1',
      subjectId: 'math',
      topicId: 'math_more_less',
      level: 3,
      redirectTo: '#/q1/math/math_more_less?level=3'
    });

    expect(resolveRoute('#/practice')).toEqual({
      view: 'home',
      termId: 'q1',
      redirectTo: '#/q1'
    });

    expect(resolveRoute('#/parent')).toEqual({
      view: 'parent',
      termId: 'q2',
      redirectTo: null
    });
  });

  it('5. migrates v1 storage one-time into v2 keeping stars, sessions, accuracy, and item history inside Q1 without deleting v1', () => {
    const sampleV1State = {
      currentPlayerId: 'player_maya_old',
      players: [
        {
          id: 'player_maya_old',
          name: 'Maya',
          avatar: 'fox',
          createdAt: 1700000000000,
          stars: 24,
          sessionsCompleted: 3,
          topicStats: {
            synonyms: { attempts: 10, firstTryWins: 8, secondTryWins: 2 },
            math_more_less: { attempts: 10, firstTryWins: 10, secondTryWins: 0 }
          },
          recentQuestions: ['math_more_less_10_more_482'],
          itemOutcomes: {
            'synonyms-01': { firstTry: 1, missed: 0, lastOutcome: 'first_try' },
            'synonyms-03': { firstTry: 0, missed: 2, lastOutcome: 'missed' }
          }
        }
      ],
      settings: { soundEnabled: false, spokenPraiseEnabled: true }
    };

    // Mock localStorage in Node env if needed via global/window
    const mockStore = {
      [LEGACY_STORAGE_KEY_V1]: JSON.stringify(sampleV1State)
    };
    const origWindow = global.window;
    global.window = {
      localStorage: {
        getItem: (k) => mockStore[k] ?? null,
        setItem: (k, v) => { mockStore[k] = String(v); },
        removeItem: (k) => { delete mockStore[k]; }
      }
    };

    try {
      const migrated = getAppState();
      expect(migrated.version).toBe(STORAGE_VERSION);
      expect(migrated.version).toBe(2);
      expect(migrated.settings.soundEnabled).toBe(false);

      // Legacy v1 key must NEVER be deleted during migration
      expect(mockStore[LEGACY_STORAGE_KEY_V1]).toBeTruthy();
      expect(mockStore[STORAGE_KEY]).toBeTruthy();

      const maya = migrated.players[0];
      expect(maya.name).toBe('Maya');
      expect(maya.lastTerm).toBe('q2'); // Opens Q2 by default
      expect(maya.stars).toBe(24);
      expect(maya.sessionsCompleted).toBe(3);

      // Old progress moved cleanly into Q1
      expect(getPlayerTermStars(maya, 'q1')).toBe(24);
      expect(getPlayerTermStars(maya, 'q2')).toBe(0);
      expect(maya.termProgress.q1.topicStats.synonyms.firstTryWins).toBe(8);
      expect(maya.termProgress.q1.topicStats.math_more_less.attempts).toBe(10);
      expect(maya.termProgress.q1.recentQuestionsBySubject.math).toContain('math_more_less_10_more_482');
      expect(maya.termProgress.q1.itemOutcomesBySubject.english['synonyms-03'].lastOutcome).toBe('missed');

      // Record new session in Q2 -> total stars in header = Q1 + Q2
      recordSessionCompletion(maya.id, 'q2_sample_topic', 9, [{ firstTry: true }], 'q2');
      const updatedMaya = getCurrentPlayer();
      expect(getPlayerTermStars(updatedMaya, 'q1')).toBe(24);
      expect(getPlayerTermStars(updatedMaya, 'q2')).toBe(9);
      expect(getPlayerTotalStars(updatedMaya)).toBe(33);
      expect(updatedMaya.stars).toBe(33);

      // Resetting Q1 must NOT erase Q2
      resetPlayerProgress(maya.id, 'q1');
      const afterQ1Reset = getCurrentPlayer();
      expect(getPlayerTermStars(afterQ1Reset, 'q1')).toBe(0);
      expect(getPlayerTermStars(afterQ1Reset, 'q2')).toBe(9);
      expect(getPlayerTotalStars(afterQ1Reset)).toBe(9);
    } finally {
      global.window = origWindow;
    }
  });

  it('6. remembers last chosen term per player (new player starts on Q2) and isolates missed-first & recent memory per term and subject', () => {
    const p = createPlayer('Leo', 'lion');
    expect(p.lastTerm).toBe('q2');

    setPlayerLastTerm(p.id, 'q1');
    expect(getCurrentPlayer().lastTerm).toBe('q1');

    // Isolate missed item memory per term + subject
    recordItemOutcome(p.id, 'shared-item-1', false, 'q1', 'english');
    expect(getItemOutcomes(p.id, 'q1', 'english')['shared-item-1'].lastOutcome).toBe('missed');
    expect(getItemOutcomes(p.id, 'q2', 'english')).toEqual({});

    // Isolate no-repeat memory per term + subject
    addRecentQuestionSignatures(p.id, ['sig_a'], 'q1', 'math');
    expect(getRecentQuestionSignatures(p.id, 'q1', 'math')).toEqual(['sig_a']);
    expect(getRecentQuestionSignatures(p.id, 'q2', 'math')).toEqual([]);
    expect(getRecentQuestionSignatures(p.id, 'q1', 'review')).toEqual([]);
  });

  it('7. Q1 Review generates a 10-question mixed session strictly across Q1 subjects that renders cleanly', () => {
    const q1 = getTermById('q1');
    const questions = q1.reviewTopic.getQuestions(1, null);
    expect(questions.length).toBe(10);

    questions.forEach((q) => {
      const html = renderToString(
        React.createElement(QuestionDispatcher, {
          question: q,
          onSubmit: () => {},
          disabled: false,
          soundEnabled: false
        })
      );
      expect(html.length).toBeGreaterThan(30);
    });
  });

  it('8. HomeView (Q2 & Q1), Coming Soon screen, Q1 English Topic List, and ParentDashboard render cleanly', () => {
    const player = createPlayer('Adam', 'panda');
    recordSessionCompletion(player.id, 'synonyms', 8, [{ firstTry: true }], 'q1');
    const refreshed = getCurrentPlayer();

    // Home Q2: shows Q2 | Q1 pills and 5 Coming soon subjects
    const clean = (html) => html.replace(/<!-- -->/g, '');

    const q2HomeHtml = clean(renderToString(
      React.createElement(HomeView, {
        player: refreshed,
        activeTermId: 'q2'
      })
    ));
    expect(q2HomeHtml).toContain('Q2');
    expect(q2HomeHtml).toContain('Q1');
    expect(q2HomeHtml).toContain('Coming soon');
    expect(q2HomeHtml).toContain('English');
    expect(q2HomeHtml).toContain('German');
    expect(q2HomeHtml).not.toContain('Q3');
    expect(q2HomeHtml).not.toContain('Q4');

    // Coming Soon screen when tapping an empty Q2 subject
    const q2Term = getTermById('q2');
    const q2Science = getSubjectByTermAndId('q2', 'science');
    const comingSoonHtml = clean(renderToString(
      React.createElement(SubjectTopicsView, {
        player: refreshed,
        term: q2Term,
        subject: q2Science
      })
    ));
    expect(comingSoonHtml).toContain('New topics are coming soon!');
    expect(comingSoonHtml).toContain('Back to Q2');

    // Home Q1: shows Q1 subjects and Q1 Review
    const q1HomeHtml = clean(renderToString(
      React.createElement(HomeView, {
        player: refreshed,
        activeTermId: 'q1'
      })
    ));
    expect(q1HomeHtml).toContain('Math');
    expect(q1HomeHtml).toContain('English');
    expect(q1HomeHtml).toContain('Reading');
    expect(q1HomeHtml).toContain('Q1 Review');

    // Q1 English topic list
    const q1Term = getTermById('q1');
    const q1English = getSubjectByTermAndId('q1', 'english');
    const engTopicListHtml = clean(renderToString(
      React.createElement(SubjectTopicsView, {
        player: refreshed,
        term: q1Term,
        subject: q1English
      })
    ));
    expect(engTopicListHtml).toContain('English Topics');
    expect(engTopicListHtml).toContain('Synonyms');
    expect(engTopicListHtml).toContain('Mixed English Review');

    // ParentDashboard shows term filters and Q1/Q2 star counts
    const parentHtml = clean(renderToString(
      React.createElement(ParentDashboard, {
        onBackToPractice: () => {},
        onPlayerStateChanged: () => {}
      })
    ));
    expect(parentHtml).toContain('All Terms');
    expect(parentHtml).toContain('Q1');
    expect(parentHtml).toContain('Q2');
    expect(parentHtml).toContain('Reset Q1');
    expect(parentHtml).toContain('Reset Q2');
    expect(parentHtml).toContain('Reset Everything');
    expect(parentHtml).toContain('8');
  });

  it('9. Q2 English Week 1 validates all 4 flashcard lessons, mini-activities, and 26 quiz questions (sampling 10 with >=2 per category)', () => {
    const q2English = getSubjectByTermAndId('q2', 'english');
    expect(isSubjectActive(q2English)).toBe(true);
    expect(week1Data.lessons.length).toBe(4);
    expect(week1Data.quiz.questions.length).toBe(26);

    // Validate all 26 quiz questions have 3 options and exact answer inside options
    week1Data.quiz.questions.forEach((q) => {
      expect(q.options.length).toBe(3);
      expect(q.options).toContain(q.answer);
    });

    // Validate stratified 10-question sampling guarantees >= 2 from each of 4 categories
    const sampled = selectWeekQuizQuestions(week1Data.quiz, null, 'q2');
    expect(sampled.length).toBe(10);
    ['phonics', 'vocabulary', 'nouns', 'agreement'].forEach((cat) => {
      expect(sampled.filter((q) => q.category === cat).length).toBeGreaterThanOrEqual(2);
    });
    sampled.forEach((q) => {
      const html = renderToString(
        React.createElement(QuestionDispatcher, {
          question: q,
          onSubmit: () => {},
          disabled: false,
          soundEnabled: false
        })
      );
      expect(html.length).toBeGreaterThan(40);
    });

    // Render Q2 English Topic list (Week 1) + FlashcardLesson + SessionSummary with "Practice the ones I missed"
    const clean = (html) => html.replace(/<!-- -->/g, '');
    const q2Term = getTermById('q2');
    const topicsHtml = clean(renderToString(
      React.createElement(SubjectTopicsView, {
        player: { name: 'Maya', avatar: 'fox', stars: 0 },
        term: q2Term,
        subject: q2English
      })
    ));
    expect(topicsHtml).toContain('Week 1');
    expect(topicsHtml).toContain('Lesson 1: Blends with L, R, S');
    expect(topicsHtml).toContain('Week 1 Final Quiz');

    const lessonTopic = getTopicByTermSubjectAndId('q2', 'english', 'w1_lesson1_blends');
    expect(lessonTopic).toBeTruthy();
    const flashcardHtml = clean(renderToString(
      React.createElement(FlashcardLesson, {
        player: { name: 'Maya', avatar: 'fox', stars: 0 },
        termId: 'q2',
        subject: q2English,
        topic: lessonTopic,
        settings: { soundEnabled: true, spokenPraiseEnabled: true }
      })
    ));
    expect(flashcardHtml).toContain('Card 1 of 22');
    expect(flashcardHtml).toContain('Sort it!');

    const summaryHtml = clean(renderToString(
      React.createElement(SessionSummary, {
        summaryData: {
          stars: 8,
          score: 8,
          total: 10,
          termId: 'q2',
          subject: q2English,
          topic: q2English.topics[4],
          missedQuestions: sampled.slice(0, 2)
        },
        player: { name: 'Maya', avatar: 'fox', stars: 8 },
        settings: { soundEnabled: false, spokenPraiseEnabled: false },
        onPlayAgain: () => {},
        onPracticeMissed: () => {},
        onBackToSubject: () => {},
        onBackToHome: () => {}
      })
    ));
    expect(summaryHtml).toContain('Play Again');
    expect(summaryHtml).toContain('Practice the ones I missed (2)');
  });
});
