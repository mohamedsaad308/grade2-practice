/**
 * Personalized feedback message templates for Grade 2 learners.
 * All messages are positive, encouraging, and friendly.
 * Never uses the words "wrong" or "bad".
 */
export const feedbackMessages = {
  correct: [
    'Excellent, {name}!',
    'Bravo, {name}!',
    'Great job, {name}!',
    'Well done, {name}!',
    'Amazing, {name}!',
    'You got it, {name}!',
    'Super, {name}!',
    'Fantastic, {name}!',
    'Brilliant, {name}!'
  ],

  correctSecondTry: [
    'Good thinking, {name}! You figured it out.',
    'Great persistence, {name}!',
    'Way to work it out, {name}!',
    'Wonderful job solving it, {name}!'
  ],

  streak3: [
    "{name}, you're on fire!",
    'Three in a row, amazing {name}!',
    'Triple star power, {name}!'
  ],

  streak5: [
    'Unstoppable, {name}!',
    "Five in a row! You're a superstar, {name}!",
    'High five, {name}! Incredible streak!'
  ],

  perfectSession: [
    'Perfect score, {name}!',
    '10 out of 10! You are a champion, {name}!',
    'A perfect 10! Starlight celebration for {name}!'
  ],

  wrong: [
    "Almost, {name}! Let's try again.",
    "Nice try, {name}! Here's a hint.",
    'Keep going, {name}, you can do it!',
    "You're getting closer, {name}! Take another look."
  ],

  sessionEnd: [
    'Great practice today, {name}! You earned {n} stars.',
    'Terrific work, {name}! You collected {n} stars today.',
    'Star-tastic effort, {name}! You got {n} stars.'
  ]
};
