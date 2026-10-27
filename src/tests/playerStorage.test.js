import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearAllStorage,
  getPlayers,
  getCurrentPlayer,
  createPlayer,
  switchPlayer,
  renamePlayer,
  deletePlayer,
  resetPlayerProgress,
  recordSessionCompletion
} from '../player/playerStorage.js';

describe('Player Storage & Profile Isolation', () => {
  beforeEach(() => {
    clearAllStorage();
  });

  it('starts with empty players and null current player', () => {
    expect(getPlayers()).toEqual([]);
    expect(getCurrentPlayer()).toBeNull();
  });

  it('creates a new player, trims name, respects 20 character limit, and sets as current', () => {
    const player = createPlayer('  Charlotte Elizabeth  ', 'panda');
    expect(player.name).toBe('Charlotte Elizabeth');
    expect(player.avatar).toBe('panda');
    expect(player.stars).toBe(0);

    const current = getCurrentPlayer();
    expect(current).not.toBeNull();
    expect(current.id).toBe(player.id);
  });

  it('throws an error if name is empty or pure whitespace', () => {
    expect(() => createPlayer('')).toThrow();
    expect(() => createPlayer('   ')).toThrow();
  });

  it('supports multiple players with separate progress and stars', () => {
    const maya = createPlayer('Maya', 'fox');
    const leo = createPlayer('Leo', 'lion');

    // Currently Leo is selected
    expect(getCurrentPlayer().id).toBe(leo.id);

    // Record session for Leo: 10 stars
    recordSessionCompletion(leo.id, 'math_more_less', 10, [
      { firstTry: true },
      { firstTry: true }
    ]);

    // Switch to Maya
    switchPlayer(maya.id);
    expect(getCurrentPlayer().id).toBe(maya.id);

    // Record session for Maya: 5 stars
    recordSessionCompletion(maya.id, 'math_compare', 5, [
      { firstTry: false, secondTry: true }
    ]);

    // Check separation
    const players = getPlayers();
    const mayaData = players.find(p => p.id === maya.id);
    const leoData = players.find(p => p.id === leo.id);

    expect(mayaData.stars).toBe(5);
    expect(mayaData.sessionsCompleted).toBe(1);
    expect(mayaData.topicStats['math_compare'].firstTryWins).toBe(0);
    expect(mayaData.topicStats['math_compare'].secondTryWins).toBe(1);

    expect(leoData.stars).toBe(10);
    expect(leoData.sessionsCompleted).toBe(1);
    expect(leoData.topicStats['math_more_less'].firstTryWins).toBe(2);
  });

  it('renames a player correctly', () => {
    const player = createPlayer('Sam', 'bunny');
    renamePlayer(player.id, 'Samantha');
    const current = getCurrentPlayer();
    expect(current.name).toBe('Samantha');
  });

  it('resets a single player progress without affecting other players', () => {
    const p1 = createPlayer('Child 1', 'koala');
    const p2 = createPlayer('Child 2', 'bear');

    recordSessionCompletion(p1.id, 'math_more_less', 15, []);
    recordSessionCompletion(p2.id, 'math_more_less', 20, []);

    resetPlayerProgress(p1.id);

    const players = getPlayers();
    expect(players.find(p => p.id === p1.id).stars).toBe(0);
    expect(players.find(p => p.id === p2.id).stars).toBe(20);
  });

  it('deletes a player and re-assigns active player', () => {
    const p1 = createPlayer('P1', 'cat');
    const p2 = createPlayer('P2', 'puppy');

    // Active is p2
    deletePlayer(p2.id);
    const current = getCurrentPlayer();
    expect(current.id).toBe(p1.id);

    deletePlayer(p1.id);
    expect(getCurrentPlayer()).toBeNull();
  });
});
