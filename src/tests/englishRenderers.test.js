import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import ChoiceRenderer from '../engine/ChoiceRenderer.jsx';
import TwoStepRenderer from '../engine/TwoStepRenderer.jsx';
import MatchRenderer from '../engine/MatchRenderer.jsx';

describe('ChoiceRenderer Component Integrity', () => {
  it('renders prompt, large item text, and options', () => {
    const q = {
      id: 'c-1',
      type: 'choice',
      prompt: 'Which word is the conjunction?',
      text: 'Mom or Dad will take me to practice.',
      options: ['Mom', 'or', 'Dad', 'practice'],
      answer: 'or'
    };
    const html = renderToString(React.createElement(ChoiceRenderer, { question: q, onSubmit: () => {} }));
    expect(html).toContain('Which word is the conjunction?');
    expect(html).toContain('Mom or Dad will take me to practice.');
    expect(html).toContain('choice-item-card');
    expect(html).toContain('Mom');
    expect(html).toContain('or');
  });

  it('renders blank pill and fills the blank with selected option', () => {
    const q = {
      id: 'c-2',
      type: 'choice',
      text: 'Tom flies his ___ in the park.',
      options: ['kite', 'car', 'tree'],
      answer: 'kite'
    };

    // Unfilled blank
    const htmlEmpty = renderToString(React.createElement(ChoiceRenderer, { question: q, onSubmit: () => {} }));
    expect(htmlEmpty).toContain('choice-blank-pill');
    expect(htmlEmpty).toContain('blank-empty');
    expect(htmlEmpty).toContain('______');

    // Filled blank with userAnswer = 'kite'
    const htmlFilled = renderToString(
      React.createElement(ChoiceRenderer, { question: q, userAnswer: 'kite', onSubmit: () => {} })
    );
    expect(htmlFilled).toContain('choice-blank-pill');
    expect(htmlFilled).toContain('blank-filled');
    expect(htmlFilled).toContain('kite');
  });

  it('underlines the specified target word when underline is set', () => {
    const q = {
      id: 'c-3',
      type: 'choice',
      text: 'The baby is happy.',
      underline: 'happy',
      options: ['glad', 'large', 'warm', 'clever'],
      answer: 'glad'
    };
    const html = renderToString(React.createElement(ChoiceRenderer, { question: q, onSubmit: () => {} }));
    expect(html).toContain('choice-target-underline');
    expect(html).toContain('happy');
  });

  it('renders passage card ABOVE question with numbered sentences and full height', () => {
    const q = {
      id: 'c-4',
      type: 'choice',
      text: 'Which sentence shows how to combine sentences 2 and 3?',
      options: ['Option A', 'Option B'],
      answer: 'Option A',
      passage: {
        title: "Raquel's pet rabbit",
        sentences: ['I have a pet rabbit.', 'Her name is Muffin Cup.']
      }
    };
    const html = renderToString(React.createElement(ChoiceRenderer, { question: q, onSubmit: () => {} }));
    const cleanHtml = html.replace(/<!--.*?-->/g, '');
    expect(cleanHtml).toContain('choice-passage-card');
    expect(cleanHtml).toContain("Raquel&#x27;s pet rabbit");
    expect(cleanHtml).toContain('(1)');
    expect(cleanHtml).toContain('(2)');
    expect(cleanHtml).toContain('I have a pet rabbit.');
    expect(cleanHtml).toContain('Which sentence shows how to combine');
  });

  it('throws a visible error if item text is missing', () => {
    const brokenQ = {
      id: 'c-broken',
      type: 'choice',
      options: ['A', 'B'],
      answer: 'A'
    };
    expect(() => {
      renderToString(React.createElement(ChoiceRenderer, { question: brokenQ, onSubmit: () => {} }));
    }).toThrow(/ChoiceRenderer: question "c-broken" is missing required non-empty "text" field/);
  });
});

describe('TwoStepRenderer Component Integrity', () => {
  it('renders instruction in large type, sentence options, and punctuation marks', () => {
    const q = {
      id: 'ts-1',
      type: 'two_step',
      text: 'Find the sentence that is an exclamation and punctuate it.',
      options: ['We played soccer last weekend', 'Bathe your dog', 'That is an amazing dress'],
      answer: 'That is an amazing dress',
      marks: ['.', '?', '!'],
      answer_mark: '!'
    };
    const html = renderToString(React.createElement(TwoStepRenderer, { question: q, onSubmit: () => {} }));
    expect(html).toContain('twostep-instruction-card');
    expect(html).toContain('Find the sentence that is an exclamation and punctuate it.');
    expect(html).toContain('Step 1: Pick the sentence:');
    expect(html).toContain('That is an amazing dress');
    expect(html).toContain('Step 2: Choose its end mark:');
    expect(html).toContain('!');
    expect(html).toContain('Check Answer ✨');
  });

  it('throws a visible error if text, options, or marks are missing', () => {
    const brokenQ = {
      id: 'ts-broken',
      type: 'two_step'
    };
    expect(() => {
      renderToString(React.createElement(TwoStepRenderer, { question: brokenQ, onSubmit: () => {} }));
    }).toThrow(/TwoStepRenderer/);
  });
});

describe('MatchRenderer Component Integrity', () => {
  it('renders word and meaning columns with pairs and submit bar', () => {
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
    const html = renderToString(React.createElement(MatchRenderer, { question: q, onSubmit: () => {} }));
    expect(html).toContain('match-renderer-container');
    expect(html).toContain('Vocabulary Word');
    expect(html).toContain('easily');
    expect(html).toContain('tasty');
    expect(html).toContain('planet');
    expect(html).toContain('frenzy');
    expect(html).toContain('Check Matches ✨');
  });

  it('throws a visible error if pairs are missing', () => {
    const brokenQ = {
      id: 'm-broken',
      type: 'match'
    };
    expect(() => {
      renderToString(React.createElement(MatchRenderer, { question: brokenQ, onSubmit: () => {} }));
    }).toThrow(/MatchRenderer/);
  });
});
