# How to Add Q2 Content

Q2 subjects live in `src/terms/q2/subjects/` in this order:
1. `english/` (📚 English)
2. `math/` (🔢 Math)
3. `science/` (🔬 Science)
4. `social/` (🌍 Social)
5. `german/` (🇩🇪 German)

## How a Subject Becomes Active
While a subject's `topics` array in `index.js` is empty (`topics: []`), its card appears greyed out with **"Coming soon"** on the Q2 Home screen.

**As soon as you add at least one topic to `topics: [...]`, that subject automatically becomes active** with no other code changes needed!

## Adding Fixed JSON Content (English, Science, Social, German)
1. Place your JSON file inside `content-source/q2/<subject>.json` (or inside `src/terms/q2/subjects/<subject>/content/<topic>.json`).
2. Create a topic object in `src/terms/q2/subjects/<subject>/index.js` with `id`, `title`, `icon`, `description`, `hint`, `levels: [1]`, and `getQuestions(level, playerId)`.
3. Shuffle questions and options per session, and pass `(playerId, itemId, wasFirstTry, 'q2', '<subject>')` via the shared engine so "missed questions first" and no-repeat memory work isolated inside Q2!

## Adding a Dynamic Generator (Math)
1. Create a topic generator in `src/terms/q2/subjects/math/topics/<topicName>.js` exporting `{ id, title, icon, description, levels: [1, 2, 3], generateQuestion(level) }`.
2. Import and push it into `topics` inside `src/terms/q2/subjects/math/index.js`.
