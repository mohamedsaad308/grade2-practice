import { describe, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import englishSubject from '../subjects/english/index.js';
import QuestionDispatcher from '../engine/QuestionDispatcher.jsx';

function stripHtml(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/<!--.*?-->/g, '')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

describe('Full Session Playback across all 18 English Cards', () => {
  it('plays each topic and inspects question displays', () => {
    console.log(`\n================================================================================`);
    console.log(`ENGLISH SUBJECT VERIFICATION: ${englishSubject.topics.length} TOPICS`);
    console.log(`================================================================================\n`);

    englishSubject.topics.forEach((topic) => {
      const sessionQuestions = topic.getQuestions();
      console.log(`\n--------------------------------------------------------------------------------`);
      console.log(`TOPIC CARD: [${topic.icon}] ${topic.title} (ID: ${topic.id})`);
      console.log(`Session count: ${sessionQuestions.length} questions | Hint: "${topic.hint}"`);
      console.log(`--------------------------------------------------------------------------------`);

      const sampleCount = Math.min(3, sessionQuestions.length);
      for (let i = 0; i < sampleCount; i++) {
        const q = sessionQuestions[i];
        const html = renderToString(
          React.createElement(QuestionDispatcher, {
            question: q,
            onSubmit: () => {},
            disabled: false,
            soundEnabled: false
          })
        );

        console.log(`  [Q${i + 1}/${sessionQuestions.length}] ID: ${q.id} | Type: ${q.type}`);
        if (q.prompt) console.log(`   * Instruction Prompt: "${q.prompt}"`);
        if (q.text) console.log(`   * Item Card Text: "${q.text}"`);
        if (q.underline) console.log(`   * Target Underline: "${q.underline}"`);
        if (q.passage) console.log(`   * Passage: "${q.passage.title}" (${q.passage.sentences.join(' ')})`);
        if (q.options) console.log(`   * Options: ${JSON.stringify(q.options)}`);
        if (q.marks) console.log(`   * Marks: ${JSON.stringify(q.marks)}`);
        if (q.pairs) console.log(`   * Pairs: ${JSON.stringify(q.pairs)}`);
        console.log(`   * Screen Output: "${stripHtml(html)}"`);
      }
    });
  });
});
