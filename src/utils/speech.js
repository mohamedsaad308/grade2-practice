/**
 * Web Speech API wrapper for Grade 2 emergent readers.
 * Works 100% offline using the device's native voice synthesizer.
 */

export function isSpeechSupported() {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    Boolean(window.speechSynthesis) &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  );
}

export function speakText(text, options = {}) {
  if (!isSpeechSupported()) return;

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech

    const cleanText = String(text || '').replace(/_+/g, 'blank'); // e.g. "is _____" -> "is blank"
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.rate = options.rate || 0.88; // Slightly slower for Grade 2 comprehension
    utterance.pitch = options.pitch || 1.08; // Friendly and clear
    utterance.lang = options.lang || 'en-US';

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

export function stopSpeaking() {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch (e) {
    // ignore
  }
}
