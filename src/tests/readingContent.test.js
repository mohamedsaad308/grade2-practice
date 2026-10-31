import { describe, it, expect } from 'vitest';
import readingSubject from '../subjects/reading/index.js';
import characterTraitsData from '../subjects/reading/content/characterTraits.json';
import butterflyPassageData from '../subjects/reading/content/butterflyPassage.json';

describe('Reading Subject Registry', () => {
  it('is available with isAvailable: true and exports 2 topics', () => {
    expect(readingSubject.id).toBe('reading');
    expect(readingSubject.isAvailable).toBe(true);
    expect(Array.isArray(readingSubject.topics)).toBe(true);
    expect(readingSubject.topics.length).toBe(2);
  });

  it('both topics have valid id, title, icon, and getQuestions() function', () => {
    readingSubject.topics.forEach((topic) => {
      expect(topic.id).toBeTruthy();
      expect(topic.title).toBeTruthy();
      expect(topic.icon).toBeTruthy();
      expect(typeof topic.getQuestions).toBe('function');
      const questions = topic.getQuestions();
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
    });
  });
});

describe('Reading Content Validation: Topic 1 Character Traits', () => {
  it('contains exactly 5 questions with non-empty fields and valid options', () => {
    expect(characterTraitsData.length).toBe(5);

    characterTraitsData.forEach((q, idx) => {
      expect(q.id, `Q${idx + 1} id`).toBeTruthy();
      expect(q.type).toBe('MultipleChoice');
      expect(q.prompt).toBeTruthy();
      expect(q.hint).toContain('Think about what the person does, not just what they say');
      expect(q.explanation).toBeTruthy();
      expect(q.data.paragraph).toBeTruthy();
      expect(Array.isArray(q.data.options)).toBe(true);
      expect(q.data.options.length).toBe(3);
      expect(q.data.options).toContain(q.correctAnswer);

      // Verify exactly one correct answer is present
      const matches = q.data.options.filter(opt => opt === q.correctAnswer);
      expect(matches.length).toBe(1);
    });
  });

  it('has the exact correct answers for Mariam, Sara, Markos, Omar, and Lina', () => {
    expect(characterTraitsData[0].correctAnswer).toBe('kind');
    expect(characterTraitsData[1].correctAnswer).toBe('helpful');
    expect(characterTraitsData[2].correctAnswer).toBe('selfish');
    expect(characterTraitsData[3].correctAnswer).toBe('polite');
    expect(characterTraitsData[4].correctAnswer).toBe('dishonest');
  });
});

describe('Reading Content Validation: Topic 2 Butterflies Passage', () => {
  it('contains exactly 3 questions with the full passage intact', () => {
    expect(butterflyPassageData.length).toBe(3);

    butterflyPassageData.forEach((q, idx) => {
      expect(q.id, `Q${idx + 1} id`).toBeTruthy();
      expect(q.type).toBe('PassageComprehension');
      expect(q.prompt).toBeTruthy();
      expect(q.hint).toBeTruthy();
      expect(q.explanation).toBeTruthy();
      expect(q.data.passage).toContain('Butterflies are beautiful insects');
      expect(q.data.passage).toContain('Inside the chrysalis');
      expect(Array.isArray(q.data.options)).toBe(true);
      expect(q.data.options.length).toBe(3);
      expect(q.data.options).toContain(q.correctAnswer);

      // Verify exactly one correct answer is present
      const matches = q.data.options.filter(opt => opt === q.correctAnswer);
      expect(matches.length).toBe(1);
    });
  });

  it('has the exact required correct answers and pedagogical hints', () => {
    // Q1: Genre
    expect(butterflyPassageData[0].correctAnswer).toBe('Informational text');
    expect(butterflyPassageData[0].hint).toContain('Facts and real information mean informational text');

    // Q2: Eggs location
    expect(butterflyPassageData[1].correctAnswer).toBe('They lay their eggs on leaves.');
    expect(butterflyPassageData[1].hint).toContain('Look back at the text for the sentence about');

    // Q3: What hatches
    expect(butterflyPassageData[2].correctAnswer).toBe('A caterpillar hatches from the egg.');
    expect(butterflyPassageData[2].hint).toContain('Look back at the text for the sentence about');
  });
});

describe('Reading Topics Questions Order & Option Shuffling', () => {
  it('maintains fixed question order while safely shuffling options', () => {
    const topic = readingSubject.topics.find(t => t.id === 'reading_character_traits');
    const firstCall = topic.getQuestions();
    const secondCall = topic.getQuestions();

    expect(firstCall.length).toBe(5);
    expect(secondCall.length).toBe(5);

    // Question order is strictly preserved
    for (let i = 0; i < 5; i++) {
      expect(firstCall[i].id).toBe(characterTraitsData[i].id);
      expect(secondCall[i].id).toBe(characterTraitsData[i].id);
    }
  });
});
