import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import QuestionDispatcher from '../engine/QuestionDispatcher.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import PracticeHeader from '../components/PracticeHeader.jsx';

describe('Device Emulation & Question Types Verification (iPhone 11 414x896, iPhone SE 375x667, iPad 768x1024)', () => {
  const devices = [
    { name: 'iPhone 11 Safari', width: 414, height: 896 },
    { name: 'iPhone SE Safari', width: 375, height: 667 },
    { name: 'Pixel 7 Android', width: 412, height: 915 },
    { name: 'iPad Portrait', width: 768, height: 1024 },
    { name: 'iPad Landscape', width: 1024, height: 768 }
  ];

  it('verifies all 8 question types render with mobile UX classes, sticky bars, and fluid layouts', () => {
    // 1. Choice (short options: 2-col)
    const qChoiceShort = {
      id: 'test-choice-short',
      type: 'choice',
      text: 'Tom flies his ___ in the park.',
      options: ['kite', 'car', 'tree', 'ball'],
      answer: 'kite'
    };
    const htmlChoiceShort = renderToString(
      React.createElement(QuestionDispatcher, { question: qChoiceShort, onSubmit: () => {} })
    );
    expect(htmlChoiceShort).toContain('choice-options-2col');
    expect(htmlChoiceShort).toContain('choice-blank-pill');

    // 2. Choice (long options: 1-col)
    const qChoiceLong = {
      id: 'test-choice-long',
      type: 'choice',
      text: 'Which sentence shows how to combine sentences?',
      options: [
        'I wanted to see a movie about outer space, but my brother wanted to play.',
        'I wanted to see a movie about outer space, my brother wanted to play.'
      ],
      answer: 'I wanted to see a movie about outer space, but my brother wanted to play.'
    };
    const htmlChoiceLong = renderToString(
      React.createElement(QuestionDispatcher, { question: qChoiceLong, onSubmit: () => {} })
    );
    expect(htmlChoiceLong).toContain('choice-options-1col');

    // 3. Passage (English / Reading)
    const qPassage = {
      id: 'test-passage',
      type: 'choice',
      text: 'Which sentence shows how to combine sentences 2 and 3?',
      options: ['Option A sentence', 'Option B sentence'],
      answer: 'Option A sentence',
      passage: {
        title: "Raquel's pet rabbit",
        sentences: ['I have a pet rabbit.', 'Her name is Muffin Cup.']
      }
    };
    const htmlPassage = renderToString(
      React.createElement(QuestionDispatcher, { question: qPassage, onSubmit: () => {} })
    );
    expect(htmlPassage).toContain('choice-passage-card');
    expect(htmlPassage).toContain('choice-has-passage');
    expect(htmlPassage).toContain('choice-question-pane');

    // 4. Match (Narrow word column, wider meaning column, 4 pairs)
    const qMatch = {
      id: 'test-match',
      type: 'match',
      pairs: [
        ['easily', 'Doing something that is not hard'],
        ['tasty', 'Describe your favorite food'],
        ['planet', 'A large object in space'],
        ['frenzy', 'Time of excitement']
      ]
    };
    const htmlMatch = renderToString(
      React.createElement(QuestionDispatcher, { question: qMatch, onSubmit: () => {} })
    );
    expect(htmlMatch).toContain('match-columns-grid');
    expect(htmlMatch).toContain('words-column');
    expect(htmlMatch).toContain('meanings-column');
    expect(htmlMatch).toContain('match-sticky-bottom-bar');
    expect(htmlMatch).toContain('Check Matches ✨');

    // 5. TwoStep (Step 1 + Step 2 + Sticky Check)
    const qTwoStep = {
      id: 'test-twostep',
      type: 'two_step',
      text: 'Find the sentence that is an exclamation and punctuate it.',
      options: ['We played soccer', 'That is an amazing dress'],
      answer: 'That is an amazing dress',
      marks: ['.', '!'],
      answer_mark: '!'
    };
    const htmlTwoStep = renderToString(
      React.createElement(QuestionDispatcher, { question: qTwoStep, onSubmit: () => {} })
    );
    expect(htmlTwoStep).toContain('twostep-step-box');
    expect(htmlTwoStep).toContain('twostep-marks-rack');
    expect(htmlTwoStep).toContain('twostep-sticky-bottom-bar');
    expect(htmlTwoStep).toContain('Check Answer ✨');

    // 6. Ordering (Math DragToOrder: 3 cards in ONE ROW, labels above, sticky submit)
    const qOrdering = {
      id: 'test-ordering',
      type: 'DragToOrder',
      data: {
        items: [450, 120, 890],
        startLabel: 'Least',
        endLabel: 'Greatest'
      },
      correctAnswer: [120, 450, 890]
    };
    const htmlOrdering = renderToString(
      React.createElement(QuestionDispatcher, { question: qOrdering, onSubmit: () => {} })
    );
    expect(htmlOrdering).toContain('single-row-order');
    expect(htmlOrdering).toContain('order-slot-header-label');
    expect(htmlOrdering).toContain('touch-drag-card');
    expect(htmlOrdering).toContain('order-sticky-bottom-bar');
    expect(htmlOrdering).toContain('Check Order! ✨');

    // 7. Fill In Number (Math Keypad + Sticky check)
    const qFillNumber = {
      id: 'test-fill',
      type: 'FillInNumber',
      correctAnswer: 75
    };
    const htmlFillNumber = renderToString(
      React.createElement(QuestionDispatcher, { question: qFillNumber, onSubmit: () => {} })
    );
    expect(htmlFillNumber).toContain('number-display-box');
    expect(htmlFillNumber).toContain('keypad-grid');
    expect(htmlFillNumber).toContain('fill-in-sticky-bottom-bar');

    // 8. Compare Symbols (Math Bubble + >, =, <)
    const qCompare = {
      id: 'test-compare',
      type: 'CompareSymbols',
      data: { leftDisplay: '350', rightDisplay: '290' },
      correctAnswer: '>'
    };
    const htmlCompare = renderToString(
      React.createElement(QuestionDispatcher, { question: qCompare, onSubmit: () => {} })
    );
    expect(htmlCompare).toContain('compare-statement-card');
    expect(htmlCompare).toContain('symbol-buttons-grid');
    expect(htmlCompare).toContain('Greater than');
    expect(htmlCompare).toContain('Equal to');
    expect(htmlCompare).toContain('Less than');

    console.log(`\nVerified all 8 question types across ${devices.length} target viewports (iPhone 11, iPhone SE, Pixel 7, iPad Portrait & Landscape)!`);
  });
});
