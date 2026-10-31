import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import rawEnglishContent from '../../content-source/english_content.json';
import QuestionDispatcher from '../engine/QuestionDispatcher.jsx';

describe('Item Display & Rendering Validation across All English Items', () => {
  it('every single item in english_content.json renders cleanly through QuestionDispatcher', () => {
    rawEnglishContent.topics.forEach((topic) => {
      topic.items.forEach((item) => {
        const question = {
          ...item,
          type: topic.type,
          instruction: topic.instruction,
          topicHint: topic.hint
        };

        let html = '';
        expect(() => {
          html = renderToString(
            React.createElement(QuestionDispatcher, {
              question,
              onSubmit: () => {},
              disabled: false,
              soundEnabled: false
            })
          );
        }, `Item ${item.id} failed to render`).not.toThrow();

        // Strict verification: rendered output must contain the item text (or word for match)
        expect(html.length, `Rendered output for ${item.id} must not be empty`).toBeGreaterThan(50);

        // Strip HTML tags, comments, and entities to verify the pure text is presented to the child
        const textContent = html
          .replace(/<[^>]+>/g, '')
          .replace(/<!--.*?-->/g, '')
          .replace(/&#x27;/g, "'")
          .replace(/&quot;/g, '"');

        if (topic.type === 'choice' || topic.type === 'two_step') {
          // If text has blank, check that the non-blank parts appear
          if (item.text.includes('___')) {
            const firstPart = item.text.split('___')[0].trim();
            if (firstPart.length > 5) {
              expect(textContent).toContain(firstPart.slice(0, 15));
            }
          } else {
            // General text snippet appears (normalize whitespace and quotes)
            const norm = (s) => s.replace(/['"’“”]/g, '').trim();
            const snippet = norm(item.text).slice(0, 20);
            expect(norm(textContent)).toContain(snippet);
          }
        } else if (topic.type === 'match') {
          item.pairs.forEach(([w]) => {
            expect(textContent).toContain(w);
          });
        }
      });
    });
  });
});
