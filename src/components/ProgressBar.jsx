import React from 'react';

/**
 * Single-row compact progress bar with question counter and percentage:
 * Combines [ Q 3/10 ] [ ====--------- ] [ 30% ] into ONE row (max ~28px tall).
 */
export default function ProgressBar({ current = 1, total = 10 }) {
  const percent = Math.min(100, Math.round((current / total) * 100));

  return (
    <div className="session-progress-row" aria-label={`Question ${current} of ${total}`}>
      <div className="progress-question-badge">
        <span className="q-label">Q</span>
        <span className="q-numbers">
          <strong>{current}</strong>/{total}
        </span>
      </div>

      <div className="progress-track-wrapper">
        <div
          className="progress-track"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="progress-fill" style={{ width: `${percent}%` }} />
          <div className="progress-steps-dots">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`step-dot ${i < current ? 'completed-dot' : ''} ${i === current - 1 ? 'current-dot' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>

      <span className="progress-percent-badge">{percent}%</span>
    </div>
  );
}
