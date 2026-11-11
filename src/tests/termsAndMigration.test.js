import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  cleanTextForSpeech,
  resolveAudioAssetUrl,
  setAudioManifestForTests,
  getManifestAudioPath,
  playSpeech,
  playSpeechSequence,
  stopSpeaking
} from '../utils/speech.js';
import { feedbackMessages } from '../feedback/messages.js';
import { getFeedbackAudioText } from '../feedback/feedbackManager.js';
import q1EnglishContent from '../../content-source/q1/english_content.json';
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
import FlashcardLesson, { tokenizeExampleSentence } from '../views/FlashcardLesson.jsx';
import SessionSummary from '../views/SessionSummary.jsx';
import ParentDashboard from '../views/ParentDashboard.jsx';
import week1Data from '../terms/q2/subjects/english/content/week1.json';
import { selectWeekQuizQuestions, selectPracticeCategoryQuestions } from '../terms/q2/subjects/english/index.js';
import germanWeek1Data from '../terms/q2/subjects/german/content/week1.json';
import {
  selectWeekQuizQuestions as selectGermanWeekQuizQuestions,
  selectPracticeCategoryQuestions as selectGermanPracticeCategoryQuestions
} from '../terms/q2/subjects/german/index.js';
import readingWeek1Data from '../terms/q2/subjects/reading/content/week1.json';
import {
  selectWeekQuizQuestions as selectReadingWeekQuizQuestions,
  selectPracticeCategoryQuestions as selectReadingPracticeCategoryQuestions
} from '../terms/q2/subjects/reading/index.js';

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

  it('2. Q2 has 6 subjects in exact order (English, Math, Science, Social, German, Reading): English, German, and Reading are active with Week 1; Math, Science, Social stay Coming soon', () => {
    const q2Subjects = getSubjectsForTerm('q2');
    expect(q2Subjects.map((s) => s.title)).toEqual([
      'English',
      'Math',
      'Science',
      'Social',
      'German',
      'Reading'
    ]);
    expect(q2Subjects.map((s) => s.icon)).toEqual(['📚', '🔢', '🔬', '🌍', '🇩🇪', '📖']);

    // English is active with Week 1 topics (4 lessons + 4 worksheet practices + 1 final quiz)
    expect(isSubjectActive(q2Subjects[0])).toBe(true);
    expect(q2Subjects[0].topics.length).toBe(9);

    // Math, Science, Social stay inactive Coming soon
    q2Subjects.slice(1, 4).forEach((subj) => {
      expect(subj.topics).toEqual([]);
      expect(isSubjectActive(subj)).toBe(false);
    });

    // German is unlocked with Week 1 topics (3 lessons + 3 practices + 1 final quiz)
    expect(isSubjectActive(q2Subjects[4])).toBe(true);
    expect(q2Subjects[4].topics.length).toBe(7);

    // Reading is unlocked with Week 1 Elements of Drama (3 lessons + 3 practices + 1 final quiz)
    expect(isSubjectActive(q2Subjects[5])).toBe(true);
    expect(q2Subjects[5].topics.length).toBe(7);
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

  it('9. Q2 English Week 1 validates all 4 flashcard lessons, mini-activities, 4 worksheet practices, and 142-question bank (sampling 10 with >=2 per category)', () => {
    const q2English = getSubjectByTermAndId('q2', 'english');
    expect(isSubjectActive(q2English)).toBe(true);
    expect(week1Data.lessons.length).toBe(4);
    expect(week1Data.practices.length).toBe(4);
    expect(week1Data.quiz.questions.length).toBe(142);

    // Validate all 142 questions have 3-4 unique options and exact answer inside options
    const seenIds = new Set();
    week1Data.quiz.questions.forEach((q) => {
      expect(seenIds.has(q.id)).toBe(false);
      seenIds.add(q.id);
      expect(q.options.length).toBeGreaterThanOrEqual(3);
      expect(q.options.length).toBeLessThanOrEqual(4);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options).toContain(q.answer);
    });

    // Validate Worksheet Practice sampling returns 10 questions strictly inside that category
    week1Data.practices.forEach((practice) => {
      const picked = selectPracticeCategoryQuestions(week1Data.quiz, practice, null, 'q2');
      expect(picked.length).toBe(10);
      picked.forEach((q) => expect(q.category).toBe(practice.category));
    });

    // Render Connect to Writing (Grammar 1.6.5) Zoo Passage question cleanly
    const connectWritingQ = week1Data.quiz.questions.find((q) => q.id === 'q2-w1-sv-p5_1');
    expect(connectWritingQ?.passage?.sentences?.length).toBe(6);
    const passageHtml = renderToString(
      React.createElement(QuestionDispatcher, {
        question: { ...connectWritingQ, type: 'choice' },
        onSubmit: () => {},
        disabled: false,
        soundEnabled: false
      })
    );
    expect(passageHtml).toContain("Zoey&#x27;s Zoo Visit");
    expect(passageHtml).toContain('Monkeys swing in the trees.');

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
    expect(topicsHtml).toContain('Worksheet 1: Blends &amp; Spelling');
    expect(topicsHtml).toContain('Worksheet 4: Subject-Verb &amp; Writing');
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
    expect(flashcardHtml).toContain(`Card 1 of ${week1Data.lessons[0].cards.length}`);
    expect(flashcardHtml).toContain('Sort it!');

    const quizTopic = getTopicByTermSubjectAndId('q2', 'english', 'w1_final_quiz');
    const summaryHtml = clean(renderToString(
      React.createElement(SessionSummary, {
        summaryData: {
          stars: 8,
          score: 8,
          total: 10,
          termId: 'q2',
          subject: q2English,
          topic: quizTopic,
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

  it('10. every card in all 4 Week 1 lessons has a visible example sentence with highlighted target word(s) on the front card', () => {
    const clean = (html) => html.replace(/<!-- -->/g, '');
    const q2English = getSubjectByTermAndId('q2', 'english');

    week1Data.lessons.forEach((lesson) => {
      expect(lesson.cards.length).toBeGreaterThan(0);

      lesson.cards.forEach((card) => {
        expect(typeof card.example).toBe('string');
        expect(card.example.trim().length).toBeGreaterThan(8);

        const targets = card.highlightWords?.length
          ? card.highlightWords
          : card.word
            ? [card.word]
            : [];

        if (targets.length > 0) {
          const { tokens } = tokenizeExampleSentence(card.example, targets);
          const highlighted = tokens.filter((t) => t.type === 'word' && t.isTarget);
          expect(highlighted.length).toBeGreaterThan(0);
        }

        // Render card as first card in FlashcardLesson to ensure front shows example text
        const html = clean(renderToString(
          React.createElement(FlashcardLesson, {
            player: { name: 'Maya', avatar: 'fox', stars: 0 },
            termId: 'q2',
            subject: q2English,
            topic: {
              id: `${lesson.id}_${card.id}`,
              title: lesson.title,
              icon: lesson.icon,
              lessonData: { ...lesson, cards: [card] }
            },
            settings: { soundEnabled: true, spokenPraiseEnabled: true }
          })
        ));
        expect(html).toContain('flashcard-front-example-text');
        if (targets.length > 0) {
          expect(html).toContain('sentence-target-word');
        }
      });
    });

    // Verify specific clip sentence updated per user prompt
    const clipCard = week1Data.lessons[0].cards.find((c) => c.id === 'blend-l-clip');
    expect(clipCard.example).toBe('I use a clip to hold my paper.');
  });

  it('11. speech audio helper resolves GitHub Pages subpaths cleanly, sequences clips on one Audio element, and falls back to Web Speech for dynamic texts', () => {
    const origWindow = global.window;
    const fakeOrigin = 'https://example.github.io';

    try {
      // Subpath resolution (/grade2-practice/, without trailing slash, index.html, and root)
      global.window = { location: { origin: fakeOrigin, pathname: '/grade2-practice/' } };
      expect(resolveAudioAssetUrl('audio/sample.mp3')).toBe('https://example.github.io/grade2-practice/audio/sample.mp3');

      global.window = { location: { origin: fakeOrigin, pathname: '/grade2-practice' } };
      expect(resolveAudioAssetUrl('audio/sample.mp3')).toBe('https://example.github.io/grade2-practice/audio/sample.mp3');

      global.window = { location: { origin: fakeOrigin, pathname: '/grade2-practice/index.html' } };
      expect(resolveAudioAssetUrl('audio/sample.mp3')).toBe('https://example.github.io/grade2-practice/audio/sample.mp3');

      global.window = { location: { origin: 'http://localhost:4173', pathname: '/' } };
      expect(resolveAudioAssetUrl('/audio-manifest.json')).toBe('http://localhost:4173/audio-manifest.json');

      // Sequential playback & fallback verification
      const playedSrcs = [];
      const spokenFallback = [];
      let audioInstanceCount = 0;

      class MockAudio {
        constructor() {
          audioInstanceCount += 1;
          this._src = '';
          this.duration = 1.2;
          this.currentTime = 0;
        }
        set src(val) {
          this._src = val;
        }
        get src() {
          return this._src;
        }
        pause() {}
        removeAttribute() {}
        play() {
          playedSrcs.push(this._src);
          this.onplaying?.();
          this.onended?.();
          return Promise.resolve();
        }
      }

      global.window = {
        location: { origin: fakeOrigin, pathname: '/grade2-practice/' },
        Audio: MockAudio,
        SpeechSynthesisUtterance: function MockUtterance(text) {
          this.text = text;
        },
        speechSynthesis: {
          cancel: () => {},
          speak: (u) => {
            spokenFallback.push(u.text);
            u.onstart?.();
            u.onend?.();
          }
        }
      };

      setAudioManifestForTests({
        clip: 'audio/word_clip.mp3',
        'I use a clip to hold my paper.': 'audio/sent_clip.mp3'
      });

      let ended = false;
      const startedParts = [];
      playSpeechSequence(
        [
          { id: 'word', text: 'clip' },
          { id: 'example', text: 'I use a clip to hold my paper.' }
        ],
        {
          pauseMs: 0,
          onPartStart: (partId) => startedParts.push(partId),
          onEnd: () => {
            ended = true;
          }
        }
      );

      expect(ended).toBe(true);
      expect(startedParts).toEqual(['word', 'example']);
      expect(audioInstanceCount).toBe(1);
      expect(playedSrcs).toEqual([
        'https://example.github.io/grade2-practice/audio/word_clip.mp3',
        'https://example.github.io/grade2-practice/audio/sent_clip.mp3'
      ]);

      // Dynamic math question (not in manifest) falls back cleanly to speechSynthesis
      playSpeech('What number is 10 more than 482?');
      expect(spokenFallback).toEqual(['What number is 10 more than 482?']);
      stopSpeaking();
    } finally {
      setAudioManifestForTests(null);
      global.window = origWindow;
    }
  });

  it('12. audio-manifest.json covers Week 1 lessons/quiz, Q1 English texts, and feedback templates with existing non-empty MP3 files', () => {
    const publicDir = path.resolve(process.cwd(), 'public');
    const manifestPath = path.join(publicDir, 'audio-manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(Object.keys(manifest).length).toBeGreaterThan(900);

    try {
      setAudioManifestForTests(manifest);

      const assertAudioClipExists = (rawText, lang = 'en-US') => {
        const cleaned = cleanTextForSpeech(rawText);
        if (!cleaned) return;
        const rel = getManifestAudioPath(cleaned, lang);
        expect(rel, `Missing audio-manifest entry for [${lang}]: ${cleaned}`).toBeTruthy();
        const mp3Path = path.join(publicDir, rel);
        expect(fs.existsSync(mp3Path), `Missing MP3 file on disk: ${rel}`).toBe(true);
        expect(fs.statSync(mp3Path).size).toBeGreaterThan(100);
      };

      // Every Q2 English Week 1 card, mini-activity & worksheet/quiz question/passage/options
      week1Data.lessons.forEach((lesson) => {
        lesson.cards.forEach((card) => {
          assertAudioClipExists(card.word || card.frontTitle);
          assertAudioClipExists(card.explanation);
          assertAudioClipExists(card.example);
          (card.examples || []).forEach((ex) => assertAudioClipExists(ex));
        });
        const act = lesson.activity;
        if (act?.type === 'sort_buckets') {
          act.items.forEach((it) => assertAudioClipExists(it.word));
        } else if (act?.type === 'tap_plural') {
          act.items.forEach((it) => {
            assertAudioClipExists(`What is the plural of ${it.singular}?`);
            it.options.forEach((opt) => assertAudioClipExists(opt));
          });
        } else if (act?.type === 'fix_sentence') {
          act.items.forEach((it) => {
            assertAudioClipExists(`Fix the sentence: ${it.wrongSentence}`);
            it.options.forEach((opt) => assertAudioClipExists(opt));
          });
        } else if (act?.type === 'match_pairs') {
          act.allPairs.forEach(([w, m]) => {
            assertAudioClipExists(w);
            assertAudioClipExists(m);
          });
        }
      });
      week1Data.quiz.questions.forEach((q) => {
        if (q.instruction) assertAudioClipExists(q.instruction.replace(/[:]+$/, ''));
        if (q.passage?.title) assertAudioClipExists(q.passage.title);
        (q.passage?.sentences || []).forEach((s) => assertAudioClipExists(s));
        assertAudioClipExists(q.text);
        q.options.forEach((opt) => assertAudioClipExists(opt));
        if (q.explanation) assertAudioClipExists(q.explanation);
      });

      // Every Q2 German Week 1 card, mini-activity, and quiz item (native de-DE + en-US clips)
      germanWeek1Data.lessons.forEach((lesson) => {
        const lessonLang = lesson.lang || 'de-DE';
        lesson.cards.forEach((card) => {
          const cardLang = card.lang || lessonLang;
          if (card.word) assertAudioClipExists(card.word, card.wordLang || cardLang);
          else if (card.frontTitle) assertAudioClipExists(card.frontTitle, card.frontTitleLang || cardLang);
          if (card.backTitle) assertAudioClipExists(card.backTitle, card.backTitleLang || cardLang);
          assertAudioClipExists(card.explanation, 'en-US');
          assertAudioClipExists(card.example, card.exampleLang || cardLang);
          if (card.exampleTranslation) assertAudioClipExists(card.exampleTranslation, 'en-US');
          if (Array.isArray(card.songLines) && card.songLines.length > 0) {
            const deVerse = card.songLines.map((l) => l.german).filter(Boolean).join(' ');
            const enVerse = card.songLines.map((l) => l.english).filter(Boolean).join(' ');
            if (deVerse) assertAudioClipExists(deVerse, 'de-DE');
            if (enVerse) assertAudioClipExists(enVerse, 'en-US');
          }
        });
        const act = lesson.activity;
        if (act?.type === 'tap_choice') {
          act.items.forEach((it) => {
            assertAudioClipExists(it.prompt, 'en-US');
            if (it.targetText) assertAudioClipExists(it.targetText, it.itemLang || act.itemLang || lessonLang);
            it.options.forEach((opt) => assertAudioClipExists(opt, it.optionsLang || act.optionsLang || 'en-US'));
            assertAudioClipExists(it.explanation, 'en-US');
          });
        } else if (act?.type === 'match_pairs') {
          act.allPairs.forEach(([left, right]) => {
            assertAudioClipExists(left, act.leftLang || lessonLang);
            assertAudioClipExists(right, act.rightLang || 'en-US');
          });
        }
      });
      germanWeek1Data.quiz.questions.forEach((q) => {
        if (Array.isArray(q.speechParts) && q.speechParts.length > 0) {
          q.speechParts.forEach((sp) => assertAudioClipExists(sp.text, sp.lang || 'en-US'));
        } else {
          if (q.instruction) assertAudioClipExists(q.instruction.replace(/[:]+$/, ''), q.instructionLang || 'en-US');
          assertAudioClipExists(q.speechText || q.text, q.textLang || 'en-US');
        }
        q.options.forEach((opt) => assertAudioClipExists(opt, q.optionsLang || 'en-US'));
        if (q.explanation) assertAudioClipExists(q.explanation, 'en-US');
      });

      // Every Q2 Reading Week 1 (Elements of Drama) card, mini-activity, passage, and quiz item
      readingWeek1Data.lessons.forEach((lesson) => {
        lesson.cards.forEach((card) => {
          assertAudioClipExists(card.word || card.frontTitle, 'en-US');
          assertAudioClipExists(card.explanation, 'en-US');
          assertAudioClipExists(card.example, 'en-US');
        });
        const act = lesson.activity;
        if (act?.type === 'match_pairs') {
          act.allPairs.forEach(([left, right]) => {
            assertAudioClipExists(left, 'en-US');
            assertAudioClipExists(right, 'en-US');
          });
        } else if (act?.type === 'tap_choice') {
          act.items.forEach((it) => {
            assertAudioClipExists(it.prompt, 'en-US');
            if (it.targetText) assertAudioClipExists(it.targetText, 'en-US');
            it.options.forEach((opt) => assertAudioClipExists(opt, 'en-US'));
            assertAudioClipExists(it.explanation, 'en-US');
          });
        }
      });
      readingWeek1Data.quiz.questions.forEach((q) => {
        if (q.instruction) assertAudioClipExists(q.instruction.replace(/[:]+$/, ''), 'en-US');
        if (q.passage?.title) assertAudioClipExists(q.passage.title, 'en-US');
        (q.passage?.sentences || []).forEach((s) => assertAudioClipExists(s, 'en-US'));
        assertAudioClipExists(q.text, 'en-US');
        q.options.forEach((opt) => assertAudioClipExists(opt, 'en-US'));
        if (q.explanation) assertAudioClipExists(q.explanation, 'en-US');
      });

      // Disambiguate shared words across English & German ('orange' -> separate MP3 clips!)
      const enOrange = getManifestAudioPath('orange', 'en-US');
      const deOrange = getManifestAudioPath('orange', 'de-DE');
      expect(enOrange).toBeTruthy();
      expect(deOrange).toBeTruthy();
      expect(deOrange).not.toBe(enOrange);

      // Every Q1 English topic instruction and item text
      q1EnglishContent.topics.forEach((topic) => {
        assertAudioClipExists(topic.instruction.replace(/[:]+$/, ''));
        topic.items.forEach((item) => {
          assertAudioClipExists(item.text);
        });
      });

      // Every praise/wrong/summary feedback template after stripping dynamic player name
      Object.values(feedbackMessages).forEach((templates) => {
        templates.forEach((tpl) => {
          const sampleRendered = tpl.replace(/{name}/g, 'Maya').replace(/{n}/g, '7');
          const audioKey = getFeedbackAudioText(sampleRendered, 'Maya');
          assertAudioClipExists(audioKey);
        });
      });
    } finally {
      setAudioManifestForTests(null);
    }
  });

  it('13. Q2 German Week 1 validates all 3 flashcard lessons (29 cards with English translations & transcriptions), 3 practices, and 60-question bank', () => {
    const q2German = getSubjectByTermAndId('q2', 'german');
    expect(isSubjectActive(q2German)).toBe(true);
    expect(q2German.topics.length).toBe(7);
    expect(germanWeek1Data.lessons.length).toBe(3);
    expect(germanWeek1Data.practices.length).toBe(3);
    expect(germanWeek1Data.quiz.questions.length).toBe(60);

    // Every card has transcription ("Say it"), translation, example + exampleTranslation, and umlauts highlight cleanly
    let totalCards = 0;
    germanWeek1Data.lessons.forEach((lesson) => {
      lesson.cards.forEach((card) => {
        totalCards += 1;
        expect(typeof card.transcription).toBe('string');
        expect(card.transcription.trim().length).toBeGreaterThan(1);
        expect(typeof card.translation).toBe('string');
        expect(card.translation.trim().length).toBeGreaterThan(1);
        expect(typeof card.example).toBe('string');
        expect(typeof card.exampleTranslation).toBe('string');
      });
    });
    expect(totalCards).toBe(29);

    // Unicode umlaut & ß highlighting check inside tokenizeExampleSentence
    const { tokens: gruenTokens } = tokenizeExampleSentence('Das ist grün. Ich mag grün.', ['grün']);
    expect(gruenTokens.filter((t) => t.type === 'word' && t.isTarget).length).toBe(2);
    const { tokens: jaegerTokens } = tokenizeExampleSentence('Weil mein Schatz ein Jäger ist.', ['Jäger']);
    expect(jaegerTokens.filter((t) => t.type === 'word' && t.isTarget).map((t) => t.text)).toEqual(['Jäger']);

    // Validate all 60 quiz questions (unique IDs, 3-4 unique options, exact answer in options)
    const seenIds = new Set();
    germanWeek1Data.quiz.questions.forEach((q) => {
      expect(seenIds.has(q.id)).toBe(false);
      seenIds.add(q.id);
      expect(q.options.length).toBeGreaterThanOrEqual(3);
      expect(q.options.length).toBeLessThanOrEqual(4);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options).toContain(q.answer);
    });

    // Validate Topic Practice sampling per category & adaptive isolation under ('q2', 'german')
    germanWeek1Data.practices.forEach((practice) => {
      const picked = selectGermanPracticeCategoryQuestions(germanWeek1Data.quiz, practice, null, 'q2');
      expect(picked.length).toBe(10);
      picked.forEach((q) => {
        expect(q.category).toBe(practice.category);
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
    });

    // Stratified 10-question final quiz guarantees >= 3 from each of 3 categories (colors, sentences, song)
    const sampledQuiz = selectGermanWeekQuizQuestions(germanWeek1Data.quiz, null, 'q2');
    expect(sampledQuiz.length).toBe(10);
    ['colors', 'sentences', 'song'].forEach((cat) => {
      expect(sampledQuiz.filter((q) => q.category === cat).length).toBeGreaterThanOrEqual(3);
    });

    // Render Q2 German Topics screen + Lesson 1 SVG paint splashes + Lesson 3 song card
    const clean = (html) => html.replace(/<!-- -->/g, '');
    const q2Term = getTermById('q2');
    const topicsHtml = clean(renderToString(
      React.createElement(SubjectTopicsView, {
        player: { name: 'Maya', avatar: 'fox', stars: 0 },
        term: q2Term,
        subject: q2German
      })
    ));
    expect(topicsHtml).toContain('Lesson 1: Die Farben (12 Colors)');
    expect(topicsHtml).toContain('Lesson 3: Song — Grün, grün, grün');
    expect(topicsHtml).toContain('Practice 1: Die Farben (Colors)');
    expect(topicsHtml).toContain('Week 1 Final Quiz: Die Farben');

    const colorLesson = getTopicByTermSubjectAndId('q2', 'german', 'w1_de_lesson1_colors');
    const colorLessonHtml = clean(renderToString(
      React.createElement(FlashcardLesson, {
        player: { name: 'Maya', avatar: 'fox', stars: 0 },
        termId: 'q2',
        subject: q2German,
        topic: colorLesson,
        settings: { soundEnabled: true, spokenPraiseEnabled: true }
      })
    ));
    expect(colorLessonHtml).toContain('Card 1 of 14');
    expect(colorLessonHtml).toContain('Die Farben!');
    expect(colorLessonHtml).toContain('color-palette-board');
    expect(colorLessonHtml).toContain('Say it:');
    expect(colorLessonHtml).toContain('Color Splash Pop!');
  });

  it('14. Q2 Reading Week 1 (Elements of Drama) validates all 3 flashcard lessons (20 cards with target highlights), 3 practices, 45-question bank, and mini script passages', () => {
    const q2Reading = getSubjectByTermAndId('q2', 'reading');
    expect(isSubjectActive(q2Reading)).toBe(true);
    expect(q2Reading.icon).toBe('📖');
    expect(q2Reading.topics.length).toBe(7);
    expect(readingWeek1Data.lessons.length).toBe(3);
    expect(readingWeek1Data.practices.length).toBe(3);
    expect(readingWeek1Data.quiz.questions.length).toBe(45);

    const clean = (html) => html.replace(/<!-- -->/g, '');
    let totalCards = 0;

    readingWeek1Data.lessons.forEach((lesson) => {
      lesson.cards.forEach((card) => {
        totalCards += 1;
        expect(typeof card.example).toBe('string');
        expect(card.example.trim().length).toBeGreaterThan(8);
        expect(typeof card.explanation).toBe('string');
        expect(card.explanation.trim().length).toBeGreaterThan(8);

        const targets = card.highlightWords?.length
          ? card.highlightWords
          : card.word
            ? [card.word]
            : [];
        expect(targets.length).toBeGreaterThan(0);

        const { tokens } = tokenizeExampleSentence(card.example, targets);
        const highlighted = tokens.filter((t) => t.type === 'word' && t.isTarget);
        expect(highlighted.length).toBeGreaterThan(0);

        const html = clean(renderToString(
          React.createElement(FlashcardLesson, {
            player: { name: 'Maya', avatar: 'fox', stars: 0 },
            termId: 'q2',
            subject: q2Reading,
            topic: {
              id: `${lesson.id}_${card.id}`,
              title: lesson.title,
              icon: lesson.icon,
              lessonData: { ...lesson, cards: [card] }
            },
            settings: { soundEnabled: true, spokenPraiseEnabled: true }
          })
        ));
        expect(html).toContain('flashcard-front-example-text');
        expect(html).toContain('sentence-target-word');
      });
    });
    expect(totalCards).toBe(20);

    // Validate all 45 quiz questions
    const seenIds = new Set();
    readingWeek1Data.quiz.questions.forEach((q) => {
      expect(seenIds.has(q.id)).toBe(false);
      seenIds.add(q.id);
      expect(q.options.length).toBeGreaterThanOrEqual(3);
      expect(q.options.length).toBeLessThanOrEqual(4);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options).toContain(q.answer);
    });

    // Validate Topic Practice sampling per category & adaptive isolation under ('q2', 'reading')
    readingWeek1Data.practices.forEach((practice) => {
      const picked = selectReadingPracticeCategoryQuestions(readingWeek1Data.quiz, practice, null, 'q2');
      expect(picked.length).toBe(10);
      picked.forEach((q) => {
        expect(q.category).toBe(practice.category);
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
    });

    // Stratified 10-question final quiz guarantees >= 3 from each of 3 categories (basics, elements, scenes)
    const sampledQuiz = selectReadingWeekQuizQuestions(readingWeek1Data.quiz, null, 'q2');
    expect(sampledQuiz.length).toBe(10);
    ['basics', 'elements', 'scenes'].forEach((cat) => {
      expect(sampledQuiz.filter((q) => q.category === cat).length).toBeGreaterThanOrEqual(3);
    });

    // Render Q2 Reading Topics screen, Home card, and Mini Script passage question
    const q2Term = getTermById('q2');
    const q2HomeHtml = clean(renderToString(
      React.createElement(HomeView, {
        player: { name: 'Maya', avatar: 'fox', stars: 0 },
        activeTermId: 'q2'
      })
    ));
    expect(q2HomeHtml).toContain('Reading');

    const topicsHtml = clean(renderToString(
      React.createElement(SubjectTopicsView, {
        player: { name: 'Maya', avatar: 'fox', stars: 0 },
        term: q2Term,
        subject: q2Reading
      })
    ));
    expect(topicsHtml).toContain('Lesson 1: What is Drama? (Story vs. Play)');
    expect(topicsHtml).toContain('Lesson 2: The 8 Elements of Drama');
    expect(topicsHtml).toContain('Lesson 3: Scenes &amp; Reading a Mini Script');
    expect(topicsHtml).toContain('Week 1 Final Quiz: Elements of Drama');

    const scriptQ = readingWeek1Data.quiz.questions.find((q) => q.id === 'q2-rd-w1-scn-05');
    expect(scriptQ?.passage?.sentences?.length).toBe(4);
    const scriptHtml = renderToString(
      React.createElement(QuestionDispatcher, {
        question: { ...scriptQ, type: 'choice' },
        onSubmit: () => {},
        disabled: false,
        soundEnabled: false
      })
    );
    expect(scriptHtml).toContain('The Lost Crown');
    expect(scriptHtml).toContain('Inside a sunny castle throne room');
  });
});
