import React from 'react';
import FillInNumber from './FillInNumber.jsx';
import CompareSymbols from './CompareSymbols.jsx';
import DragToOrder from './DragToOrder.jsx';
import MultipleChoice from './MultipleChoice.jsx';
import LetterTiles from './LetterTiles.jsx';
import WordBank from './WordBank.jsx';
import MatchPairs from './MatchPairs.jsx';
import TapToSelect from './TapToSelect.jsx';
import TwoStep from './TwoStep.jsx';

/**
 * Question Dispatcher: maps question.type to its reusable UI engine component.
 * Allows subjects (Math, English, Reading, Science) to use any question type transparently.
 */
export default function QuestionDispatcher({
  question,
  onSubmit,
  disabled = false,
  soundEnabled = true
}) {
  if (!question) return null;

  switch (question.type) {
    case 'FillInNumber':
      return (
        <FillInNumber
          question={question}
          onSubmit={onSubmit}
          disabled={disabled}
          soundEnabled={soundEnabled}
        />
      );

    case 'CompareSymbols':
      return (
        <CompareSymbols
          question={question}
          onSubmit={onSubmit}
          disabled={disabled}
          soundEnabled={soundEnabled}
        />
      );

    case 'DragToOrder':
      return (
        <DragToOrder
          question={question}
          onSubmit={onSubmit}
          disabled={disabled}
          soundEnabled={soundEnabled}
        />
      );

    case 'MultipleChoice':
      return (
        <MultipleChoice
          question={question}
          onSubmit={onSubmit}
          disabled={disabled}
          soundEnabled={soundEnabled}
        />
      );

    case 'LetterTiles':
      return (
        <LetterTiles
          question={question}
          onSubmit={onSubmit}
          disabled={disabled}
          soundEnabled={soundEnabled}
        />
      );

    case 'WordBank':
      return (
        <WordBank
          question={question}
          onSubmit={onSubmit}
          disabled={disabled}
          soundEnabled={soundEnabled}
        />
      );

    case 'MatchPairs':
      return (
        <MatchPairs
          question={question}
          onSubmit={onSubmit}
          disabled={disabled}
          soundEnabled={soundEnabled}
        />
      );

    case 'TapToSelect':
      return (
        <TapToSelect
          question={question}
          onSubmit={onSubmit}
          disabled={disabled}
          soundEnabled={soundEnabled}
        />
      );

    case 'TwoStep':
      return (
        <TwoStep
          question={question}
          onSubmit={onSubmit}
          disabled={disabled}
          soundEnabled={soundEnabled}
        />
      );

    default:
      return (
        <div className="unsupported-question-type">
          <p>Unknown question type: {question.type}</p>
        </div>
      );
  }
}
