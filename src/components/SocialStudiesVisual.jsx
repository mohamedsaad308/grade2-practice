import React from 'react';
import NorthernAfricaMap from './NorthernAfricaMap.jsx';

/**
 * Visual illustrations for Grade 2 Social Studies questions
 * directly based on the uploaded worksheet files:
 * 1. 'north_africa': Northern Africa Map with numbered countries 1-6
 * 2. 'shapes_3d_2d': 3D cube, 2D flat square, and spherical ball
 * 3. 'map_colors': Blue (Water), Yellow (Deserts), Green (Land)
 * 4. 'map_key': Map Key / Legend with symbols
 * 5. 'borders': Border line between countries
 */
export default function SocialStudiesVisual({ type, highlight = null }) {
  if (!type) return null;

  if (type === 'north_africa') {
    return <NorthernAfricaMap highlightNumber={highlight} />;
  }

  if (type === 'shapes_3d_2d') {
    return (
      <div className="soc-visual-card soc-shapes-card" role="img" aria-label="3D cube, 2D square, and spherical ball">
        <div className="soc-shape-item">
          <svg width="70" height="70" viewBox="0 0 70 70">
            {/* 3D Cube */}
            <polygon points="20,25 45,15 60,25 35,35" fill="#F472B6" stroke="#BE185D" strokeWidth="2" />
            <polygon points="20,25 35,35 35,60 20,50" fill="#EC4899" stroke="#BE185D" strokeWidth="2" />
            <polygon points="35,35 60,25 60,50 35,60" fill="#DB2777" stroke="#BE185D" strokeWidth="2" />
          </svg>
          <span className="soc-shape-tag">3D (Not flat)</span>
        </div>

        <div className="soc-shape-item">
          <svg width="70" height="70" viewBox="0 0 70 70">
            {/* 2D Flat Square */}
            <rect x="15" y="15" width="40" height="40" fill="#22C55E" stroke="#15803D" strokeWidth="2" rx="4" />
          </svg>
          <span className="soc-shape-tag">2D (Flat like paper)</span>
        </div>

        <div className="soc-shape-item">
          <svg width="70" height="70" viewBox="0 0 70 70">
            {/* Spherical Ball */}
            <defs>
              <radialGradient id="ballShade" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#F87171" />
                <stop offset="50%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#991B1B" />
              </radialGradient>
            </defs>
            <circle cx="35" cy="35" r="24" fill="url(#ballShade)" stroke="#7F1D1D" strokeWidth="1.5" />
          </svg>
          <span className="soc-shape-tag">Spherical (Round)</span>
        </div>
      </div>
    );
  }

  if (type === 'map_colors') {
    return (
      <div className="soc-visual-card soc-colors-card" role="img" aria-label="Map color meanings: Blue is Water, Yellow is Deserts, Green is Land">
        <div className="soc-color-row color-blue">
          <span className="color-swatch-badge swatch-blue">Blue</span>
          <span className="color-meaning-arrow">➔</span>
          <span className="color-meaning-text">Water (Oceans, Seas, Lakes, Rivers) 🌊</span>
        </div>
        <div className="soc-color-row color-yellow">
          <span className="color-swatch-badge swatch-yellow">Yellow</span>
          <span className="color-meaning-arrow">➔</span>
          <span className="color-meaning-text">Deserts 🏜️</span>
        </div>
        <div className="soc-color-row color-green">
          <span className="color-swatch-badge swatch-green">Green</span>
          <span className="color-meaning-arrow">➔</span>
          <span className="color-meaning-text">Land 🌳</span>
        </div>
      </div>
    );
  }

  if (type === 'map_key') {
    return (
      <div className="soc-visual-card soc-key-card" role="img" aria-label="Map key illustration showing symbols">
        <div className="soc-key-box">
          <div className="soc-key-title">🗝️ Map Key / Legend</div>
          <div className="soc-key-symbols">
            <span className="key-symbol-pill">⛰️ Mountains</span>
            <span className="key-symbol-pill">🌲 Forest</span>
            <span className="key-symbol-pill">🏙️ City</span>
            <span className="key-symbol-pill">〰️ River</span>
            <span className="key-symbol-pill">🛣️ Road</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'borders') {
    return (
      <div className="soc-visual-card soc-border-card" role="img" aria-label="Border line separating two countries">
        <div className="border-diagram-box">
          <div className="country-box country-a">Country A (Egypt)</div>
          <div className="border-divider">
            <span className="border-line-label">⬅ Border Line ➡</span>
          </div>
          <div className="country-box country-b">Country B (Libya)</div>
        </div>
      </div>
    );
  }

  return null;
}
