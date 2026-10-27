const STORAGE_KEY = 'grade2_learning_app_v1';

// In-memory fallback if localStorage is unavailable
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

function getDefaultState() {
  return {
    currentPlayerId: null,
    players: [],
    settings: {
      soundEnabled: true,
      spokenPraiseEnabled: true
    }
  };
}

export function getAppState() {
  try {
    const raw = getStorage().getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw);
    const defaults = getDefaultState();
    return {
      ...defaults,
      ...parsed,
      players: parsed.players || [],
      settings: { ...defaults.settings, ...(parsed.settings || {}) }
    };
  } catch (err) {
    console.error('Failed reading app state from storage', err);
    return getDefaultState();
  }
}

export function saveAppState(state) {
  try {
    getStorage().setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed saving app state to storage', err);
  }
}

export function clearAllStorage() {
  try {
    getStorage().removeItem(STORAGE_KEY);
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
  return state.players.find(p => p.id === state.currentPlayerId) || null;
}

export function createPlayer(name, avatar = 'fox') {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    throw new Error('Player name cannot be empty');
  }
  const cleanName = trimmed.slice(0, 20);

  const state = getAppState();
  const id = `player_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newPlayer = {
    id,
    name: cleanName,
    avatar: avatar || 'fox',
    createdAt: Date.now(),
    stars: 0,
    sessionsCompleted: 0,
    topicStats: {}
  };

  state.players.push(newPlayer);
  state.currentPlayerId = id;
  saveAppState(state);
  return newPlayer;
}

export function switchPlayer(playerId) {
  const state = getAppState();
  const target = state.players.find(p => p.id === playerId);
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
  const player = state.players.find(p => p.id === playerId);
  if (!player) throw new Error('Player not found');

  player.name = cleanName;
  saveAppState(state);
  return player;
}

export function deletePlayer(playerId) {
  const state = getAppState();
  state.players = state.players.filter(p => p.id !== playerId);

  if (state.currentPlayerId === playerId) {
    state.currentPlayerId = state.players.length > 0 ? state.players[0].id : null;
  }
  saveAppState(state);
  return state;
}

export function resetPlayerProgress(playerId) {
  const state = getAppState();
  const player = state.players.find(p => p.id === playerId);
  if (!player) throw new Error('Player not found');

  player.stars = 0;
  player.sessionsCompleted = 0;
  player.topicStats = {};
  saveAppState(state);
  return player;
}

export function recordSessionCompletion(playerId, topicId, sessionStars, questionResults = []) {
  const state = getAppState();
  const player = state.players.find(p => p.id === playerId);
  if (!player) return;

  player.stars = (player.stars || 0) + sessionStars;
  player.sessionsCompleted = (player.sessionsCompleted || 0) + 1;

  if (!player.topicStats) player.topicStats = {};
  if (!player.topicStats[topicId]) {
    player.topicStats[topicId] = {
      attempts: 0,
      firstTryWins: 0,
      secondTryWins: 0
    };
  }

  const stat = player.topicStats[topicId];
  for (const res of questionResults) {
    stat.attempts += 1;
    if (res.firstTry) {
      stat.firstTryWins += 1;
    } else if (res.secondTry) {
      stat.secondTryWins += 1;
    }
  }

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
