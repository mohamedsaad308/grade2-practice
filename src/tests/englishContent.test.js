import { describe, it, expect } from 'vitest';
import englishSubject from '../subjects/english/index.js';
import spellingData from '../subjects/english/content/spelling.json';
import unscrambleData from '../subjects/english/content/unscramble.json';
import wordBankData from '../subjects/english/content/wordBank.json';
import synonymsData from '../subjects/english/content/synonyms.json';
import matchPairsData from '../subjects/english/content/matchPairs.json';
import vocabSentencesData from '../subjects/english/content/vocabSentences.json';
import punctuationExclData from '../subjects/english/content/punctuationExclamation.json';
import punctuationStmtData from '../subjects/english/content/punctuationStatement.json';
import sentenceTypesData from '../subjects/english/content/sentenceTypes.json';
import compoundSentencesData from '../subjects/english/content/compoundSentences.json';
import simpleOrCompoundData from '../subjects/english/content/simpleOrCompound.json';
import subjectOrPredicateData from '../subjects/english/content/subjectOrPredicate.json';
import csOrCpData from '../subjects/english/content/csOrCp.json';

describe('English Subject Registry', () => {
  it('is active with isAvailable: true and exports exactly 13 topics', () => {
    expect(englishSubject.id).toBe('english');
    expect(englishSubject.isAvailable).toBe(true);
    expect(Array.isArray(englishSubject.topics)).toBe(true);
    expect(englishSubject.topics.length).toBe(13);
  });

  it('all 13 topics have non-empty id, title, icon, and getQuestions() function', () => {
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

describe('English Content Files Validation', () => {
  const allDatasets = [
    { name: 'spelling', data: spellingData },
    { name: 'unscramble', data: unscrambleData },
    { name: 'wordBank', data: wordBankData },
    { name: 'synonyms', data: synonymsData },
    { name: 'matchPairs', data: matchPairsData },
    { name: 'vocabSentences', data: vocabSentencesData },
    { name: 'punctuationExclamation', data: punctuationExclData },
    { name: 'punctuationStatement', data: punctuationStmtData },
    { name: 'sentenceTypes', data: sentenceTypesData },
    { name: 'compoundSentences', data: compoundSentencesData },
    { name: 'simpleOrCompound', data: simpleOrCompoundData },
    { name: 'subjectOrPredicate', data: subjectOrPredicateData },
    { name: 'csOrCp', data: csOrCpData }
  ];

  it('every question across all 13 content files has required non-empty fields', () => {
    allDatasets.forEach(({ name, data }) => {
      data.forEach((q, idx) => {
        expect(q.id, `${name}[${idx}] id`).toBeTruthy();
        expect(q.type, `${name}[${idx}] type`).toBeTruthy();
        expect(q.prompt, `${name}[${idx}] prompt`).toBeTruthy();
        expect(q.hint, `${name}[${idx}] hint`).toBeTruthy();
        expect(q.explanation, `${name}[${idx}] explanation`).toBeTruthy();
        expect(q.correctAnswer, `${name}[${idx}] correctAnswer`).toBeDefined();
      });
    });
  });

  it('Topic 1 (Spelling): scrambled tiles are exact anagrams of word', () => {
    spellingData.forEach((q) => {
      expect(q.type).toBe('LetterTiles');
      expect(q.data.word).toBe(q.correctAnswer);
      const sortedWord = q.data.word.split('').sort().join('');
      const sortedTiles = [...q.data.scrambled].sort().join('');
      expect(sortedTiles).toBe(sortedWord);
    });
  });

  it('Topic 2 (Unscramble): scrambled tiles are exact anagrams of word and match clue sentence', () => {
    unscrambleData.forEach((q) => {
      expect(q.type).toBe('LetterTiles');
      expect(q.data.word).toBe(q.correctAnswer);
      const sortedWord = q.data.word.split('').sort().join('');
      const sortedTiles = [...q.data.scrambled].sort().join('');
      expect(sortedTiles).toBe(sortedWord);
      expect(q.data.clueSentence).toContain(q.data.scrambledWord);
    });
  });

  it('Topic 3 (WordBank): answer is in wordBank and wordBank has kit, kite, fin, fine', () => {
    wordBankData.forEach((q) => {
      expect(q.type).toBe('WordBank');
      expect(q.data.wordBank).toEqual(['kit', 'kite', 'fin', 'fine']);
      expect(q.data.wordBank).toContain(q.correctAnswer);
    });
  });

  it('Topic 4 (Synonyms): answer is in wordBank and wordBank has glad, large, warm, clever', () => {
    synonymsData.forEach((q) => {
      expect(q.type).toBe('WordBank');
      expect(q.data.wordBank).toEqual(['glad', 'large', 'warm', 'clever']);
      expect(q.data.wordBank).toContain(q.correctAnswer);
      expect(q.data.underlinedWord).toBeTruthy();
    });
  });

  it('Topic 5 (MatchPairs): all 4 pairs are properly linked with non-empty words and meanings', () => {
    matchPairsData.forEach((q) => {
      expect(q.type).toBe('MatchPairs');
      expect(q.data.pairs.length).toBe(4);
      q.data.pairs.forEach((p) => {
        expect(p.word).toBeTruthy();
        expect(p.meaning).toBeTruthy();
        expect(q.correctAnswer[p.word]).toBe(p.meaning);
      });
    });
  });

  it('Topic 6 (Vocab sentences): exactly one correct answer present in options', () => {
    vocabSentencesData.forEach((q) => {
      expect(q.type).toBe('MultipleChoice');
      expect(q.data.options).toContain(q.correctAnswer);
      const matches = q.data.options.filter(opt => opt === q.correctAnswer);
      expect(matches.length).toBe(1);
    });
  });

  it('Topics 7 & 8 (Punctuation TwoStep): options contain sentence and valid punctuation mark', () => {
    [...punctuationExclData, ...punctuationStmtData].forEach((q) => {
      expect(q.type).toBe('TwoStep');
      const optIds = q.data.options.map(o => o.id);
      expect(optIds).toContain(q.correctAnswer.sentence);
      expect(['.', '?', '!']).toContain(q.correctAnswer.punctuation);
    });
  });

  it('Topic 9 (Sentence types): options contain exactly one correct answer', () => {
    sentenceTypesData.forEach((q) => {
      expect(q.type).toBe('MultipleChoice');
      expect(q.data.options).toContain(q.correctAnswer);
      const matches = q.data.options.filter(opt => opt === q.correctAnswer);
      expect(matches.length).toBe(1);
    });
  });

  it('Topic 10 (Compound sentences): exactly 2 correct answers present in options', () => {
    compoundSentencesData.forEach((q) => {
      expect(q.type).toBe('TapToSelect');
      expect(q.data.requiredCount).toBe(2);
      expect(q.correctAnswer.length).toBe(2);
      q.correctAnswer.forEach((ans) => {
        expect(q.data.options).toContain(ans);
      });
    });
  });

  it('Topics 11, 12, 13 (Sentence structure & C.S/C.P): options contain exactly one correct answer', () => {
    [...simpleOrCompoundData, ...subjectOrPredicateData, ...csOrCpData].forEach((q) => {
      expect(q.type).toBe('MultipleChoice');
      expect(q.data.options).toContain(q.correctAnswer);
      const matches = q.data.options.filter(opt => opt === q.correctAnswer);
      expect(matches.length).toBe(1);
    });
  });
});

describe('Question Order & Options Shuffle Integrity', () => {
  it('topics return questions in fixed order without altering original JSON array', () => {
    const topic = englishSubject.topics.find(t => t.id === 'english_vocab_sentences');
    const firstRun = topic.getQuestions();
    const secondRun = topic.getQuestions();

    expect(firstRun.length).toBe(vocabSentencesData.length);
    for (let i = 0; i < firstRun.length; i++) {
      expect(firstRun[i].id).toBe(vocabSentencesData[i].id);
      expect(secondRun[i].id).toBe(vocabSentencesData[i].id);
    }
  });

  it('WordBank cards are never shuffled', () => {
    const wbTopic = englishSubject.topics.find(t => t.id === 'english_word_bank');
    const questions = wbTopic.getQuestions();
    questions.forEach((q) => {
      expect(q.data.wordBank).toEqual(['kit', 'kite', 'fin', 'fine']);
    });
  });
});
