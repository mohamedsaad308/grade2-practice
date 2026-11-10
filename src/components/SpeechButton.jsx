import React, { useState, useEffect } from 'react';
import { isSpeechSupported, speakText } from '../utils/speech.js';

export default function SpeechButton({ textToRead, label = 'Read Aloud', className = '' }) {
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(isSpeechSupported());
  }, []);

  if (!supported) return null;

  const handleClick = (e) => {
    e.preventDefault();
    if (!textToRead) return;
    speakText(textToRead, { lang: 'en-US', rate: 0.88 });
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
