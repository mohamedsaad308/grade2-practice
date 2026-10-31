# Grade 2 Stars! Kid-Friendly Practice Website

A kid-friendly practice website built specifically for a Grade 2 child.
Features complete **Math** and **English** subjects, and is architected so you can effortlessly add more content, or add **Reading** and **Science** without changing any core engine code.

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
  - Read-aloud button on every question with speech synthesis.
- **Reusable Question Engines (`src/engine/`)**:
  - `LetterTiles`: Large touch tiles for spelling and unscrambling with placed slots, undo, and clear.
  - `WordBank`: Word cards row; child taps a card to fill the blank in a sentence.
  - `MatchPairs`: Tactile two-column matching for vocabulary words and definitions.
  - `TapToSelect`: Tap to select one or multiple sentences (supports multi-select compound sentences).
  - `PassageComprehension`: Scrollable story card with sentence-level read-aloud and passage audio controls.
  - `TwoStep`: Multi-phase card: pick the target sentence, then select the punctuation mark (`.`, `?`, `!`).
  - `FillInNumber`: Large on-screen number pad (0-9, Backspace, Clear) + hardware keyboard support.
  - `CompareSymbols`: Big interactive cards for `>`, `<`, `=`.
  - `DragToOrder`: Tactile cards with both drag-and-drop and tap-to-swap ordering.
  - `MultipleChoice`: Touch-ready option buttons.

---

## 📚 Included Subjects & Topics

### 🔢 Math (Numbers 0–999, Algorithmic & Never Negative)
1. **More/Less Than**: $\pm 1, 2, 5, 10, 100$ with place-value crossings ($630 - 2 = 628$, $295 + 10 = 305$, $399 + 1 = 400$).
2. **Compare Numbers**: Plain vs. plain, expanded notation ($325$ vs $300 + 20 + 5$, $502$ vs $500 + 2$), and swapped digits ($418$ vs $481$).
3. **Order Greatest to Least**: 3 numbers descending with anagram permutations ($243, 234, 324$).
4. **Order Least to Greatest**: 3 numbers ascending.

### 📖 English (13 Fixed Curriculum Topics in `src/subjects/english/content/*.json`)
1. **Spelling with Pictures** (`LetterTiles`): Look at picture and spell word (cape, gate, cake, race).
2. **Unscramble Letters** (`LetterTiles`): Sentence clue to unscramble rule, rose, nose, ride.
3. **Complete Sentence with Word Bank** (`WordBank`): kit, kite, fin, fine.
4. **Synonyms of Underlined Words** (`WordBank`): glad, large, warm, clever.
5. **Vocabulary Match Pairs** (`MatchPairs`): easily, tasty, planet, frenzy.
6. **Vocabulary Sentence Completion** (`MultipleChoice`): gasped, amount, scowl, perfect, queasy.
7. **Punctuation: Exclamations** (`TwoStep`): Find exclamation and punctuate with `!`.
8. **Punctuation: Statements** (`TwoStep`): Find statement and punctuate with `.`.
9. **What Kind of Sentence Is It?** (`MultipleChoice`): command, exclamation, statement, question.
10. **Find Compound Sentences** (`TapToSelect`): Select the two compound sentences.
11. **Simple or Compound Sentence?** (`MultipleChoice`).
12. **Compound Subject or Predicate?** (`MultipleChoice`).
13. **Identify C.S or C.P** (`MultipleChoice`).

### 📚 Reading (2 Comprehension Topics in `src/subjects/reading/content/*.json`)
1. **Character Traits** (`MultipleChoice`): Read the short paragraph and choose the word that describes Mariam, Sara, Markos, Omar, or Lina.
2. **Story: All About Butterflies** (`PassageComprehension`): Read the informational passage with sentence-by-sentence read-aloud and answer questions about genre, egg laying, and hatching.

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
Open `http://localhost:5173/` in your browser.

### 3. Run Unit Tests
```bash
npm test
```

### 4. Build for Production (GitHub Pages / Netlify)
```bash
npm run build
```

---

## 📘 How to Add English Content

All English questions are **data-driven** and stored in JSON files under `src/subjects/english/content/`. You can add new questions or edit existing ones **without changing any code**.

### 1. Add a Question to an Existing Topic

Open the relevant JSON file in `src/subjects/english/content/` (e.g., `spelling.json`, `wordBank.json`, `vocabSentences.json`). Add a new JSON object to the array:

#### Example A: Adding a Spelling Question (`LetterTiles`)
```json
{
  "id": "eng_spell_5",
  "type": "LetterTiles",
  "prompt": "Look at the picture and spell the word:",
  "promptSpeech": "Look at the picture and spell the word: lake.",
  "data": {
    "word": "lake",
    "scrambled": ["k", "a", "e", "l"],
    "pictureLabel": "a blue lake"
  },
  "correctAnswer": "lake",
  "hint": "Silent e makes the vowel say its name! Think of water: l-a-k-e.",
  "explanation": "l-a-k-e spells lake! The silent e makes the 'a' say its name."
}
```

#### Example B: Adding a Sentence Completion Question (`MultipleChoice`)
```json
{
  "id": "eng_vocab_6",
  "type": "MultipleChoice",
  "prompt": "Choose the correct word to complete the sentence:",
  "promptSpeech": "The bird flew over the lake.",
  "data": {
    "sentence": "The bird ___ high over the lake.",
    "options": ["soared", "crawled", "slept"]
  },
  "correctAnswer": "soared",
  "hint": "Which word means flying high in the air?",
  "explanation": "soared means flew high up in the sky."
}
```

#### Example C: Adding a Word Bank Question (`WordBank`)
```json
{
  "id": "eng_wordbank_4",
  "type": "WordBank",
  "prompt": "Choose a word from the word bank to complete the sentence:",
  "promptSpeech": "The rabbit likes to hop.",
  "data": {
    "sentence": "The rabbit likes to ___ in the grass.",
    "wordBank": ["hop", "hope", "cub", "cube"]
  },
  "correctAnswer": "hop",
  "hint": "A short vowel sound: rabbits like to hop!",
  "explanation": "hop has a short o sound: The rabbit likes to hop in the grass."
}
```

### 2. Creating a Brand New English Topic

1. Create a new JSON content file in `src/subjects/english/content/<yourTopicName>.json`.
2. Create a topic loader in `src/subjects/english/topics/<yourTopicName>.js`:
```javascript
import myData from '../content/myTopic.json';
import { shuffle } from '../../../utils/mathHelpers.js';

export default {
  id: 'english_my_topic',
  title: 'My Topic Title',
  icon: '⭐',
  description: 'Topic description for learners.',
  getQuestions() {
    return myData.map(q => ({
      ...q,
      data: {
        ...q.data,
        options: q.data.options ? shuffle([...q.data.options]) : undefined
      }
    }));
  }
};
```
3. Import and add it to the `topics` array in `src/subjects/english/index.js`.
4. It will immediately appear in the English subject grid!

---

## 📖 How to Add Reading Content

Reading questions are also completely data-driven and stored in `src/subjects/reading/content/`:
- `characterTraits.json`: Short story paragraphs asking the child to choose the trait that best describes the character.
- `butterflyPassage.json`: Longer passages with sentence-by-sentence text-to-speech comprehension questions.

### Adding a New Reading Story Passage (`PassageComprehension`)
To add a new story with questions:
1. In `src/subjects/reading/content/<storyName>.json`:
```json
[
  {
    "id": "read_story_1",
    "type": "PassageComprehension",
    "prompt": "What did Leo find in the garden?",
    "promptSpeech": "What did Leo find in the garden?",
    "data": {
      "passageTitle": "Leo's Garden Discovery",
      "passage": "Leo walked into the sunny garden. Behind a tall sunflower, he saw a tiny blue egg resting softly in a nest.",
      "options": ["A shiny red ball.", "A tiny blue egg.", "A lost kitten."]
    },
    "correctAnswer": "A tiny blue egg.",
    "hint": "Look back at the second sentence of the story!",
    "explanation": "The story tells us that Leo saw a tiny blue egg in a nest."
  }
]
```
2. Create a topic file in `src/subjects/reading/topics/<storyName>.js` and add it to `src/subjects/reading/index.js`.

---

## 🧪 Testing

Run the automated test suite at any time:
```bash
npm test
```
The test suite validates:
- **Math generation**: range 0–999, non-negativity, expanded notation, and descending/ascending sorting.
- **English content files**: verifies every question has non-empty prompts, hints, explanations, scrambled anagram integrity, valid options, and correct answers.
- **Player storage**: multi-player isolation, name sanitization (max 20 characters, trimmed), delete and switch logic.
- **Feedback personalization**: dynamic name replacement, streak handling, and strict non-consecutive praise alternation.
