import { describe, it, expect } from 'vitest';
import englishSubject from '../subjects/english/index.js';
import powerWordsSentencesData from '../subjects/english/content/powerWordsSentences.json';
import powerWordsDefinitionsData from '../subjects/english/content/powerWordsDefinitions.json';
import powerWordsTrueFalseData from '../subjects/english/content/powerWordsTrueFalse.json';
import powerWordsQuestionsData from '../subjects/english/content/powerWordsQuestions.json';
import synonymsMultipleChoiceData from '../subjects/english/content/synonymsMultipleChoice.json';
import synonymsUnderlinedData from '../subjects/english/content/synonymsUnderlined.json';
import vocabRevisionData from '../subjects/english/content/vocabRevision.json';
import endMarksData from '../subjects/english/content/endMarks.json';
import sentenceTypesData from '../subjects/english/content/sentenceTypes.json';
import punctuationTwoStepData from '../subjects/english/content/punctuationTwoStep.json';
import changeSentenceTypesData from '../subjects/english/content/changeSentenceTypes.json';
import compoundOrSimpleData from '../subjects/english/content/compoundOrSimple.json';
import formingCompoundSentencesData from '../subjects/english/content/formingCompoundSentences.json';
import subjectOrPredicateData from '../subjects/english/content/subjectOrPredicate.json';
import csOrCpData from '../subjects/english/content/csOrCp.json';

describe('Fresh English Subject Registry', () => {
  it('is active with isAvailable: true and exports exactly 15 topics', () => {
    expect(englishSubject.id).toBe('english');
    expect(englishSubject.isAvailable).toBe(true);
    expect(Array.isArray(englishSubject.topics)).toBe(true);
    expect(englishSubject.topics.length).toBe(15);
  });

  it('all 15 topics have non-empty id, title, icon, and getQuestions() function', () => {
    englishSubject.topics.forEach((topic) => {
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

describe('Fresh English Content Files Validation', () => {
  const allDatasets = [
    { name: 'powerWordsSentences', data: powerWordsSentencesData },
    { name: 'powerWordsDefinitions', data: powerWordsDefinitionsData },
    { name: 'powerWordsTrueFalse', data: powerWordsTrueFalseData },
    { name: 'powerWordsQuestions', data: powerWordsQuestionsData },
    { name: 'synonymsMultipleChoice', data: synonymsMultipleChoiceData },
    { name: 'synonymsUnderlined', data: synonymsUnderlinedData },
    { name: 'vocabRevision', data: vocabRevisionData },
    { name: 'endMarks', data: endMarksData },
    { name: 'sentenceTypes', data: sentenceTypesData },
    { name: 'punctuationTwoStep', data: punctuationTwoStepData },
    { name: 'changeSentenceTypes', data: changeSentenceTypesData },
    { name: 'compoundOrSimple', data: compoundOrSimpleData },
    { name: 'formingCompoundSentences', data: formingCompoundSentencesData },
    { name: 'subjectOrPredicate', data: subjectOrPredicateData },
    { name: 'csOrCp', data: csOrCpData }
  ];

  it('every dataset contains valid questions with required fields', () => {
    allDatasets.forEach(({ name, data }) => {
      expect(Array.isArray(data), `${name} must be an array`).toBe(true);
      expect(data.length, `${name} must not be empty`).toBeGreaterThan(0);

      data.forEach((q, idx) => {
        expect(q.id, `${name}[${idx}] must have id`).toBeTruthy();
        expect(q.type, `${name}[${idx}] must have type`).toBeTruthy();
        expect(q.prompt, `${name}[${idx}] must have prompt`).toBeTruthy();
        expect(q.correctAnswer, `${name}[${idx}] must have correctAnswer`).toBeDefined();
        expect(q.hint, `${name}[${idx}] must have hint`).toBeTruthy();
        expect(q.explanation, `${name}[${idx}] must have explanation`).toBeTruthy();
      });
    });
  });

  it('powerWordsSentences has 8 questions with sentence blanks and word bank', () => {
    expect(powerWordsSentencesData.length).toBe(8);
    powerWordsSentencesData.forEach((q) => {
      expect(q.data.sentence).toContain('___');
      expect(q.data.wordBank.length).toBe(8);
      expect(q.data.wordBank).toContain(q.correctAnswer);
    });
  });

  it('powerWordsDefinitions has 8 questions with definitions', () => {
    expect(powerWordsDefinitionsData.length).toBe(8);
    powerWordsDefinitionsData.forEach((q) => {
      expect(q.data.sentence).toContain('___');
      expect(q.data.wordBank).toContain(q.correctAnswer);
    });
  });

  it('powerWordsTrueFalse has 7 questions with True/False answers', () => {
    expect(powerWordsTrueFalseData.length).toBe(7);
    powerWordsTrueFalseData.forEach((q) => {
      expect(['True', 'False']).toContain(q.correctAnswer);
    });
  });

  it('powerWordsQuestions has 6 Q&A multiple choice questions', () => {
    expect(powerWordsQuestionsData.length).toBe(6);
    powerWordsQuestionsData.forEach((q) => {
      expect(q.data.options).toContain(q.correctAnswer);
    });
  });

  it('synonymsMultipleChoice has 7 questions', () => {
    expect(synonymsMultipleChoiceData.length).toBe(7);
    synonymsMultipleChoiceData.forEach((q) => {
      expect(q.data.options).toContain(q.correctAnswer);
    });
  });

  it('synonymsUnderlined has 4 questions with underlined target words', () => {
    expect(synonymsUnderlinedData.length).toBe(4);
    synonymsUnderlinedData.forEach((q) => {
      expect(q.data.sentence).toBeTruthy();
      expect(q.data.underlinedWord).toBeTruthy();
      expect(q.data.wordBank).toContain(q.correctAnswer);
    });
  });

  it('endMarks has 18 punctuation questions', () => {
    expect(endMarksData.length).toBe(18);
    endMarksData.forEach((q) => {
      expect(['.', '?', '!']).toContain(q.correctAnswer);
    });
  });

  it('sentenceTypes has 14 questions', () => {
    expect(sentenceTypesData.length).toBe(14);
    sentenceTypesData.forEach((q) => {
      expect(q.data.options).toContain(q.correctAnswer);
    });
  });

  it('formingCompoundSentences has 10 questions with comma and conjunction', () => {
    expect(formingCompoundSentencesData.length).toBe(10);
    formingCompoundSentencesData.forEach((q) => {
      expect(q.data.options).toContain(q.correctAnswer);
      expect(q.correctAnswer).toMatch(/,\s*(and|but|or)\s+/);
    });
  });

  it('compoundOrSimple has 12 questions', () => {
    expect(compoundOrSimpleData.length).toBe(12);
    compoundOrSimpleData.forEach((q) => {
      expect(['Compound sentence', 'Simple sentence']).toContain(q.correctAnswer);
    });
  });

  it('subjectOrPredicate has 12 questions', () => {
    expect(subjectOrPredicateData.length).toBe(12);
    subjectOrPredicateData.forEach((q) => {
      expect(['Compound subject', 'Compound predicate']).toContain(q.correctAnswer);
    });
  });

  it('csOrCp has 14 questions with C.S and C.P', () => {
    expect(csOrCpData.length).toBe(14);
    csOrCpData.forEach((q) => {
      expect(['C.S', 'C.P']).toContain(q.correctAnswer);
    });
  });
});
