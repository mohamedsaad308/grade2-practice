import React, { useState } from 'react';
import { subjects } from '../subjects/index.js';
import { AvatarIcon } from '../player/avatars.jsx';
import Mascot from '../components/Mascot.jsx';
import { playPop } from '../utils/audio.js';

export default function HomeView({
  player,
  onStartTopic,
  onChangePlayer,
  soundEnabled = true
}) {
  const [selectedSubjectId, setSelectedSubjectId] = useState('math');
  const [selectedLevels, setSelectedLevels] = useState({
    math_more_less: 1,
    math_compare: 1,
    math_order_desc: 1,
    math_order_asc: 1
  });

  const activeSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  const handleLevelChange = (topicId, level) => {
    playPop(soundEnabled);
    setSelectedLevels(prev => ({ ...prev, [topicId]: level }));
  };

  const handleStart = (topic) => {
    playPop(soundEnabled);
    const level = selectedLevels[topic.id] || 1;
    onStartTopic(activeSubject.id, topic.id, level);
  };

  return (
    <div className="home-view-container">
      {/* Hero Welcome Banner */}
      <section className="hero-welcome-card">
        <div className="hero-text-content">
          <div className="hero-greeting-line">
            <span className="hero-wave">👋</span>
            <h1>Hi {player?.name}!</h1>
          </div>
          <p className="hero-subtitle">
            What fun challenge do you want to master today?
          </p>
          <div className="hero-stats-row">
            <div className="stat-chip star-chip">
              <span className="stat-chip-icon">⭐</span>
              <span className="stat-chip-value">{player?.stars || 0}</span>
              <span className="stat-chip-label">Stars Earned</span>
            </div>
            <div className="stat-chip session-chip">
              <span className="stat-chip-icon">🎯</span>
              <span className="stat-chip-value">{player?.sessionsCompleted || 0}</span>
              <span className="stat-chip-label">Sessions Done</span>
            </div>
          </div>
        </div>
        <div className="hero-mascot-wrapper">
          <Mascot mood="idle" size={130} />
        </div>
      </section>

      {/* Subject Tabs */}
      <section className="subjects-nav-section" aria-label="Subjects">
        <div className="subjects-tab-list">
          {subjects.map(subj => {
            const isActive = subj.id === activeSubject.id;
            const isAvailable = subj.isAvailable !== false;
            return (
              <button
                key={subj.id}
                type="button"
                className={`subject-tab-btn ${isActive ? 'tab-active' : ''} ${!isAvailable ? 'tab-disabled' : ''}`}
                onClick={() => {
                  if (isAvailable) {
                    playPop(soundEnabled);
                    setSelectedSubjectId(subj.id);
                  }
                }}
                disabled={!isAvailable}
              >
                <span className="subject-tab-icon">{subj.icon}</span>
                <span className="subject-tab-title">{subj.title}</span>
                {!isAvailable && <span className="coming-soon-badge">Soon</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Topics Grid for Selected Subject */}
      <section className="topics-section" aria-label="Practice Topics">
        <div className="topics-header">
          <h2>{activeSubject.title} Topics</h2>
          <p className="topics-lead">{activeSubject.description}</p>
        </div>

        <div className="topics-grid">
          {activeSubject.topics.map((topic, index) => {
            const currentLevel = selectedLevels[topic.id] || 1;
            const topicStats = player?.topicStats?.[topic.id];
            const wins = (topicStats?.firstTryWins || 0) + (topicStats?.secondTryWins || 0);

            return (
              <div key={topic.id} className="topic-card">
                <div className="topic-card-header">
                  <div className="topic-card-icon-box">{topic.icon || '📝'}</div>
                  <div className="topic-card-title-group">
                    <span className="topic-number-label">Topic {index + 1}</span>
                    <h3 className="topic-card-title">{topic.title}</h3>
                  </div>
                </div>

                <p className="topic-card-desc">{topic.description}</p>

                {/* Level Selector */}
                <div className="level-selector-wrapper">
                  <span className="level-select-label">Choose Level:</span>
                  <div className="level-pill-group">
                    {[1, 2, 3].map(lvl => (
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

                {/* Topic Progress Footer */}
                <div className="topic-card-footer">
                  <span className="topic-attempts-count">
                    {wins > 0 ? `✨ ${wins} solved` : 'Ready to start!'}
                  </span>
                  <button
                    type="button"
                    className="topic-start-btn"
                    onClick={() => handleStart(topic)}
                  >
                    Play (10 Qs) ▶
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
