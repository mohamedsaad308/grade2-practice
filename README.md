# Grade 2 Stars! Kid-Friendly Practice Website

A kid-friendly practice website built specifically for a Grade 2 child.
It starts with Math, but is architected so you can effortlessly add **English**, **Reading**, and **Science** without changing any core engine code.

---

## 🌟 Key Features

- **100% Offline & Private**: Zero backend, no login, no analytics, no external network requests. Works offline once built.
- **Vite + React (Plain JavaScript)**: Simple, clean, extensible code with zero TypeScript overhead.
- **Deploy Anywhere**: Produces standard static files (`dist/`) ready for GitHub Pages, Netlify, or running from local storage.
- **Player Profiles & Multi-Child Support**:
  - Welcomes the child by first name on first load.
  - 8 hand-crafted SVG cartoon animal avatars (Fox, Panda, Lion, Koala, Bunny, Bear, Cat, Dog).
  - Multiple learners on one device with isolated stars, completed sessions, and topic mastery in `localStorage`.
  - Easy player switching and "Add new player" option from the home screen.
- **Personalized Praise Engine (`src/feedback/`)**:
  - Uplifting celebratory praise addressing the child by name (e.g. *"Excellent, Maya!"*, *"You got it, Maya!"*).
  - Guarantees the same praise template is **never repeated twice consecutively**.
  - Positive streak milestones (3 in a row, 5 in a row, 10/10 perfect score).
  - Gentle, encouraging feedback on first mistakes (*"Almost, Maya! Here's a hint."*) — never uses "wrong" or "bad".
  - Dual sound controls: Sound Effects (synthesized Web Audio) and Spoken Voice Praise (browser SpeechSynthesis).
- **Reusable Question Engines (`src/engine/`)**:
  - `FillInNumber`: Large tactile on-screen number pad (0-9, Backspace, Clear) + hardware keyboard support.
  - `CompareSymbols`: Big interactive cards for `>`, `<`, `=`.
  - `DragToOrder`: Interactive ordering with both drag-and-drop and intuitive tap-to-swap cards.
  - `MultipleChoice`: Big touch-ready option buttons.
- **Grade 2 Math Topics (Numbers 0–999, never negative, computed by code)**:
  1. **More/Less Than**: $\pm 1, 2, 5, 10, 100$ with place-value crossings (e.g., $630 - 2 = 628$, $295 + 10 = 305$, $399 + 1 = 400$).
  2. **Compare Numbers**: Plain vs. plain, expanded notation (e.g., $325$ vs $300 + 20 + 5$, $502$ vs $500 + 2$), swapped digits ($418$ vs $481$), and equal cases.
  3. **Order Greatest to Least**: 3 numbers with escalating shared/anagram digits ($243, 234, 324$).
  4. **Order Least to Greatest**: 3 numbers ascending.
- **Parent Dashboard (`/#/parent`)**:
  - View per-player and per-topic accuracy (first-try mastery vs. second-try recovery).
  - Rename players, reset individual progress, or delete profiles.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open the local URL in your browser (e.g., `http://localhost:5173/`).

### 3. Run Unit Tests
```bash
npm test
```

### 4. Build for Production (GitHub Pages / Netlify)
```bash
npm run build
```
The output is generated in `./dist`.

---

## 🏗️ Architecture & Project Structure

```
grade2/
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── src/
│   ├── main.jsx
│   ├── App.jsx                        # Hash-based routing & view dispatcher
│   ├── index.css                      # Kid-friendly design system
│   ├── player/
│   │   ├── playerStorage.js           # Multi-player CRUD & per-player statistics
│   │   ├── avatars.jsx                # 8 custom SVG cartoon animal avatars
│   │   ├── WelcomeScreen.jsx          # First-load onboarding
│   │   └── PlayerSwitcherModal.jsx    # Quick switcher & add player modal
│   ├── feedback/
│   │   ├── messages.js                # Personalized message templates with {name}
│   │   └── feedbackManager.js         # Non-repeating randomizer
│   ├── components/
│   │   ├── Navbar.jsx                 # Player badge, star counter, sound/voice toggles
│   │   ├── Mascot.jsx                 # Reactive SVG mascot (idle, waving, thinking, celebrating)
│   │   ├── ConfettiCanvas.jsx         # Lightweight HTML5 Canvas confetti
│   │   ├── ProgressBar.jsx            # 10-step colorful progress bar
│   │   └── SpeechButton.jsx           # Read aloud button (SpeechSynthesis)
│   ├── engine/
│   │   ├── QuestionDispatcher.jsx     # Routes question.type to engine component
│   │   ├── FillInNumber.jsx           # Virtual number pad & keyboard input
│   │   ├── CompareSymbols.jsx         # Big >, <, = tactile buttons
│   │   ├── DragToOrder.jsx            # Drag & tap-to-swap reordering
│   │   └── MultipleChoice.jsx         # Choice grid
│   ├── views/
│   │   ├── HomeView.jsx               # Topic selector & level picker (Levels 1-3)
│   │   ├── PracticeSession.jsx        # 10-question game loop with 1-retry hint flow
│   │   ├── SessionSummary.jsx         # Star awards & streak recap
│   │   └── ParentDashboard.jsx        # Per-topic accuracy & player management
│   ├── subjects/
│   │   ├── index.js                   # Central Subject Registry
│   │   ├── math/                      # Math subject (4 topics)
│   │   ├── english/                   # English placeholder & template
│   │   ├── reading/                   # Reading placeholder & template
│   │   └── science/                   # Science placeholder & template
│   ├── utils/
│   │   ├── audio.js                   # Web Audio API synthesizers (chime, pop, fanfare)
│   │   ├── speech.js                  # SpeechSynthesis wrapper
│   │   └── mathHelpers.js             # Random ranges, permutations, expanded forms
│   └── tests/
│       ├── mathGenerators.test.js     # Range 0-999, non-negative, accuracy tests
│       ├── playerStorage.test.js      # Player isolation, add, switch, delete
│       └── feedback.test.js           # Template replacement, non-repetition tests
```

---

## 📘 How to Add a New Subject (Step-by-Step)

Adding **English**, **Reading**, **Science**, or any new subject requires **zero changes to the core game loop, audio, player tracking, or parent dashboard**.

### Step 1: Create a Topic Generator
In your subject folder (for example, `src/subjects/english/topics/rhymingWords.js`):

```javascript
export default {
  id: 'english_rhymes',
  title: 'Rhyming Words',
  icon: '🎵',
  description: 'Find words that end with the same sound.',
  levels: [1, 2, 3],

  generateQuestion(level = 1) {
    const pairs = [
      { word: 'cat', rhyme: 'hat', choices: ['hat', 'dog', 'sun'] },
      { word: 'cake', rhyme: 'bake', choices: ['bake', 'frog', 'fish'] },
      { word: 'star', rhyme: 'car', choices: ['car', 'tree', 'book'] }
    ];

    const item = pairs[Math.floor(Math.random() * pairs.length)];

    return {
      id: `eng_rhyme_${Date.now()}_${Math.random()}`,
      type: 'MultipleChoice', // Or 'FillInNumber', 'DragToOrder', etc.
      prompt: `Which word rhymes with "${item.word}"?`,
      promptSpeech: `Which word rhymes with ${item.word}?`,
      data: {
        options: item.choices
      },
      correctAnswer: item.rhyme,
      hint: 'Listen carefully to the ending sound of both words!',
      explanation: `"${item.word}" and "${item.rhyme}" both end with the same sound.`
    };
  }
};
```

### Step 2: Register the Topic in the Subject Definition
Open `src/subjects/english/index.js`:

```javascript
import rhymingWords from './topics/rhymingWords.js';

export default {
  id: 'english',
  title: 'English',
  icon: '📚',
  color: '#EC4899',
  description: 'Spelling, phonics, sight words, and grammar!',
  isAvailable: true, // Mark active!
  topics: [
    rhymingWords
  ]
};
```

### Step 3: That's It!
Save the file. When you open the website:
- A new **English** tab will appear on the home screen.
- Clicking it displays the "Rhyming Words" topic card with Level 1-3 selectors.
- Starting practice launches the shared 10-question session with the child's name, personalized praise, streak confetti, and mascot reactions.
- Accuracy statistics for "Rhyming Words" will automatically appear on the `/parent` page.

---

## 🧪 Testing

Run the Vitest test suite at any time:
```bash
npm test
```
The test suite validates:
- **Math correctness**: boundary checking ($0 \le n \le 999$), non-negativity, place-value crossing arithmetic, and anagram permutations.
- **Player storage**: multi-player isolation, name sanitization (max 20 characters, trimmed), delete and switch logic.
- **Feedback personalization**: dynamic name replacement, streak handling, and strict non-consecutive praise alternation.
