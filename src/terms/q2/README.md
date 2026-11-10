# How to Add Q2 Content

Q2 subjects live in `src/terms/q2/subjects/` in this order:
1. `english/` (📚 English — **Active! Week 1 unlocked**)
2. `math/` (🔢 Math — Coming soon)
3. `science/` (🔬 Science — Coming soon)
4. `social/` (🌍 Social — Coming soon)
5. `german/` (🇩🇪 German — Coming soon)

## How a Subject Becomes Active
While a subject's `topics` array in `index.js` is empty (`topics: []`), its card appears greyed out with **"Coming soon"** on the Q2 Home screen.

**As soon as you add at least one topic to `topics: [...]`, that subject automatically becomes active** with no other code changes needed!

## How to Add Week 2 to Q2 English
1. Copy `src/terms/q2/subjects/english/content/week1.json` to `src/terms/q2/subjects/english/content/week2.json`.
2. Update `"weekId": "week2"`, `"weekTitle": "Week 2"`, your 4 `"lessons"` (flashcards + mini-activities), and `"quiz"` questions (`"category": "phonics" | "vocabulary" | "nouns" | "agreement"` or any 4 categories).
3. In `src/terms/q2/subjects/english/index.js`:
   ```js
   import week2Data from './content/week2.json';
   // inside topics:
   topics: [
     ...createWeekTopics(week1Data),
     ...createWeekTopics(week2Data)
   ]
   ```

## Adding Other Q2 Subjects (Math, Science, Social, German)
1. Place your JSON content in `content-source/q2/<subject>.json` or `src/terms/q2/subjects/<subject>/content/<topic>.json` (or dynamic generators in `src/terms/q2/subjects/math/topics/<topic>.js`).
2. Register topic objects in `src/terms/q2/subjects/<subject>/index.js`.
