import React from 'react';

/**
 * 10-step colorful progress bar with question markers
 */
export default function ProgressBar({ current = 1, total = 10 }) {
  const percent = Math.min(100, Math.round((current / total) * 100));

  return (
    <div className="session-progress-wrapper" aria-label={`Question ${current} of ${total}`}>
      <div className="progress-info-row">
        <span className="progress-question-indicator">
          Question <strong>{current}</strong> of {total}
        </span>
        <span className="progress-percent-indicator">{percent}%</span>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${percent}%` }}
        />
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
  );
}
