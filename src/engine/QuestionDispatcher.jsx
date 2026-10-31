import React from 'react';
import FillInNumber from './FillInNumber.jsx';
import CompareSymbols from './CompareSymbols.jsx';
import DragToOrder from './DragToOrder.jsx';
import MultipleChoice from './MultipleChoice.jsx';
import PassageComprehension from './PassageComprehension.jsx';
import ChoiceRenderer from './ChoiceRenderer.jsx';
import TwoStepRenderer from './TwoStepRenderer.jsx';
import MatchRenderer from './MatchRenderer.jsx';

/**
 * Question Dispatcher: maps question.type to its engine renderer component.
 * Supports:
 * - English exact renderers: "choice", "two_step", "match"
 * - Math renderers: "FillInNumber", "CompareSymbols", "DragToOrder"
 * - Reading renderers: "MultipleChoice", "PassageComprehension"
 */
export default function QuestionDispatcher({
  question,
  onSubmit,
  disabled = false,
  soundEnabled = true,
  userAnswer = null
}) {
  if (!question) return null;

  switch (question.type) {
    // English renderers
    case 'choice':
      return (
        <ChoiceRenderer
          question={question}
          onSubmit={onSubmit}
          disabled={disabled}
          soundEnabled={soundEnabled}
          userAnswer={userAnswer}
        />
      );

    case 'two_step':
      return (
        <TwoStepRenderer
          question={question}
          onSubmit={onSubmit}
          disabled={disabled}
          soundEnabled={soundEnabled}
        />
      );

    case 'match':
      return (
        <MatchRenderer
          question={question}
          onSubmit={onSubmit}
          disabled={disabled}
          soundEnabled={soundEnabled}
        />
      );

    // Math renderers
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

    // Reading renderers
    case 'MultipleChoice':
      return (
        <MultipleChoice
          question={question}
          onSubmit={onSubmit}
          disabled={disabled}
          soundEnabled={soundEnabled}
        />
      );

    case 'PassageComprehension':
      return (
        <PassageComprehension
          question={question}
          onSubmit={onSubmit}
          disabled={disabled}
          soundEnabled={soundEnabled}
        />
      );

    default:
      throw new Error(`Unsupported question type: "${question.type}"`);
  }
}
