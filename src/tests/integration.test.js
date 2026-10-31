import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearAllStorage,
  getAppState,
  getCurrentPlayer,
  getPlayers,
  createPlayer,
  switchPlayer,
  recordSessionCompletion
} from '../player/playerStorage.js';
import { getFeedback, resetFeedbackHistory } from '../feedback/feedbackManager.js';
import { subjects, getSubjectById, getTopicById } from '../subjects/index.js';

describe('End-to-End User Flow & Player Lifecycle', () => {
  beforeEach(() => {
    clearAllStorage();
    resetFeedbackHistory();
  });

  it('1. First load has no player (triggers Welcome Screen)', () => {
    expect(getCurrentPlayer()).toBeNull();
    expect(getPlayers().length).toBe(0);
  });

  it('2. Creating a player saves to storage, and reloading retains the player name and avatar', () => {
    const created = createPlayer('Maya', 'fox');
    expect(created.name).toBe('Maya');
    expect(created.avatar).toBe('fox');

    // Simulate page reload by reading fresh state from storage
    const reloadedPlayer = getCurrentPlayer();
    expect(reloadedPlayer).not.toBeNull();
    expect(reloadedPlayer.id).toBe(created.id);
    expect(reloadedPlayer.name).toBe('Maya');
    expect(reloadedPlayer.avatar).toBe('fox');
    expect(reloadedPlayer.stars).toBe(0);
  });

  it('3. Multiple players have completely separate stars and progress', () => {
    // Child 1: Maya
    const maya = createPlayer('Maya', 'fox');
    expect(getCurrentPlayer().id).toBe(maya.id);

    // Child 2: Leo
    const leo = createPlayer('Leo', 'lion');
    expect(getCurrentPlayer().id).toBe(leo.id);

    // Leo completes a session and earns 10 stars
    recordSessionCompletion(leo.id, 'math_more_less', 10, [
      { firstTry: true },
      { firstTry: true },
      { firstTry: true }
    ]);

    // Check Leo stars
    const leoState = getPlayers().find(p => p.id === leo.id);
    expect(leoState.stars).toBe(10);
    expect(leoState.sessionsCompleted).toBe(1);

    // Switch to Maya
    switchPlayer(maya.id);
    const activePlayer = getCurrentPlayer();
    expect(activePlayer.name).toBe('Maya');
    expect(activePlayer.stars).toBe(0);
    expect(activePlayer.sessionsCompleted).toBe(0);

    // Maya earns 7 stars
    recordSessionCompletion(maya.id, 'math_compare', 7, [
      { firstTry: true },
      { firstTry: false, secondTry: true }
    ]);

    const refreshedMaya = getCurrentPlayer();
    expect(refreshedMaya.stars).toBe(7);
    expect(refreshedMaya.sessionsCompleted).toBe(1);

    // Confirm Leo's stars are untouched
    const reloadedLeo = getPlayers().find(p => p.id === leo.id);
    expect(reloadedLeo.stars).toBe(10);
  });

  it('4. Personalized praise strictly addresses the active player by name and does not repeat', () => {
    const mayaPraise1 = getFeedback('correct', 'Maya');
    expect(mayaPraise1).toContain('Maya');
    expect(mayaPraise1).not.toContain('Leo');

    const mayaPraise2 = getFeedback('correct', 'Maya');
    expect(mayaPraise2).toContain('Maya');
    // Non-repeating check
    expect(mayaPraise2).not.toBe(mayaPraise1);

    const leoPraise = getFeedback('streak3', 'Leo');
    expect(leoPraise).toContain('Leo');
    expect(leoPraise).not.toContain('Maya');

    const leoEnd = getFeedback('sessionEnd', 'Leo', { n: 10 });
    expect(leoEnd).toContain('Leo');
    expect(leoEnd).toContain('10');
  });

  it('5. Subjects registry has Math, English, and Reading active, and placeholder for Science', () => {
    const mathSubj = getSubjectById('math');
    expect(mathSubj).toBeDefined();
    expect(mathSubj.topics.length).toBe(4);

    const englishSubj = getSubjectById('english');
    expect(englishSubj).toBeDefined();
    expect(englishSubj.isAvailable).toBe(true);
    expect(englishSubj.topics.length).toBe(13);

    const readingSubj = getSubjectById('reading');
    expect(readingSubj).toBeDefined();
    expect(readingSubj.isAvailable).toBe(true);
    expect(readingSubj.topics.length).toBe(2);

    const scienceSubj = getSubjectById('science');
    expect(scienceSubj).toBeDefined();
    expect(scienceSubj.isAvailable).toBe(false);
  });
});
