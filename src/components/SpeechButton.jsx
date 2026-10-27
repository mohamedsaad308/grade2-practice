import React from 'react';
import { speakText } from '../utils/speech.js';

export default function SpeechButton({ textToRead, label = 'Read Aloud', className = '' }) {
  const handleClick = (e) => {
    e.preventDefault();
    if (!textToRead) return;
    speakText(textToRead);
  };

  return (
    <button
      type="button"
      className={`speech-read-btn ${className}`}
      onClick={handleClick}
      title="Listen to this question read aloud"
      aria-label="Read prompt aloud"
    >
      <span className="speech-icon">🔊</span>
      <span className="speech-label">{label}</span>
    </button>
  );
}
