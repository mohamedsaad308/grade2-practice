export const STORAGE_VERSION = 2;
export const STORAGE_KEY = 'grade2_learning_app_v2';
export const LEGACY_STORAGE_KEY_V1 = 'grade2_learning_app_v1';

// In-memory fallback if localStorage is unavailable (e.g., Node test env without DOM)
let memoryStorage = null;

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return {
    getItem: (key) => (memoryStorage ? memoryStorage[key] || null : null),
    setItem: (key, val) => {
      if (!memoryStorage) memoryStorage = {};
      memoryStorage[key] = String(val);
    },
    removeItem: (key) => {
      if (memoryStorage) delete memoryStorage[key];
    },
    clear: () => {
      memoryStorage = {};
    }
  };
}

export function createEmptyTermProgress() {
  return {
    stars: 0,
    sessionsCompleted: 0,
    topicStats: {},
    recentQuestionsBySubject: {},
    itemOutcomesBySubject: {}
  };
}

function inferSubjectFromSignature(sig) {
  if (!sig || typeof sig !== 'string') return 'default';
  if (sig.startsWith('math_')) return 'math';
  if (sig.startsWith('eng_')) return 'english';
  if (sig.startsWith('read_')) return 'reading';
  if (sig.startsWith('soc_')) return 'social_studies';
  return 'default';
}

function deepClone(obj) {
  return obj ? JSON.parse(JSON.stringify(obj)) : {};
}

/**
 * Recomputes top-level aggregate stars, sessions, and merged topicStats
 * across all terms for header display and backwards compatibility.
 */
export function recomputePlayerAggregates(player) {
  if (!player) return player;
  if (!player.termProgress) {
    player.termProgress = {
      q1: createEmptyTermProgress(),
      q2: createEmptyTermProgress()
    };
  }
  if (!player.termProgress.q1) player.termProgress.q1 = createEmptyTermProgress();
  if (!player.termProgress.q2) player.termProgress.q2 = createEmptyTermProgress();

  let totalStars = 0;
  let totalSessions = 0;
  const mergedStats = {};

  Object.values(player.termProgress).forEach((tp) => {
    if (!tp) return;
    totalStars += tp.stars || 0;
    totalSessions += tp.sessionsCompleted || 0;
    const stats = tp.topicStats || {};
    Object.keys(stats).forEach((tid) => {
      const s = stats[tid];
      if (!mergedStats[tid]) {
        mergedStats[tid] = { attempts: 0, firstTryWins: 0, secondTryWins: 0 };
      }
      mergedStats[tid].attempts += s.attempts || 0;
      mergedStats[tid].firstTryWins += s.firstTryWins || 0;
      mergedStats[tid].secondTryWins += s.secondTryWins || 0;
    });
  });

  player.stars = totalStars;
  player.sessionsCompleted = totalSessions;
  player.topicStats = mergedStats;

  if (player.lastTerm !== 'q1' && player.lastTerm !== 'q2') {
    player.lastTerm = 'q2';
  }

  return player;
}

/**
 * Migrates v1 storage schema (or partial/legacy player entries) into v2 term-scoped schema.
 * Moves all old stars, sessions, per-topic accuracy, recent questions, and item outcomes into Q1.
 * Never deletes or resets any player data.
 */
export function migrateV1StateToV2(oldState) {
  const defaults = getDefaultState();
  if (!oldState || typeof oldState !== 'object') {
    return defaults;
  }

  const migratedPlayers = (oldState.players || []).map((oldPlayer) => {
    // Already migrated or has termProgress? Normalize safely without overwriting!
    if (oldPlayer.termProgress && oldPlayer.termProgress.q1) {
      return recomputePlayerAggregates(deepClone(oldPlayer));
    }

    const q1RecentBySubj = {};
    if (Array.isArray(oldPlayer.recentQuestions)) {
      oldPlayer.recentQuestions.forEach((sig) => {
        const subj = inferSubjectFromSignature(sig);
        if (!q1RecentBySubj[subj]) q1RecentBySubj[subj] = [];
        q1RecentBySubj[subj].push(sig);
      });
      // Keep default copy for generic lookups if any
      if (oldPlayer.recentQuestions.length > 0 && !q1RecentBySubj.default) {
        q1RecentBySubj.default = [...oldPlayer.recentQuestions].slice(-200);
      }
    }

    const q1OutcomesBySubj = {};
    if (oldPlayer.itemOutcomes && typeof oldPlayer.itemOutcomes === 'object') {
      q1OutcomesBySubj.english = deepClone(oldPlayer.itemOutcomes);
      q1OutcomesBySubj.default = deepClone(oldPlayer.itemOutcomes);
    }

    const q1Progress = {
      stars: oldPlayer.stars || 0,
      sessionsCompleted: oldPlayer.sessionsCompleted || 0,
      topicStats: deepClone(oldPlayer.topicStats || {}),
      recentQuestionsBySubject: q1RecentBySubj,
      itemOutcomesBySubject: q1OutcomesBySubj
    };

    const migratedPlayer = {
      id: oldPlayer.id,
      name: oldPlayer.name,
      avatar: oldPlayer.avatar || 'fox',
      createdAt: oldPlayer.createdAt || Date.now(),
      lastTerm: oldPlayer.lastTerm === 'q1' ? 'q1' : 'q2',
      termProgress: {
        q1: q1Progress,
        q2: createEmptyTermProgress()
      }
    };

    return recomputePlayerAggregates(migratedPlayer);
  });

  return {
    version: STORAGE_VERSION,
    migratedFromVersion: oldState.version || 1,
    migratedAt: Date.now(),
    currentPlayerId: oldState.currentPlayerId || null,
    players: migratedPlayers,
    settings: {
      ...defaults.settings,
      ...(oldState.settings || {})
    }
  };
}

function getDefaultState() {
  return {
    version: STORAGE_VERSION,
    currentPlayerId: null,
    players: [],
    settings: {
      soundEnabled: true,
      spokenPraiseEnabled: true
    }
  };
}

export function getAppState() {
  const storage = getStorage();
  try {
    const rawV2 = storage.getItem(STORAGE_KEY);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (parsed && parsed.version >= STORAGE_VERSION) {
        const defaults = getDefaultState();
        const players = (parsed.players || []).map((p) =>
          p.termProgress ? recomputePlayerAggregates(p) : migrateV1StateToV2({ players: [p] }).players[0]
        );
        return {
          ...defaults,
          ...parsed,
          players,
          settings: { ...defaults.settings, ...(parsed.settings || {}) }
        };
      }
      // Found data under v2 key with version < 2: migrate in-place safely
      const migrated = migrateV1StateToV2(parsed);
      saveAppState(migrated);
      return migrated;
    }

    // One-time check for v1 legacy data
    const rawV1 = storage.getItem(LEGACY_STORAGE_KEY_V1);
    if (rawV1) {
      const parsedV1 = JSON.parse(rawV1);
      const migrated = migrateV1StateToV2(parsedV1);
      // Save under v2 key; keep v1 untouched as an intact backup
      saveAppState(migrated);
      return migrated;
    }

    return getDefaultState();
  } catch (err) {
    console.error('Failed reading app state from storage', err);
    return getDefaultState();
  }
}

export function saveAppState(state) {
  try {
    const withVersion = {
      ...state,
      version: STORAGE_VERSION
    };
    getStorage().setItem(STORAGE_KEY, JSON.stringify(withVersion));
  } catch (err) {
    console.error('Failed saving app state to storage', err);
  }
}

export function clearAllStorage() {
  try {
    getStorage().removeItem(STORAGE_KEY);
    getStorage().removeItem(LEGACY_STORAGE_KEY_V1);
  } catch (err) {
    console.error('Failed clearing storage', err);
  }
}

export function getPlayers() {
  const state = getAppState();
  return state.players || [];
}

export function getCurrentPlayer() {
  const state = getAppState();
  if (!state.currentPlayerId || !state.players) return null;
  return state.players.find((p) => p.id === state.currentPlayerId) || null;
}

export function createPlayer(name, avatar = 'fox') {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    throw new Error('Player name cannot be empty');
  }
  const cleanName = trimmed.slice(0, 20);

  const state = getAppState();
  const id = `player_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newPlayer = recomputePlayerAggregates({
    id,
    name: cleanName,
    avatar: avatar || 'fox',
    createdAt: Date.now(),
    lastTerm: 'q2', // New players always start on Q2 by default
    termProgress: {
      q1: createEmptyTermProgress(),
      q2: createEmptyTermProgress()
    }
  });

  state.players.push(newPlayer);
  state.currentPlayerId = id;
  saveAppState(state);
  return newPlayer;
}

export function switchPlayer(playerId) {
  const state = getAppState();
  const target = state.players.find((p) => p.id === playerId);
  if (!target) throw new Error('Player not found');
  state.currentPlayerId = playerId;
  saveAppState(state);
  return target;
}

export function renamePlayer(playerId, newName) {
  const trimmed = (newName || '').trim();
  if (!trimmed) throw new Error('Player name cannot be empty');
  const cleanName = trimmed.slice(0, 20);

  const state = getAppState();
  const player = state.players.find((p) => p.id === playerId);
  if (!player) throw new Error('Player not found');

  player.name = cleanName;
  saveAppState(state);
  return player;
}

export function setPlayerLastTerm(playerId, termId) {
  if (!playerId || (termId !== 'q1' && termId !== 'q2')) return null;
  const state = getAppState();
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return null;

  player.lastTerm = termId;
  saveAppState(state);
  return player;
}

export function deletePlayer(playerId) {
  const state = getAppState();
  state.players = state.players.filter((p) => p.id !== playerId);

  if (state.currentPlayerId === playerId) {
    state.currentPlayerId = state.players.length > 0 ? state.players[0].id : null;
  }
  saveAppState(state);
  return state;
}

/**
 * Resets progress for one specific term ('q1' or 'q2') OR everything if termId is null/'all'.
 */
export function resetPlayerProgress(playerId, termId = null) {
  const state = getAppState();
  const player = state.players.find((p) => p.id === playerId);
  if (!player) throw new Error('Player not found');

  if (!player.termProgress) {
    player.termProgress = {
      q1: createEmptyTermProgress(),
      q2: createEmptyTermProgress()
    };
  }

  if (termId && termId !== 'all') {
    player.termProgress[termId] = createEmptyTermProgress();
  } else {
    Object.keys(player.termProgress).forEach((tKey) => {
      player.termProgress[tKey] = createEmptyTermProgress();
    });
  }

  recomputePlayerAggregates(player);
  saveAppState(state);
  return player;
}

export function getPlayerTermStats(player, termId = 'q1') {
  if (!player) return createEmptyTermProgress();
  if (!player.termProgress) return createEmptyTermProgress();
  return player.termProgress[termId] || createEmptyTermProgress();
}

export function getPlayerTermStars(player, termId = 'q1') {
  return getPlayerTermStats(player, termId).stars || 0;
}

export function getPlayerTotalStars(player) {
  if (!player) return 0;
  if (!player.termProgress) return player.stars || 0;
  return Object.values(player.termProgress).reduce((sum, tp) => sum + (tp?.stars || 0), 0);
}

/**
 * Returns flat array of { termId, topicId, attempts, firstTryWins, secondTryWins }
 * filtered by 'all' or a specific termId ('q1' / 'q2').
 */
export function getPlayerTopicAccuracyRows(player, termFilter = 'all') {
  if (!player) return [];
  const rows = [];
  const termIds =
    termFilter && termFilter !== 'all'
      ? [termFilter]
      : Object.keys(player.termProgress || { q1: {}, q2: {} });

  termIds.forEach((tId) => {
    const statsMap = player.termProgress?.[tId]?.topicStats || {};
    Object.keys(statsMap).forEach((topicId) => {
      rows.push({
        termId: tId,
        topicId,
        ...statsMap[topicId]
      });
    });
  });

  return rows;
}

function ensureTermAndSubjectBucket(player, termId = 'q1') {
  if (!player.termProgress) {
    player.termProgress = {
      q1: createEmptyTermProgress(),
      q2: createEmptyTermProgress()
    };
  }
  if (!player.termProgress[termId]) {
    player.termProgress[termId] = createEmptyTermProgress();
  }
  const tp = player.termProgress[termId];
  if (!tp.recentQuestionsBySubject) tp.recentQuestionsBySubject = {};
  if (!tp.itemOutcomesBySubject) tp.itemOutcomesBySubject = {};
  if (!tp.topicStats) tp.topicStats = {};
  return tp;
}

export function getRecentQuestionSignatures(playerId, termId = 'q1', subjectId = 'default') {
  if (!playerId) return [];
  const state = getAppState();
  const player = state.players?.find((p) => p.id === playerId);
  if (!player) return [];
  const tp = player.termProgress?.[termId];
  const list = tp?.recentQuestionsBySubject?.[subjectId];
  return Array.isArray(list) ? list : [];
}

export function addRecentQuestionSignatures(playerId, signatures, termId = 'q1', subjectId = 'default') {
  if (!playerId || !Array.isArray(signatures) || signatures.length === 0) return;
  const state = getAppState();
  const player = state.players?.find((p) => p.id === playerId);
  if (!player) return;

  const tp = ensureTermAndSubjectBucket(player, termId);
  const existing = Array.isArray(tp.recentQuestionsBySubject[subjectId])
    ? tp.recentQuestionsBySubject[subjectId]
    : [];
  const combined = [...existing, ...signatures];
  // Retain the last ~200 question signatures inside this term + subject
  tp.recentQuestionsBySubject[subjectId] = combined.slice(-200);
  saveAppState(state);
}

export function recordItemOutcome(playerId, itemId, wasFirstTry, termId = 'q1', subjectId = 'default') {
  if (!playerId || !itemId) return;
  const state = getAppState();
  const player = state.players?.find((p) => p.id === playerId);
  if (!player) return;

  const tp = ensureTermAndSubjectBucket(player, termId);
  if (!tp.itemOutcomesBySubject[subjectId]) {
    tp.itemOutcomesBySubject[subjectId] = {};
  }
  const subjMap = tp.itemOutcomesBySubject[subjectId];
  const current = subjMap[itemId] || { firstTry: 0, missed: 0 };

  if (wasFirstTry) {
    current.firstTry = (current.firstTry || 0) + 1;
    current.lastOutcome = 'first_try';
  } else {
    current.missed = (current.missed || 0) + 1;
    current.lastOutcome = 'missed';
  }
  subjMap[itemId] = current;
  saveAppState(state);
}

export function getItemOutcomes(playerId, termId = 'q1', subjectId = 'default') {
  if (!playerId) return {};
  const state = getAppState();
  const player = state.players?.find((p) => p.id === playerId);
  if (!player) return {};
  const outcomes = player.termProgress?.[termId]?.itemOutcomesBySubject?.[subjectId];
  return outcomes || {};
}

export function recordSessionCompletion(
  playerId,
  topicId,
  sessionStars,
  questionResults = [],
  termId = 'q1'
) {
  const state = getAppState();
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return;

  const tp = ensureTermAndSubjectBucket(player, termId);
  tp.stars = (tp.stars || 0) + sessionStars;
  tp.sessionsCompleted = (tp.sessionsCompleted || 0) + 1;

  if (!tp.topicStats[topicId]) {
    tp.topicStats[topicId] = {
      attempts: 0,
      firstTryWins: 0,
      secondTryWins: 0
    };
  }

  const stat = tp.topicStats[topicId];
  for (const res of questionResults) {
    stat.attempts += 1;
    if (res.firstTry) {
      stat.firstTryWins += 1;
    } else if (res.secondTry) {
      stat.secondTryWins += 1;
    }
  }

  recomputePlayerAggregates(player);
  saveAppState(state);
  return player;
}

export function getSettings() {
  return getAppState().settings;
}

export function updateSettings(partial) {
  const state = getAppState();
  state.settings = { ...state.settings, ...partial };
  saveAppState(state);
  return state.settings;
}
