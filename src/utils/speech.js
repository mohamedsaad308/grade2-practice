/**
 * Web Speech API wrapper for Grade 2 emergent readers.
 * Works 100% offline using the device's native voice synthesizer.
 */

let activeSequenceId = 0;
let activeUtterances = [];
let activeTimers = [];

function clearTimers() {
  for (const id of activeTimers) {
    clearTimeout(id);
    clearInterval(id);
  }
  activeTimers = [];
}

export function isSpeechSupported() {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    Boolean(window.speechSynthesis) &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  );
}

export function cleanTextForSpeech(text, { preserveIndices = false } = {}) {
  const str = String(text || '');
  if (preserveIndices) {
    // Keep character positions aligned with visible text for onboundary highlighting
    return str.replace(/_+/g, (m) => ' '.repeat(m.length));
  }

  return str
    .replace(/_+/g, 'blank')
    .replace(/\u2192/g, ', ')
    .replace(/\|/g, '. ')
    .replace(/•/g, ', ')
    .replace(/\//g, ', ')
    .replace(/(^|[^\w])-es\b/gi, '$1E S')
    .replace(/(^|[^\w])-s\b/gi, '$1S')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function speakText(text, options = {}) {
  if (!isSpeechSupported()) return;

  try {
    stopSpeaking();

    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) return;
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.rate = options.rate || 0.88; // Slightly slower for Grade 2 comprehension
    utterance.pitch = options.pitch || 1.08; // Friendly and clear
    utterance.lang = options.lang || 'en-US';

    activeUtterances = [utterance];
    utterance.onend = () => {
      activeUtterances = [];
      options.onEnd?.();
    };
    utterance.onerror = () => {
      activeUtterances = [];
      options.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

/**
 * Speak an ordered list of card parts (e.g., word first, short pause, then sentence)
 * synchronously inside a tap gesture so iOS Safari & Chrome queue all parts reliably,
 * while emitting part + word-level highlight callbacks.
 */
export function speakCardSequence(parts = [], options = {}) {
  if (!isSpeechSupported()) {
    options.onEnd?.();
    return;
  }

  try {
    stopSpeaking();
    const mySeq = ++activeSequenceId;
    const rate = options.rate || 0.85;
    const pitch = options.pitch || 1.06;
    const lang = options.lang || 'en-US';

    const validParts = (parts || [])
      .map((part) => {
        const trackWords = Boolean(part.trackWords);
        const text = trackWords
          ? String(part.text || '').trim()
          : cleanTextForSpeech(part.text);
        if (!text) return null;
        const spokenText =
          !trackWords && !/[.!?]$/.test(text) ? `${text}.` : text;
        return {
          ...part,
          spokenText,
          wordStarts: Array.isArray(part.wordStarts) ? part.wordStarts : []
        };
      })
      .filter(Boolean);

    if (validParts.length === 0) {
      options.onEnd?.();
      return;
    }

    const totalEstimatedWords = validParts.reduce(
      (sum, p) => sum + Math.max(1, p.spokenText.split(/\s+/).length),
      0
    );

    const safetyTimeout = setTimeout(() => {
      if (mySeq !== activeSequenceId) return;
      clearTimers();
      activeUtterances = [];
      options.onEnd?.();
    }, Math.max(5000, totalEstimatedWords * 950));
    activeTimers.push(safetyTimeout);

    const created = validParts.map((part, idx) => {
      const u = new SpeechSynthesisUtterance(part.spokenText);
      u.rate = rate;
      u.pitch = pitch;
      u.lang = lang;

      let boundarySeen = false;
      let fallbackInterval = null;

      const clearPartFallback = () => {
        if (fallbackInterval) {
          clearInterval(fallbackInterval);
          fallbackInterval = null;
        }
      };

      u.onstart = () => {
        if (mySeq !== activeSequenceId) return;
        options.onPartStart?.(part.id, idx);

        if (part.trackWords && part.wordStarts.length > 0) {
          let approxWordIdx = 0;
          options.onWordIndex?.(part.id, 0);

          const msPerWord = Math.max(240, Math.round(330 / rate));
          fallbackInterval = setInterval(() => {
            if (mySeq !== activeSequenceId || boundarySeen) {
              clearPartFallback();
              return;
            }
            approxWordIdx += 1;
            if (approxWordIdx < part.wordStarts.length) {
              options.onWordIndex?.(part.id, approxWordIdx);
            } else {
              clearPartFallback();
            }
          }, msPerWord);
          activeTimers.push(fallbackInterval);
        }
      };

      u.onboundary = (event) => {
        if (mySeq !== activeSequenceId) return;
        if (!part.trackWords || part.wordStarts.length === 0) return;
        if (event?.name && event.name !== 'word') return;
        if (typeof event?.charIndex !== 'number') return;

        boundarySeen = true;
        clearPartFallback();

        const charPos = event.charIndex;
        let matchedIdx = 0;
        for (let i = 0; i < part.wordStarts.length; i += 1) {
          if (part.wordStarts[i] <= charPos + 1) {
            matchedIdx = i;
          } else {
            break;
          }
        }
        options.onWordIndex?.(part.id, matchedIdx);
      };

      u.onend = () => {
        clearPartFallback();
        if (mySeq !== activeSequenceId) return;
        if (idx === validParts.length - 1) {
          clearTimers();
          activeUtterances = [];
          options.onEnd?.();
        }
      };

      u.onerror = () => {
        clearPartFallback();
        if (mySeq !== activeSequenceId) return;
        if (idx === validParts.length - 1) {
          clearTimers();
          activeUtterances = [];
          options.onEnd?.();
        }
      };

      return u;
    });

    activeUtterances = created;
    for (const u of created) {
      window.speechSynthesis.speak(u);
    }
  } catch (err) {
    console.warn('Speech sequence error:', err);
    options.onEnd?.();
  }
}

export function stopSpeaking() {
  activeSequenceId += 1;
  clearTimers();
  activeUtterances = [];
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch (e) {
    // ignore
  }
}
