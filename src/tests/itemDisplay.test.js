import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

// Fresh English content
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

// Reading content
import characterTraitsData from '../subjects/reading/content/characterTraits.json';
import butterflyPassageData from '../subjects/reading/content/butterflyPassage.json';

// Components
import MultipleChoice from '../engine/MultipleChoice.jsx';
import WordBank from '../engine/WordBank.jsx';

// Speech helper logic (mirroring PracticeSession buildSpeechAudioText)
function buildSpeechAudioText(q) {
  if (!q) return '';
  const prompt = (q.prompt || '').trim();
  const data = q.data || {};

  let item = '';
  if (data.sentence) {
    item = data.sentence;
  } else if (data.paragraph) {
    item = data.paragraph;
  } else if (data.story) {
    item = data.story;
  } else if (data.clueSentence) {
    item = data.clueSentence;
  } else if (data.pictureLabel) {
    item = data.pictureLabel;
  }

  const cleanPrompt = prompt.replace(/_+/g, 'blank');
  const cleanItem = item.replace(/_+/g, 'blank').trim();

  if (cleanItem && !cleanPrompt.toLowerCase().includes(cleanItem.toLowerCase())) {
    const basePrompt = cleanPrompt.replace(/[:]+$/, '');
    return `${basePrompt}. ${cleanItem}`;
  }

  if (q.type === 'TapToSelect' && Array.isArray(data.options)) {
    const basePrompt = cleanPrompt.replace(/[:]+$/, '');
    return `${basePrompt}. Choices: ${data.options.join('. ')}`;
  }

  if (q.promptSpeech) {
    return q.promptSpeech.replace(/_+/g, 'blank');
  }

  return cleanPrompt;
}

describe('Item Display Requirements across English & Reading Content', () => {
  it('every question in sentence-based MultipleChoice topics defines a non-empty data.sentence', () => {
    const sentenceDatasets = [
      { name: 'csOrCp', data: csOrCpData },
      { name: 'subjectOrPredicate', data: subjectOrPredicateData },
      { name: 'compoundOrSimple', data: compoundOrSimpleData },
      { name: 'formingCompoundSentences', data: formingCompoundSentencesData },
      { name: 'changeSentenceTypes', data: changeSentenceTypesData },
      { name: 'sentenceTypes', data: sentenceTypesData },
      { name: 'endMarks', data: endMarksData },
      { name: 'powerWordsTrueFalse', data: powerWordsTrueFalseData },
      { name: 'powerWordsQuestions', data: powerWordsQuestionsData },
      { name: 'synonymsMultipleChoice', data: synonymsMultipleChoiceData }
    ];

    sentenceDatasets.forEach(({ name, data }) => {
      data.forEach((q) => {
        expect(q.data, `${name} question ${q.id} must have a data object`).toBeDefined();
        expect(
          typeof q.data.sentence === 'string' && q.data.sentence.trim().length > 0,
          `${name} question ${q.id} must define a non-empty data.sentence`
        ).toBe(true);
      });
    });
  });

  it('every question in characterTraits defines a non-empty data.paragraph', () => {
    characterTraitsData.forEach((q) => {
      expect(
        typeof q.data.paragraph === 'string' && q.data.paragraph.trim().length > 0,
        `characterTraits question ${q.id} must define a non-empty data.paragraph`
      ).toBe(true);
    });
  });

  it('every question in butterflyPassage defines a non-empty data.passage and passageTitle', () => {
    butterflyPassageData.forEach((q) => {
      expect(typeof q.data.passageTitle === 'string' && q.data.passageTitle.length > 0).toBe(true);
      expect(typeof q.data.passage === 'string' && q.data.passage.length > 50).toBe(true);
    });
  });

  it('every question in powerWordsSentences and powerWordsDefinitions defines sentence with ___ and wordBank', () => {
    [...powerWordsSentencesData, ...powerWordsDefinitionsData].forEach((q) => {
      expect(q.data.sentence).toContain('___');
      expect(Array.isArray(q.data.wordBank) && q.data.wordBank.length > 0).toBe(true);
    });
  });

  it('every question in synonymsUnderlined defines sentence and underlinedWord', () => {
    synonymsUnderlinedData.forEach((q) => {
      expect(typeof q.data.sentence === 'string' && q.data.sentence.length > 0).toBe(true);
      expect(typeof q.data.underlinedWord === 'string' && q.data.underlinedWord.length > 0).toBe(true);
      expect(q.data.sentence.toLowerCase()).toContain(q.data.underlinedWord.toLowerCase());
    });
  });
});

describe('Engine Component Item Rendering', () => {
  it('MultipleChoice renders the sentence in an mc-sentence-card for C.S or C.P questions', () => {
    const q = csOrCpData[0]; // "Jake and Ella built a sandcastle."
    const html = renderToString(React.createElement(MultipleChoice, { question: q, onSubmit: () => {} }));
    expect(html).toContain('mc-sentence-card');
    expect(html).toContain('Jake and Ella built a sandcastle.');
    expect(html).toContain('C.S');
    expect(html).toContain('C.P');
  });

  it('MultipleChoice renders blank pills for sentences with ___ (end marks)', () => {
    const q = endMarksData[0]; // "Please wash your hands before dinner ___"
    const html = renderToString(React.createElement(MultipleChoice, { question: q, onSubmit: () => {} }));
    expect(html).toContain('mc-sentence-card');
    expect(html).toContain('mc-sentence-blank-pill');
    expect(html).toContain('Please wash your hands before dinner');
  });

  it('MultipleChoice renders characterTraits stories in an mc-paragraph-card', () => {
    const q = characterTraitsData[0]; // Mariam puppy story
    const html = renderToString(React.createElement(MultipleChoice, { question: q, onSubmit: () => {} }));
    expect(html).toContain('mc-paragraph-card');
    expect(html).toContain('Mariam saw a lost puppy on the street.');
  });

  it('WordBank renders the target word with synonym-target-underlined in synonym questions', () => {
    const q = synonymsUnderlinedData[0]; // "The baby is happy." with "happy" underlined
    const html = renderToString(React.createElement(WordBank, { question: q, onSubmit: () => {} }));
    expect(html).toContain('synonym-target-underlined');
    expect(html).toContain('happy');
    expect(html).toContain('The baby is');
  });

  it('WordBank renders sentence with blank replacement box in powerWordsSentences topic', () => {
    const q = powerWordsSentencesData[0]; // Tom fiddled with pencil
    const html = renderToString(React.createElement(WordBank, { question: q, onSubmit: () => {} }));
    expect(html).toContain('sentence-blank-box');
    expect(html).toContain('When the teacher asked a question');
  });
});

describe('Read-Aloud Speech Audio Order Validation', () => {
  it('reads the instruction AND the sentence in that order for C.S vs C.P questions', () => {
    csOrCpData.forEach((q) => {
      const speech = buildSpeechAudioText(q);
      const promptClean = q.prompt.replace(/[:]+$/, '');
      expect(speech.startsWith(promptClean)).toBe(true);
      expect(speech).toContain(q.data.sentence);
    });
  });

  it('reads the instruction AND the sentence for subject/predicate, compound/simple, sentenceTypes', () => {
    const datasets = [
      ...subjectOrPredicateData,
      ...compoundOrSimpleData,
      ...sentenceTypesData,
      ...powerWordsQuestionsData
    ];

    datasets.forEach((q) => {
      const speech = buildSpeechAudioText(q);
      const promptClean = q.prompt.replace(/[:]+$/, '');
      const sentenceClean = q.data.sentence.replace(/_+/g, 'blank');
      expect(speech.startsWith(promptClean)).toBe(true);
      expect(speech).toContain(sentenceClean);
    });
  });

  it('reads the instruction AND the paragraph for character traits questions', () => {
    characterTraitsData.forEach((q) => {
      const speech = buildSpeechAudioText(q);
      const promptClean = q.prompt.replace(/[:]+$/, '');
      expect(speech.startsWith(promptClean)).toBe(true);
      expect(speech).toContain(q.data.paragraph);
    });
  });
});
