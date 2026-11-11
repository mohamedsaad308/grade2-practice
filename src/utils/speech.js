/**
 * Hybrid Neural MP3 + Web Speech fallback audio engine for Grade 2 learners.
 * - Primary: Pre-generated natural MP3s from `public/audio/` via `audio-manifest.json`
 * - Preloading: Buffers current & next card/question audio cleanly
 * - Fallback: Browser Web Speech API (`speechSynthesis`) when offline or text is dynamic (e.g. Math)
 */

const EMOJI_STRIP_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\uFE00-\uFE0F\u200D]/gu;
const MAX_PRELOAD_CACHE = 70;
const DEFAULT_CARD_PAUSE_MS = 280;

let manifestCache = null;
let lowerManifestCache = null;
let manifestPromise = null;

let activeSequenceId = 0;
let activeUtterances = [];
let activeTimers = [];
let activeStopNotifier = null;
let sharedAudioEl = null;
const preloadedAudioMap = new Map();

function getSharedAudioElement() {
  if (typeof window === 'undefined' || typeof window.Audio === 'undefined') {
    return null;
  }
  if (!sharedAudioEl) {
    sharedAudioEl = new window.Audio();
    sharedAudioEl.preload = 'auto';
  }
  return sharedAudioEl;
}

function clearTimers() {
  for (const id of activeTimers) {
    clearTimeout(id);
    clearInterval(id);
  }
  activeTimers = [];
}

function clearSharedAudioHandlers(audio) {
  if (!audio) return;
  audio.onplaying = null;
  audio.onended = null;
  audio.onerror = null;
  audio.ontimeupdate = null;
}

export function cleanTextForSpeech(text, { preserveIndices = false } = {}) {
  const str = String(text || '');
  if (preserveIndices) {
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
    .replace(EMOJI_STRIP_RE, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Resolves static asset URLs cleanly on root hosting (`/`), Vite dev,
 * and subpath deployments like GitHub Pages (`/grade2-practice/`).
 */
export function resolveAudioAssetUrl(relativePath) {
  const clean = String(relativePath || '').replace(/^\/+/, '');
  if (!clean) return '';

  if (typeof window === 'undefined' || !window.location) {
    return `./${clean}`;
  }

  const { origin, pathname } = window.location;
  let baseDir = pathname || '/';
  if (/\.[^/]+$/.test(baseDir)) {
    baseDir = baseDir.slice(0, baseDir.lastIndexOf('/') + 1);
  } else if (!baseDir.endsWith('/')) {
    baseDir = `${baseDir}/`;
  }

  return `${origin}${baseDir}${clean}`;
}

function indexManifest(rawManifest) {
  const exact = {};
  const lower = {};
  if (rawManifest && typeof rawManifest === 'object') {
    for (const [key, val] of Object.entries(rawManifest)) {
      if (typeof val === 'string' && val.trim()) {
        const prefixMatch = key.match(/^(de|en):([\s\S]*)$/);
        if (prefixMatch) {
          const langPrefix = prefixMatch[1];
          const cleaned = cleanTextForSpeech(prefixMatch[2]);
          if (cleaned) {
            exact[`${langPrefix}:${cleaned}`] = val;
            lower[`${langPrefix}:${cleaned.toLowerCase()}`] = val;
          }
        } else {
          const cleaned = cleanTextForSpeech(key);
          if (cleaned) {
            exact[cleaned] = val;
            lower[cleaned.toLowerCase()] = val;
          }
        }
      }
    }
  }
  manifestCache = exact;
  lowerManifestCache = lower;
  return exact;
}

export function setAudioManifestForTests(mockManifest) {
  if (!mockManifest) {
    manifestCache = null;
    lowerManifestCache = null;
    manifestPromise = null;
    return;
  }
  indexManifest(mockManifest);
  manifestPromise = Promise.resolve(manifestCache);
}

export function loadAudioManifest() {
  if (manifestCache) {
    return Promise.resolve(manifestCache);
  }
  if (manifestPromise) {
    return manifestPromise;
  }
  if (typeof window === 'undefined' || typeof fetch !== 'function') {
    return Promise.resolve({});
  }

  const manifestUrl = resolveAudioAssetUrl('audio-manifest.json');
  manifestPromise = fetch(manifestUrl)
    .then((res) => (res && res.ok ? res.json() : {}))
    .then((json) => indexManifest(json))
    .catch(() => indexManifest({}));

  return manifestPromise;
}

// Start fetching the audio manifest immediately in the browser so first tap is synchronous
if (typeof window !== 'undefined' && typeof fetch === 'function') {
  loadAudioManifest();
}

export function getManifestAudioPath(text, lang = 'en-US') {
  if (!manifestCache || !text) return null;
  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return null;

  const langPrefix = String(lang || '').toLowerCase().startsWith('de') ? 'de' : null;
  if (langPrefix) {
    const prefixed = `${langPrefix}:${cleaned}`;
    if (manifestCache[prefixed]) return manifestCache[prefixed];
    const prefixedLower = `${langPrefix}:${cleaned.toLowerCase()}`;
    if (lowerManifestCache && lowerManifestCache[prefixedLower]) {
      return lowerManifestCache[prefixedLower];
    }
  }

  if (manifestCache[cleaned]) return manifestCache[cleaned];
  const lowerKey = cleaned.toLowerCase();
  if (lowerManifestCache && lowerManifestCache[lowerKey]) {
    return lowerManifestCache[lowerKey];
  }

  const withoutColon = cleaned.replace(/[:]+$/, '').trim();
  if (withoutColon !== cleaned) {
    if (langPrefix) {
      const pNoColon = `${langPrefix}:${withoutColon}`;
      if (manifestCache[pNoColon]) return manifestCache[pNoColon];
      if (lowerManifestCache && lowerManifestCache[`${langPrefix}:${withoutColon.toLowerCase()}`]) {
        return lowerManifestCache[`${langPrefix}:${withoutColon.toLowerCase()}`];
      }
    }
    if (manifestCache[withoutColon]) return manifestCache[withoutColon];
    if (lowerManifestCache && lowerManifestCache[withoutColon.toLowerCase()]) {
      return lowerManifestCache[withoutColon.toLowerCase()];
    }
  }

  return null;
}

export function isWebSpeechAvailable() {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    Boolean(window.speechSynthesis) &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  );
}

export function isSpeechSupported() {
  if (typeof window === 'undefined') return false;
  return typeof window.Audio !== 'undefined' || isWebSpeechAvailable();
}

/**
 * Preload MP3 files for upcoming texts (e.g. current and next flashcard)
 * so taps respond without delay on slow mobile connections.
 */
export async function preloadSpeechTexts(texts = [], defaultLang = 'en-US') {
  if (typeof window === 'undefined' || typeof window.Audio === 'undefined') return;
  const list = Array.isArray(texts) ? texts.filter(Boolean) : [];
  if (list.length === 0) return;

  await loadAudioManifest();

  for (const item of list) {
    const raw = typeof item === 'object' && item !== null ? item.text : item;
    const itemLang = (typeof item === 'object' && item !== null ? item.lang : null) || defaultLang;
    if (!raw) continue;
    const relPath = getManifestAudioPath(raw, itemLang);
    if (!relPath) continue;
    const url = resolveAudioAssetUrl(relPath);
    if (!url || preloadedAudioMap.has(url)) continue;

    try {
      const preEl = new window.Audio();
      preEl.preload = 'auto';
      preEl.src = url;
      preEl.load();

      if (preloadedAudioMap.size >= MAX_PRELOAD_CACHE) {
        const oldestKey = preloadedAudioMap.keys().next().value;
        preloadedAudioMap.delete(oldestKey);
      }
      preloadedAudioMap.set(url, preEl);
    } catch {
      // Ignore preload failures cleanly
    }
  }
}

function speakPartWithBrowserSynthesis(part, mySeq, options, callbacks) {
  if (!isWebSpeechAvailable()) {
    callbacks.onPartFinished?.();
    return;
  }

  try {
    const spokenText = cleanTextForSpeech(part.text);
    if (!spokenText) {
      callbacks.onPartFinished?.();
      return;
    }

    const rate = options.rate || 0.86;
    const pitch = options.pitch || 1.06;
    const lang = part.lang || options.lang || 'en-US';
    const textWithPause =
      !part.trackWords && !/[.!?]$/.test(spokenText) ? `${spokenText}.` : spokenText;

    const u = new window.SpeechSynthesisUtterance(textWithPause);
    u.rate = rate;
    u.pitch = pitch;
    u.lang = lang;
    activeUtterances = [u];

    let boundarySeen = false;
    let fallbackInterval = null;
    let settled = false;

    const cleanupLocal = () => {
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
        fallbackInterval = null;
      }
    };

    const safetyTimeout = setTimeout(() => {
      if (settled || mySeq !== activeSequenceId) return;
      settled = true;
      cleanupLocal();
      activeUtterances = [];
      callbacks.onPartFinished?.();
    }, Math.max(5000, spokenText.split(/\s+/).length * 950));
    activeTimers.push(safetyTimeout);

    u.onstart = () => {
      if (mySeq !== activeSequenceId) return;
      callbacks.onPartStarted?.();

      if (part.trackWords && part.wordStarts?.length > 0) {
        let approxWordIdx = 0;
        callbacks.onWordIndex?.(0);

        const msPerWord = Math.max(240, Math.round(330 / rate));
        fallbackInterval = setInterval(() => {
          if (mySeq !== activeSequenceId || boundarySeen) {
            cleanupLocal();
            return;
          }
          approxWordIdx += 1;
          if (approxWordIdx < part.wordStarts.length) {
            callbacks.onWordIndex?.(approxWordIdx);
          } else {
            cleanupLocal();
          }
        }, msPerWord);
        activeTimers.push(fallbackInterval);
      }
    };

    u.onboundary = (event) => {
      if (mySeq !== activeSequenceId) return;
      if (!part.trackWords || !part.wordStarts?.length) return;
      if (event?.name && event.name !== 'word') return;
      if (typeof event?.charIndex !== 'number') return;

      boundarySeen = true;
      cleanupLocal();

      const charPos = event.charIndex;
      let matchedIdx = 0;
      for (let i = 0; i < part.wordStarts.length; i += 1) {
        if (part.wordStarts[i] <= charPos + 1) {
          matchedIdx = i;
        } else {
          break;
        }
      }
      callbacks.onWordIndex?.(matchedIdx);
    };

    const doneHandler = () => {
      if (settled) return;
      settled = true;
      clearTimeout(safetyTimeout);
      cleanupLocal();
      if (mySeq !== activeSequenceId) return;
      activeUtterances = [];
      callbacks.onPartFinished?.();
    };

    u.onend = doneHandler;
    u.onerror = doneHandler;

    window.speechSynthesis.speak(u);
  } catch {
    callbacks.onPartFinished?.();
  }
}

function playSinglePart(part, mySeq, options, callbacks) {
  if (mySeq !== activeSequenceId) return;

  const partLang = part.lang || options.lang || 'en-US';
  const manifestPath =
    getManifestAudioPath(part.text, partLang) ||
    (part.fallbackKey ? getManifestAudioPath(part.fallbackKey, partLang) : null);

  const audio = getSharedAudioElement();

  if (!manifestPath || !audio) {
    speakPartWithBrowserSynthesis(part, mySeq, options, callbacks);
    return;
  }

  const audioUrl = resolveAudioAssetUrl(manifestPath);
  let settled = false;
  let wordSyncInterval = null;

  const cleanupAudioPart = () => {
    clearSharedAudioHandlers(audio);
    if (wordSyncInterval) {
      clearInterval(wordSyncInterval);
      wordSyncInterval = null;
    }
  };

  const fallbackToBrowserTts = () => {
    if (settled || mySeq !== activeSequenceId) return;
    settled = true;
    cleanupAudioPart();
    try {
      audio.pause();
    } catch {
      // ignore
    }
    speakPartWithBrowserSynthesis(part, mySeq, options, callbacks);
  };

  const safetyTimeout = setTimeout(() => {
    if (settled || mySeq !== activeSequenceId) return;
    settled = true;
    cleanupAudioPart();
    callbacks.onPartFinished?.();
  }, 45000);
  activeTimers.push(safetyTimeout);

  const updateSyncedWord = () => {
    if (!part.trackWords || !part.wordStarts?.length) return;
    const totalWords = part.wordStarts.length;
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      const progress = Math.min(0.999, Math.max(0, audio.currentTime / audio.duration));
      const wordIdx = Math.min(totalWords - 1, Math.floor(progress * totalWords));
      callbacks.onWordIndex?.(wordIdx);
    }
  };

  audio.onplaying = () => {
    if (settled || mySeq !== activeSequenceId) return;
    callbacks.onPartStarted?.();
    if (part.trackWords && part.wordStarts?.length) {
      callbacks.onWordIndex?.(0);
      if (!wordSyncInterval) {
        wordSyncInterval = setInterval(updateSyncedWord, 80);
        activeTimers.push(wordSyncInterval);
      }
    }
  };

  audio.ontimeupdate = updateSyncedWord;

  audio.onended = () => {
    if (settled || mySeq !== activeSequenceId) return;
    settled = true;
    clearTimeout(safetyTimeout);
    cleanupAudioPart();
    callbacks.onPartFinished?.();
  };

  audio.onerror = () => {
    clearTimeout(safetyTimeout);
    fallbackToBrowserTts();
  };

  try {
    audio.pause();
    audio.src = audioUrl;
    audio.currentTime = 0;
    const playResult = audio.play();
    if (playResult && typeof playResult.then === 'function') {
      playResult.catch(() => {
        clearTimeout(safetyTimeout);
        fallbackToBrowserTts();
      });
    }
  } catch {
    clearTimeout(safetyTimeout);
    fallbackToBrowserTts();
  }
}

/**
 * Play a single spoken text via pre-generated AI MP3 (manifest lookup),
 * automatically stopping prior audio and falling back to Web Speech if unavailable.
 */
export function playSpeech(text, options = {}) {
  const raw = String(text || '').trim();
  if (!raw) {
    options.onEnd?.();
    return;
  }

  playSpeechSequence(
    [{ id: 'single', text: raw, fallbackKey: options.fallbackKey }],
    {
      ...options,
      pauseMs: 0,
      onPartStart: () => options.onStart?.()
    }
  );
}

/**
 * Play multiple spoken segments sequentially (e.g., card word -> short pause -> example sentence,
 * or quiz instruction -> question -> options) reusing one unlocked HTMLAudioElement for iOS Safari.
 */
export function playSpeechSequence(parts = [], options = {}) {
  const validParts = (parts || [])
    .map((p) => {
      if (typeof p === 'string') return { id: 'part', text: p };
      return p;
    })
    .filter((p) => p && cleanTextForSpeech(p.text));

  if (validParts.length === 0) {
    options.onEnd?.();
    return;
  }

  stopSpeaking();
  const mySeq = ++activeSequenceId;
  const pauseMs = typeof options.pauseMs === 'number' ? options.pauseMs : DEFAULT_CARD_PAUSE_MS;

  let endedNotified = false;
  const finishAll = () => {
    if (endedNotified) return;
    endedNotified = true;
    activeStopNotifier = null;
    clearTimers();
    options.onEnd?.();
  };

  activeStopNotifier = finishAll;

  const runIndex = (idx) => {
    if (mySeq !== activeSequenceId) return;
    if (idx >= validParts.length) {
      finishAll();
      return;
    }

    const part = validParts[idx];
    playSinglePart(part, mySeq, options, {
      onPartStarted: () => {
        if (mySeq !== activeSequenceId) return;
        options.onPartStart?.(part.id, idx);
      },
      onWordIndex: (wordIdx) => {
        if (mySeq !== activeSequenceId) return;
        options.onWordIndex?.(part.id, wordIdx);
      },
      onPartFinished: () => {
        if (mySeq !== activeSequenceId) return;
        if (idx + 1 < validParts.length) {
          if (pauseMs > 0) {
            const gapId = setTimeout(() => {
              if (mySeq === activeSequenceId) runIndex(idx + 1);
            }, pauseMs);
            activeTimers.push(gapId);
          } else {
            runIndex(idx + 1);
          }
        } else {
          finishAll();
        }
      }
    });
  };

  runIndex(0);
}

// Backward-compatible aliases so existing callers continue working seamlessly
export const speakText = playSpeech;
export const speakCardSequence = playSpeechSequence;

export function stopSpeaking() {
  activeSequenceId += 1;
  clearTimers();
  activeUtterances = [];

  if (sharedAudioEl) {
    clearSharedAudioHandlers(sharedAudioEl);
    try {
      sharedAudioEl.pause();
      sharedAudioEl.removeAttribute('src');
    } catch {
      // ignore
    }
  }

  if (isWebSpeechAvailable()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }

  if (activeStopNotifier) {
    const notify = activeStopNotifier;
    activeStopNotifier = null;
    try {
      notify();
    } catch {
      // ignore
    }
  }
}
