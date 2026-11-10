# Grade 2 Stars! Kid-Friendly Practice Website

A kid-friendly practice website built specifically for Grade 2 learners, organized by school term (**Q1: First Quarter** and **Q2: Second Quarter**).
Features isolated term progress, per-player profiles, mobile-first touch engines, and a modular structure so new subjects or terms (like Q3 and Q4) can be added effortlessly.

---

## 🌟 Key Features

- **100% Offline & Private**: Zero backend, no login, no analytics, no external network requests. All progress is stored locally per player AND per term inside `localStorage` (`grade2_learning_app_v2`).
- **Term-Based Architecture (`src/terms/`)**:
  - Top **Term Picker (`Q2 | Q1`)** opens on Q2 by default (remembers last chosen term per player).
  - Automatic one-time migration (`v1` -> `v2`) preserves all existing players' stars, sessions, and accuracy inside Q1.
  - Parent Dashboard supports filtering by **All / Q1 / Q2**, per-term star counts, total stars across all terms, and per-term or full reset with confirmation.
- **Anti-Memorization & Adaptive Practice**:
  - Math uses full 0–999 dynamic generators, balanced comparison symbols (`>` / `<` / `=` at ~1 in 6), and remembers the last ~200 signatures per player inside each `(term, subject)`.
  - English fixed content shuffles questions and options every time and prioritizes missed or unseen items first inside that `(term, subject)`.
- **Personalized Praise Engine (`src/feedback/`)** & **Reusable Engines (`src/engine/`)**:
  - Choice (`choice`), Two-Step punctuation (`two_step`), Match pairs (`match`), FillInNumber, CompareSymbols, DragToOrder, PassageComprehension, and visual helpers.

---

## 📚 Terms & Subjects Included

### 🗓️ Q1 (`First Quarter` — `src/terms/q1/`)
1. **🔢 Math** (`src/terms/q1/subjects/math/`): More/Less Than, Compare Numbers (`> < =`), Order Greatest to Least, Order Least to Greatest.
2. **📚 English** (`src/terms/q1/subjects/english/`, content in `content-source/q1/english_content.json`): 17 grammar/vocabulary/paragraph cards + Mixed English Review.
3. **📖 Reading** (`src/terms/q1/subjects/reading/`): Character Traits & Butterfly Passage comprehension with sentence-by-sentence speech synthesis.
4. **🌍 Social Studies (SOC STUD)** (`src/terms/q1/subjects/social_studies/`): 2D/3D/Spheres, Map Colors & Keys, Northern Africa Map (1–6), Match, and Mixed Review.
5. **⭐ Q1 Review**: 10-question mixed review across all Q1 subjects.

### 🗓️ Q2 (`Second Quarter` — `src/terms/q2/`)
Shows **English** 📚, **Math** 🔢, **Science** 🔬, **Social** 🌍, and **German** 🇩🇪 (currently `"Coming soon"` until topics are added).

---

## 🚀 Getting Started

```bash
npm install
npm run dev      # Local dev server
npm test         # Run automated Vitest suite
npm run build    # Build static bundle (dist/) for GitHub Pages / Netlify
```

---

## 🛠️ How to Add a New Term, Subject, or Topic

### 1. Add Topics to an Existing Subject (e.g. Activate a Q2 Subject)
Empty subjects automatically show **"Coming soon"** while `topics: []`.
As soon as you add at least one topic to `src/terms/q2/subjects/<subject>/index.js`, that subject **automatically becomes active** on the Q2 Home screen with no other code changes needed!

1. Put fixed content in `content-source/q2/<subject>.json` (or `src/terms/q2/subjects/<subject>/content/<topic>.json`), or create dynamic math generators in `src/terms/q2/subjects/math/topics/<topic>.js`.
2. Export topic objects in `src/terms/q2/subjects/<subject>/index.js` inside `topics: [...]` implementing `{ id, title, icon, description, levels, getQuestions(level, playerId, termId) }` (or `generateQuestion(level)`).
3. See [`src/terms/q2/README.md`](src/terms/q2/README.md) for quick Q2 examples.

### 2. Add a New Subject to a Term
1. Create a folder `src/terms/<term>/subjects/<new_subject>/`.
2. Add an `index.js` exporting `{ id, title, icon, color, lightColor, description, topics: [...] }`.
3. Import it and append it to `subjects` in `src/terms/<term>/index.js`.

### 3. Add a New Topic to Q1 English or Reading
- **Q1 English**: Edit `content-source/q1/english_content.json` and run `npm test` (the schema test validates every item and topic card).
- **Q1 Reading**: Add JSON in `src/terms/q1/subjects/reading/content/`, add a loader in `src/terms/q1/subjects/reading/topics/`, and register it in `src/terms/q1/subjects/reading/index.js`.

---

## ➕ How to Add Q3 / Q4 Later

Q3 and Q4 are intentionally omitted from the UI today, but the codebase is designed so adding them takes ~2 minutes:

1. **Create the Term Folder**: Create `src/terms/q3/` with `index.js` and `subjects/<subject>/index.js` (you can copy `src/terms/q2/` as a clean starting template).
   ```javascript
   // src/terms/q3/index.js
   import english from './subjects/english/index.js';
   import math from './subjects/math/index.js';

   export default {
     id: 'q3',
     shortName: 'Q3',
     title: 'Third Quarter',
     description: 'Term 3 subjects for Grade 2 superstars!',
     subjects: [english, math]
   };
   ```
2. **Register in Term Registry**: Import `q3` in `src/terms/index.js` and add it to `terms` and `termTabs`.
3. **Update Default / Valid Term Helpers**:
   - In `src/player/playerStorage.js`: add `'q3'` to `recomputePlayerAggregates`, `setPlayerLastTerm`, and `createEmptyTermProgress` initialization if desired (existing `ensureTermAndSubjectBucket` already creates buckets dynamically for any `termId`!).
   - In `src/views/ParentDashboard.jsx`: `terms.map(...)` and `getPlayerTermStats(p, t.id)` will pick up the new term automatically once `terms` in `src/terms/index.js` includes it!
4. **Update Routes**: `#/q3/<subject>/<topic>` works automatically via `getTermById('q3')` in `src/utils/routes.js`.

---

## 🧪 Testing

Run the full test suite:
```bash
npm test
```
Tests validate:
- **Term Registry & Routing**: Q1/Q2 registries, automatic subject activation when a topic is added, `#/<term>/<subject>/<topic>` routes, and legacy `#/subject/*` / `#/practice/*` redirects.
- **Storage Migration**: One-time `v1` -> `v2` migration preserving all stars, sessions, and topic accuracy inside Q1.
- **Q1 Subject Integrity**: 500-session math anti-memorization simulations, English content schema & renderer checks, Reading passages, and Social Studies map/visual checks.
