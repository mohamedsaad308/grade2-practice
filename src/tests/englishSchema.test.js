import { describe, it, expect } from 'vitest';
import rawEnglishContent from '../../content-source/english_content.json';
import englishSubject from '../subjects/english/index.js';

describe('English Content JSON Schema & Integrity (content-source/english_content.json)', () => {
  it('meta section is valid and specifies subject and schema', () => {
    expect(rawEnglishContent.meta).toBeDefined();
    expect(rawEnglishContent.meta.subject).toBe('English');
    expect(rawEnglishContent.meta.grade).toBe(2);
    expect(rawEnglishContent.meta.schema).toBeDefined();
    expect(rawEnglishContent.meta.schema.choice).toBeDefined();
    expect(rawEnglishContent.meta.schema.two_step).toBeDefined();
    expect(rawEnglishContent.meta.schema.match).toBeDefined();
  });

  it('contains exactly 17 topics in the source file', () => {
    expect(Array.isArray(rawEnglishContent.topics)).toBe(true);
    expect(rawEnglishContent.topics.length).toBe(17);
  });

  it('each topic has id, title, icon, instruction, type, hint, and non-empty items', () => {
    rawEnglishContent.topics.forEach((topic) => {
      expect(topic.id, `topic id missing`).toBeTruthy();
      expect(topic.title, `topic title missing for ${topic.id}`).toBeTruthy();
      expect(topic.icon, `topic icon missing for ${topic.id}`).toBeTruthy();
      expect(topic.instruction, `topic instruction missing for ${topic.id}`).toBeTruthy();
      expect(['choice', 'two_step', 'match'], `invalid type ${topic.type} in ${topic.id}`).toContain(topic.type);
      expect(typeof topic.hint === 'string' && topic.hint.trim().length > 0, `topic hint missing for ${topic.id}`).toBe(true);
      expect(Array.isArray(topic.items) && topic.items.length > 0, `topic items empty for ${topic.id}`).toBe(true);
    });
  });

  it('every item satisfies its renderer schema requirements with zero missing text', () => {
    const allIds = new Set();

    rawEnglishContent.topics.forEach((topic) => {
      topic.items.forEach((item, idx) => {
        // Unique ID check
        expect(item.id, `Item at index ${idx} in topic "${topic.id}" must have an id`).toBeTruthy();
        expect(allIds.has(item.id), `Duplicate item id: ${item.id}`).toBe(false);
        allIds.add(item.id);

        if (topic.type === 'choice') {
          // Choice schema
          expect(typeof item.text === 'string' && item.text.trim().length > 0, `Item ${item.id} must have non-empty text`).toBe(true);
          expect(Array.isArray(item.options) && item.options.length > 0, `Item ${item.id} must have options array`).toBe(true);

          // No duplicate options
          const optionSet = new Set(item.options);
          expect(optionSet.size, `Item ${item.id} has duplicate options: ${JSON.stringify(item.options)}`).toBe(item.options.length);

          // answer is in options
          expect(item.options, `Item ${item.id} answer "${item.answer}" must be in options`).toContain(item.answer);

          // accepted values (if any) are in options
          if (item.accepted) {
            expect(Array.isArray(item.accepted)).toBe(true);
            item.accepted.forEach((acc) => {
              expect(item.options, `Item ${item.id} accepted answer "${acc}" must be in options`).toContain(acc);
            });
          }

          // underline (if set) exists in text
          if (item.underline) {
            expect(item.text.toLowerCase(), `Item ${item.id} text must contain underline word "${item.underline}"`).toContain(item.underline.toLowerCase());
          }

          // passage (if set) has title and sentences
          if (item.passage) {
            expect(item.passage.title).toBeTruthy();
            expect(Array.isArray(item.passage.sentences) && item.passage.sentences.length > 0).toBe(true);
          }
        } else if (topic.type === 'two_step') {
          // Two-step schema
          expect(typeof item.text === 'string' && item.text.trim().length > 0, `Item ${item.id} must have non-empty text`).toBe(true);
          expect(Array.isArray(item.options) && item.options.length > 0).toBe(true);
          expect(Array.isArray(item.marks) && item.marks.length > 0).toBe(true);

          // No duplicates
          expect(new Set(item.options).size).toBe(item.options.length);
          expect(new Set(item.marks).size).toBe(item.marks.length);

          // answer is in options, answer_mark is in marks
          expect(item.options, `Item ${item.id} answer must be in options`).toContain(item.answer);
          expect(item.marks, `Item ${item.id} answer_mark must be in marks`).toContain(item.answer_mark);
        } else if (topic.type === 'match') {
          // Match schema
          expect(Array.isArray(item.pairs) && item.pairs.length === 4, `Item ${item.id} must have 4 pairs`).toBe(true);

          const words = item.pairs.map(p => p[0]);
          const meanings = item.pairs.map(p => p[1]);

          expect(new Set(words).size, `Item ${item.id} has duplicate words`).toBe(4);
          expect(new Set(meanings).size, `Item ${item.id} has duplicate meanings`).toBe(4);
        }
      });
    });
  });
});

describe('English Subject Module & Mixed Review', () => {
  it('exports English subject with 18 cards (17 topics + Mixed English Review)', () => {
    expect(englishSubject.id).toBe('english');
    expect(englishSubject.isAvailable).toBe(true);
    expect(englishSubject.topics.length).toBe(18);

    const mixedCard = englishSubject.topics.find(t => t.id === 'mixed-english-review');
    expect(mixedCard).toBeDefined();
    expect(mixedCard.title).toBe('Mixed English Review');
  });

  it('each topic getQuestions() returns up to 10 non-repeating items with shuffled options', () => {
    englishSubject.topics.forEach((topic) => {
      const questions = topic.getQuestions();
      expect(questions.length).toBeGreaterThan(0);
      expect(questions.length).toBeLessThanOrEqual(10);

      // Verify no duplicate questions in a session
      const idSet = new Set(questions.map(q => q.id));
      expect(idSet.size).toBe(questions.length);

      // Verify each question has its required fields
      questions.forEach((q) => {
        expect(['choice', 'two_step', 'match']).toContain(q.type);
        if (q.type === 'choice' || q.type === 'two_step') {
          expect(typeof q.text === 'string' && q.text.length > 0).toBe(true);
        }
        if (q.type === 'match') {
          expect(Array.isArray(q.pairs) && q.pairs.length === 4).toBe(true);
        }
        expect(q.hint).toBeTruthy();
        expect(q.explanation).toBeTruthy();
      });
    });
  });

  it('Mixed English Review draws 10 distinct questions across all topics', () => {
    const mixedTopic = englishSubject.topics.find(t => t.id === 'mixed-english-review');
    const questions = mixedTopic.getQuestions();
    expect(questions.length).toBe(10);
    const idSet = new Set(questions.map(q => q.id));
    expect(idSet.size).toBe(10);
  });
});
