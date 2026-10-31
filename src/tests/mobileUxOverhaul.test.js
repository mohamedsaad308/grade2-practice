import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import PracticeHeader from '../components/PracticeHeader.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import DragToOrder from '../engine/DragToOrder.jsx';
import ChoiceRenderer from '../engine/ChoiceRenderer.jsx';
import MatchRenderer from '../engine/MatchRenderer.jsx';
import TwoStepRenderer from '../engine/TwoStepRenderer.jsx';
import FillInNumber from '../engine/FillInNumber.jsx';
import CompareSymbols from '../engine/CompareSymbols.jsx';

describe('Mobile UX Overhaul Component Integrity', () => {
  it('PracticeHeader renders slim bar with avatar, name, stars, menu button and exit button', () => {
    const player = { name: 'Adam', avatar: 'fox', stars: 12 };
    const html = renderToString(
      React.createElement(PracticeHeader, {
        player,
        settings: { soundEnabled: true, spokenPraiseEnabled: true },
        onToggleSound: () => {},
        onToggleSpokenPraise: () => {},
        onChangePlayer: () => {},
        onNavigateParent: () => {},
        onExit: () => {},
        subjectTitle: 'English'
      })
    );

    expect(html).toContain('practice-slim-header');
    expect(html).toContain('Adam');
    expect(html).toContain('12');
    expect(html).toContain('practice-menu-btn');
    expect(html).toContain('practice-exit-btn');
    expect(html).toContain('Exit');
  });

  it('ProgressBar renders question counter and track in one unified single row', () => {
    const html = renderToString(React.createElement(ProgressBar, { current: 3, total: 10 }));
    expect(html).toContain('session-progress-row');
    expect(html).toContain('progress-question-badge');
    expect(html).toContain('3');
    expect(html).toContain('10');
    expect(html).toContain('30%');
    expect(html).toContain('progress-track');
  });

  it('DragToOrder renders 3 number cards in ONE ROW with labels above and sticky submit bar', () => {
    const q = {
      id: 'math-order-1',
      type: 'DragToOrder',
      data: {
        items: [142, 89, 210],
        startLabel: 'Least',
        endLabel: 'Greatest'
      }
    };
    const html = renderToString(
      React.createElement(DragToOrder, {
        question: q,
        onSubmit: () => {},
        disabled: false
      })
    );

    expect(html).toContain('single-row-order');
    expect(html).toContain('order-slot-header-label');
    expect(html).toContain('Least');
    expect(html).toContain('Middle');
    expect(html).toContain('Greatest');
    expect(html).toContain('142');
    expect(html).toContain('89');
    expect(html).toContain('210');
    expect(html).toContain('order-sticky-bottom-bar');
    expect(html).toContain('Check Order! ✨');
    // Ensure arrows are completely removed
    expect(html).not.toContain('arrow-shift-btn');
  });

  it('ChoiceRenderer applies 2-column layout for short options and 1-column for long options', () => {
    const shortQ = {
      id: 'c-short',
      type: 'choice',
      text: 'Tom flies his ___ in the park.',
      options: ['kite', 'car', 'ball'],
      answer: 'kite'
    };
    const htmlShort = renderToString(
      React.createElement(ChoiceRenderer, { question: shortQ, onSubmit: () => {} })
    );
    expect(htmlShort).toContain('choice-options-2col');

    const longQ = {
      id: 'c-long',
      type: 'choice',
      text: 'Which sentence shows how to combine sentences 2 and 3?',
      options: [
        'I wanted to see a movie about pirates, but my brother wanted to see a movie about outer space.',
        'I wanted to see a movie about pirates, my brother wanted to see a movie about outer space.'
      ],
      answer: 'I wanted to see a movie about pirates, but my brother wanted to see a movie about outer space.'
    };
    const htmlLong = renderToString(
      React.createElement(ChoiceRenderer, { question: longQ, onSubmit: () => {} })
    );
    expect(htmlLong).toContain('choice-options-1col');
  });

  it('MatchRenderer renders 2 columns with narrow words and wide meanings and sticky submit bar', () => {
    const q = {
      id: 'm-1',
      type: 'match',
      pairs: [
        ['easily', 'Doing something that is not hard'],
        ['tasty', 'Describe your favorite food'],
        ['planet', 'A large object in space'],
        ['frenzy', 'Time of excitement']
      ]
    };
    const html = renderToString(
      React.createElement(MatchRenderer, { question: q, onSubmit: () => {} })
    );

    expect(html).toContain('match-columns-grid');
    expect(html).toContain('words-column');
    expect(html).toContain('meanings-column');
    expect(html).toContain('match-sticky-bottom-bar');
    expect(html).toContain('Check Matches ✨');
  });

  it('TwoStepRenderer renders two step boxes and sticky submit bar', () => {
    const q = {
      id: 'ts-1',
      type: 'two_step',
      text: 'Find the sentence that is an exclamation and punctuate it.',
      options: ['We played soccer', 'That is an amazing dress'],
      answer: 'That is an amazing dress',
      marks: ['.', '!'],
      answer_mark: '!'
    };
    const html = renderToString(
      React.createElement(TwoStepRenderer, { question: q, onSubmit: () => {} })
    );

    expect(html).toContain('twostep-step-box');
    expect(html).toContain('twostep-sticky-bottom-bar');
    expect(html).toContain('Check Answer ✨');
  });

  it('FillInNumber and CompareSymbols render accessible touch targets and sticky check', () => {
    const qFill = {
      id: 'fill-1',
      type: 'FillInNumber',
      correctAnswer: 42
    };
    const htmlFill = renderToString(
      React.createElement(FillInNumber, { question: qFill, onSubmit: () => {} })
    );
    expect(htmlFill).toContain('keypad-grid');
    expect(htmlFill).toContain('fill-in-sticky-bottom-bar');

    const qComp = {
      id: 'comp-1',
      type: 'CompareSymbols',
      data: { leftDisplay: 15, rightDisplay: 20 },
      correctAnswer: '<'
    };
    const htmlComp = renderToString(
      React.createElement(CompareSymbols, { question: qComp, onSubmit: () => {} })
    );
    expect(htmlComp).toContain('symbol-buttons-grid');
    expect(htmlComp).toContain('>');
    expect(htmlComp).toContain('=');
    expect(htmlComp).toContain('<');
  });
});
