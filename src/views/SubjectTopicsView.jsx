import React, { useState } from 'react';
import { isSubjectActive } from '../terms/index.js';
import { getPlayerTermStats } from '../player/playerStorage.js';
import Mascot from '../components/Mascot.jsx';
import { playPop } from '../utils/audio.js';

export default function SubjectTopicsView({
  player,
  term,
  subject,
  onBackToTerm,
  onStartTopic,
  soundEnabled = true
}) {
  const [selectedLevels, setSelectedLevels] = useState({
    math_more_less: 1,
    math_compare: 1,
    math_order_desc: 1,
    math_order_asc: 1
  });

  if (!term || !subject) {
    return (
      <div className="coming-soon-view-container">
        <Mascot mood="thinking" size={120} />
        <h2>Subject not found</h2>
        <button
          type="button"
          className="coming-soon-back-btn"
          onClick={() => onBackToTerm(term?.id || 'q2')}
        >
          ⬅ Back to Subjects
        </button>
      </div>
    );
  }

  const active = isSubjectActive(subject);
  const termStats = getPlayerTermStats(player, term.id);

  // Empty Q2 (or future) subject: show friendly "New topics are coming soon!" screen
  if (!active) {
    return (
      <div className="coming-soon-view-container">
        <div className="subject-view-top-bar">
          <button
            type="button"
            className="back-to-term-btn"
            onClick={() => {
              playPop(soundEnabled);
              onBackToTerm(term.id);
            }}
          >
            ⬅ Back to {term.shortName}
          </button>
          <span className="term-context-pill">{term.shortName} • {term.title}</span>
        </div>

        <div className="coming-soon-card">
          <div className="coming-soon-subject-badge">
            <span>{subject.icon}</span>
            <span>{subject.title}</span>
          </div>

          <div className="coming-soon-mascot-wrap">
            <Mascot mood="happy" size={125} />
          </div>

          <h1 className="coming-soon-heading">New topics are coming soon!</h1>
          <p className="coming-soon-body">
            We&apos;re putting together awesome {term.shortName} {subject.title} challenges for you, {player?.name || 'Friend'}. Check back soon!
          </p>

          <button
            type="button"
            className="coming-soon-back-btn"
            onClick={() => {
              playPop(soundEnabled);
              onBackToTerm(term.id);
            }}
          >
            ⬅ Back to {term.shortName} Subjects
          </button>
        </div>
      </div>
    );
  }

  const handleLevelChange = (topicId, level) => {
    playPop(soundEnabled);
    setSelectedLevels((prev) => ({ ...prev, [topicId]: level }));
  };

  const handleStart = (topic) => {
    playPop(soundEnabled);
    const level = selectedLevels[topic.id] || 1;
    onStartTopic(term.id, subject.id, topic.id, level);
  };

  const getQuestionCountLabel = (topic) => {
    if (typeof topic.cardCount === 'number') {
      return `${topic.cardCount} Cards`;
    }
    if (typeof topic.questionCount === 'number') {
      return `${topic.questionCount} Qs`;
    }
    if (Array.isArray(topic.items)) {
      return `${Math.min(10, topic.items.length)} Qs`;
    }
    if (typeof topic.getQuestions === 'function') {
      return `${topic.getQuestions().length} Qs`;
    }
    return '10 Qs';
  };

  // Group topics by optional weekId/weekTitle (used by Q2 Week 1, Week 2, etc.)
  const hasWeeks = subject.topics.some((t) => Boolean(t.weekTitle));
  const topicGroups = [];
  if (hasWeeks) {
    subject.topics.forEach((t) => {
      const key = t.weekId || t.weekTitle || 'default';
      let group = topicGroups.find((g) => g.key === key);
      if (!group) {
        group = {
          key,
          title: t.weekTitle || '',
          subtitle: t.weekSubtitle || '',
          topics: []
        };
        topicGroups.push(group);
      }
      group.topics.push(t);
    });
  } else {
    topicGroups.push({ key: 'all', title: '', subtitle: '', topics: subject.topics });
  }

  let runningIndex = 0;

  return (
    <div className="subject-topics-view-container">
      {/* Top Navigation & Term Context */}
      <div className="subject-view-top-bar">
        <button
          type="button"
          className="back-to-term-btn"
          onClick={() => {
            playPop(soundEnabled);
            onBackToTerm(term.id);
          }}
        >
          ⬅ Back to {term.shortName} Subjects
        </button>
        <span className="term-context-pill">{term.shortName} • {term.title}</span>
      </div>

      {/* Subject Banner */}
      <section
        className="subject-list-header-card"
        style={{
          '--subject-accent': subject.color || '#4F46E5',
          '--subject-tint': subject.lightColor || '#EEF2FF'
        }}
      >
        <div className="subject-list-icon">{subject.icon}</div>
        <div className="subject-list-text">
          <h1>{subject.title} Topics</h1>
          <p>{subject.description}</p>
        </div>
      </section>

      {/* Topics Grid (grouped by week if defined) */}
      <section className="topics-section" aria-label={`${subject.title} Practice Topics`}>
        {topicGroups.map((group) => (
          <div key={group.key} className={group.title ? 'week-group-section' : ''}>
            {group.title && (
              <div className="week-group-header">
                <span className="week-group-badge">📅 {group.title}</span>
                {group.subtitle && <p className="week-group-subtitle">{group.subtitle}</p>}
              </div>
            )}

            <div className="topics-grid">
              {group.topics.map((topic) => {
                const displayIdx = runningIndex++;
                const currentLevel = selectedLevels[topic.id] || 1;
                const topicStat = termStats?.topicStats?.[topic.id];
                const wins = (topicStat?.firstTryWins || 0) + (topicStat?.secondTryWins || 0);
                const countLabel = getQuestionCountLabel(topic);
                const isLesson = topic.mode === 'lesson';
                const isQuiz = topic.mode === 'quiz';

                return (
                  <div
                    key={topic.id}
                    className={`topic-card ${isQuiz ? 'topic-card-quiz' : ''}`}
                    data-topic-card={topic.id}
                  >
                    <div className="topic-card-header">
                      <div className="topic-card-icon-box">{topic.icon || '📝'}</div>
                      <div className="topic-card-title-group">
                        <span className="topic-number-label">
                          {isQuiz ? 'Final Quiz' : isLesson ? `Lesson • Cards + Game` : `Topic ${displayIdx + 1}`}
                        </span>
                        <h3 className="topic-card-title">{topic.title}</h3>
                      </div>
                    </div>

                    <p className="topic-card-desc">{topic.description}</p>

                    {/* Level Selector */}
                    {topic.levels && topic.levels.length > 1 && (
                      <div className="level-selector-wrapper">
                        <span className="level-select-label">Choose Level:</span>
                        <div className="level-pill-group">
                          {topic.levels.map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              className={`level-pill-btn ${currentLevel === lvl ? 'active-level-pill' : ''}`}
                              onClick={() => handleLevelChange(topic.id, lvl)}
                            >
                              {lvl === 1 ? '1 • Easy' : lvl === 2 ? '2 • Super' : '3 • Star'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Topic Footer */}
                    <div className="topic-card-footer">
                      <span className="topic-attempts-count">
                        {wins > 0 ? `✨ ${wins} solved` : 'Ready to start!'}
                      </span>
                      <button
                        type="button"
                        className="topic-start-btn"
                        onClick={() => handleStart(topic)}
                      >
                        {isLesson ? `Start (${countLabel}) ▶` : isQuiz ? `Quiz (${countLabel}) ▶` : `Play (${countLabel}) ▶`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
