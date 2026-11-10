import React, { useState, useEffect, useRef } from 'react';
import {
  isSpeechSupported,
  playSpeech,
  playSpeechSequence
} from '../utils/speech.js';

export default function SpeechButton({
  textToRead,
  speechParts = null,
  label = 'Read Aloud',
  className = ''
}) {
  const [supported, setSupported] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setSupported(isSpeechSupported());
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setIsPlaying(false);
  }, [textToRead, speechParts]);

  if (!supported) return null;

  const handleClick = (e) => {
    e.preventDefault();
    const hasParts = Array.isArray(speechParts) && speechParts.length > 0;
    if (!hasParts && !textToRead) return;

    setIsPlaying(true);

    if (hasParts) {
      playSpeechSequence(speechParts, {
        lang: 'en-US',
        rate: 0.88,
        pauseMs: 180,
        onPartStart: () => {
          if (mountedRef.current) setIsPlaying(true);
        },
        onEnd: () => {
          if (mountedRef.current) setIsPlaying(false);
        }
      });
    } else {
      playSpeech(textToRead, {
        lang: 'en-US',
        rate: 0.88,
        onStart: () => {
          if (mountedRef.current) setIsPlaying(true);
        },
        onEnd: () => {
          if (mountedRef.current) setIsPlaying(false);
        }
      });
    }
  };

  return (
    <button
      type="button"
      className={`speech-read-btn ${isPlaying ? 'speech-playing' : ''} ${className}`.trim()}
      onClick={handleClick}
      title="Listen to this question read aloud"
      aria-label="Read prompt aloud"
      aria-pressed={isPlaying}
    >
      <span className="speech-icon">🔊</span>
      <span className="speech-label">{label}</span>
    </button>
  );
}
