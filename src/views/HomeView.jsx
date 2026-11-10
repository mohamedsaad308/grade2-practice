import React from 'react';
import {
  termTabs,
  getTermById,
  isSubjectActive,
  DEFAULT_TERM_ID
} from '../terms/index.js';
import { getPlayerTotalStars, getPlayerTermStats } from '../player/playerStorage.js';
import Mascot from '../components/Mascot.jsx';
import { playPop } from '../utils/audio.js';

export default function HomeView({
  player,
  activeTermId = DEFAULT_TERM_ID,
  onSelectTerm,
  onSelectSubject,
  onStartReview,
  soundEnabled = true
}) {
  const activeTerm = getTermById(activeTermId) || getTermById(DEFAULT_TERM_ID);
  const subjects = activeTerm?.subjects || [];
  const totalStars = getPlayerTotalStars(player);
  const termStats = getPlayerTermStats(player, activeTerm.id);

  const handleTermClick = (termId) => {
    playPop(soundEnabled);
    if (onSelectTerm) {
      onSelectTerm(termId);
    }
  };

  const handleSubjectCardClick = (subj) => {
    playPop(soundEnabled);
    if (onSelectSubject) {
      onSelectSubject(activeTerm.id, subj.id);
    }
  };

  return (
    <div className="home-view-container">
      {/* Compact Hero Welcome Banner */}
      <section className="hero-welcome-card">
        <div className="hero-text-content">
          <div className="hero-greeting-line">
            <span className="hero-wave">👋</span>
            <h1>Hi {player?.name || 'Friend'}!</h1>
          </div>
          <p className="hero-subtitle">
            Pick a quarter and choose a subject to start practicing!
          </p>
          <div className="hero-stats-row">
            <div className="stat-chip star-chip" title="Total stars across all terms">
              <span className="stat-chip-icon">⭐</span>
              <span className="stat-chip-value">{totalStars}</span>
              <span className="stat-chip-label">Total Stars</span>
            </div>
            <div className="stat-chip session-chip" title={`Sessions done in ${activeTerm.shortName}`}>
              <span className="stat-chip-icon">🎯</span>
              <span className="stat-chip-value">{termStats.sessionsCompleted || 0}</span>
              <span className="stat-chip-label">{activeTerm.shortName} Sessions</span>
            </div>
          </div>
        </div>
        <div className="hero-mascot-wrapper">
          <Mascot mood="idle" size={115} />
        </div>
      </section>

      {/* Term Picker: Q2 | Q1 */}
      <section className="term-picker-section" aria-label="School Term">
        <div className="term-pill-tabs" role="tablist" aria-label="Select Quarter">
          {termTabs.map((t) => {
            const isSelected = t.id === activeTerm.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                data-term-tab={t.id}
                className={`term-pill-btn ${isSelected ? 'term-pill-active' : ''}`}
                onClick={() => handleTermClick(t.id)}
              >
                <span className="term-pill-short">{t.shortName}</span>
                <span className="term-pill-title">{t.title}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Subjects Card Grid for Selected Term */}
      <section className="subjects-cards-section" aria-label={`${activeTerm.title} Subjects`}>
        <div className="subjects-section-header">
          <h2>{activeTerm.shortName} Subjects</h2>
          <p className="subjects-section-lead">{activeTerm.description}</p>
        </div>

        <div className="subject-cards-grid">
          {subjects.map((subj) => {
            const active = isSubjectActive(subj);
            const topicCount = subj.topics?.length || 0;

            return (
              <button
                key={subj.id}
                type="button"
                data-subject-card={subj.id}
                data-subject-active={active ? 'true' : 'false'}
                className={`subject-hub-card ${active ? 'subject-card-active' : 'subject-card-coming-soon'}`}
                style={
                  active
                    ? {
                        '--subject-accent': subj.color || '#4F46E5',
                        '--subject-tint': subj.lightColor || '#EEF2FF'
                      }
                    : undefined
                }
                onClick={() => handleSubjectCardClick(subj)}
              >
                <div className="subject-hub-top">
                  <div className="subject-hub-icon">{subj.icon}</div>
                  {active ? (
                    <span className="subject-topic-badge">{topicCount} Topics</span>
                  ) : (
                    <span className="coming-soon-pill">Coming soon</span>
                  )}
                </div>

                <div className="subject-hub-body">
                  <h3 className="subject-hub-title">{subj.title}</h3>
                  <p className="subject-hub-desc">
                    {active
                      ? subj.description
                      : 'New Grade 2 adventures on the way!'}
                  </p>
                </div>

                <div className="subject-hub-footer">
                  {active ? (
                    <span className="subject-open-cta">Open Topics ▶</span>
                  ) : (
                    <span className="subject-soon-cta">Preview 🔒</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Mixed Term Review Card (when defined on the term, e.g. Q1 Review) */}
        {activeTerm.reviewTopic && (
          <div className="term-review-banner-wrapper">
            <button
              type="button"
              data-term-review={activeTerm.id}
              className="term-review-card-btn"
              onClick={() => {
                playPop(soundEnabled);
                if (onStartReview) {
                  onStartReview(activeTerm.id, activeTerm.reviewTopic.id);
                }
              }}
            >
              <div className="term-review-left">
                <span className="term-review-icon">{activeTerm.reviewTopic.icon || '⭐'}</span>
                <div className="term-review-text">
                  <span className="term-review-tag">{activeTerm.shortName} Challenge</span>
                  <h3 className="term-review-title">{activeTerm.reviewTopic.title}</h3>
                  <p className="term-review-desc">{activeTerm.reviewTopic.description}</p>
                </div>
              </div>
              <span className="term-review-play-pill">Play 10 Qs ▶</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
