import { describe, it, expect, beforeEach } from 'vitest';
import { getFeedback, resetFeedbackHistory } from '../feedback/feedbackManager.js';
import { feedbackMessages } from '../feedback/messages.js';

describe('Personalized Feedback Engine', () => {
  beforeEach(() => {
    resetFeedbackHistory();
  });

  it('correctly inserts the player name', () => {
    const msg = getFeedback('correct', 'Lily');
    expect(msg).toContain('Lily');
  });

  it('never outputs the same message template twice in a row', () => {
    let prev = null;
    for (let i = 0; i < 30; i++) {
      const current = getFeedback('correct', 'Alex');
      expect(current).not.toBe(prev);
      prev = current;
    }
  });

  it('handles second-try, streak, and wrong without negative words', () => {
    const wrongMsg = getFeedback('wrong', 'Emma');
    expect(wrongMsg).toContain('Emma');
    expect(wrongMsg.toLowerCase()).not.toContain('wrong');
    expect(wrongMsg.toLowerCase()).not.toContain('bad');

    const streak3 = getFeedback('streak3', 'Noah');
    expect(streak3).toContain('Noah');

    const streak5 = getFeedback('streak5', 'Noah');
    expect(streak5).toContain('Noah');
  });

  it('correctly replaces {n} in sessionEnd', () => {
    const endMsg = getFeedback('sessionEnd', 'Sophie', { n: 9 });
    expect(endMsg).toContain('Sophie');
    expect(endMsg).toContain('9');
  });

  it('contains valid templates across all message groups', () => {
    const groups = ['correct', 'correctSecondTry', 'streak3', 'streak5', 'perfectSession', 'wrong', 'sessionEnd'];
    for (const group of groups) {
      expect(Array.isArray(feedbackMessages[group])).toBe(true);
      expect(feedbackMessages[group].length).toBeGreaterThan(0);
      for (const t of feedbackMessages[group]) {
        expect(t).toContain('{name}');
      }
    }
  });
});
