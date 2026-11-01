import React from 'react';

/**
 * Northern Africa Map Illustration (Grade 2 Social Studies)
 * Renders the 6 Northern African countries matching the worksheet:
 * (1) Sudan, (2) Egypt, (3) Libya, (4) Tunisia, (5) Algeria, (6) Morocco
 */
export default function NorthernAfricaMap({ highlightNumber = null }) {
  const countries = [
    { num: 1, name: 'Sudan', x: 420, y: 250, desc: 'South of Egypt' },
    { num: 2, name: 'Egypt', x: 430, y: 140, desc: 'Northeast by Red Sea' },
    { num: 3, name: 'Libya', x: 335, y: 145, desc: 'West of Egypt' },
    { num: 4, name: 'Tunisia', x: 275, y: 75, desc: 'Small country at northern tip' },
    { num: 5, name: 'Algeria', x: 215, y: 155, desc: 'Large country in the center-west' },
    { num: 6, name: 'Morocco', x: 140, y: 110, desc: 'Far west by the Atlantic Ocean' }
  ];

  return (
    <div className="soc-map-container" role="region" aria-label="Map of Northern Africa with countries 1 to 6">
      <div className="soc-map-header">
        <span className="soc-map-title">🗺️ Northern Africa Map</span>
        <span className="soc-map-subtitle">Borders separate the 6 countries</span>
      </div>

      <div className="soc-map-svg-wrapper">
        <svg
          viewBox="0 0 540 320"
          className="soc-africa-svg"
          aria-hidden="true"
        >
          {/* Water: Mediterranean Sea & Atlantic Ocean background */}
          <rect x="0" y="0" width="540" height="320" fill="#E0F2FE" rx="14" />
          
          {/* Water labels */}
          <text x="320" y="28" fill="#0369A1" fontSize="12" fontWeight="700" letterSpacing="1">
            🌊 MEDITERRANEAN SEA
          </text>
          <text x="14" y="60" fill="#0369A1" fontSize="11" fontWeight="700">
            ATLANTIC
          </text>
          <text x="18" y="74" fill="#0369A1" fontSize="11" fontWeight="700">
            OCEAN
          </text>
          <text x="495" y="180" fill="#0369A1" fontSize="11" fontWeight="700" transform="rotate(45, 495, 180)">
            RED SEA
          </text>

          {/* Land Outlines for Northern Africa */}
          {/* Morocco (6) */}
          <path
            d="M 90,145 L 125,75 L 160,80 L 175,130 L 140,155 L 90,150 Z"
            fill={highlightNumber === 6 ? '#FEF08A' : '#FEF9C3'}
            stroke="#334155"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Tunisia (4) */}
          <path
            d="M 265,65 L 285,60 L 292,85 L 275,115 L 260,95 Z"
            fill={highlightNumber === 4 ? '#FEF08A' : '#FDE68A'}
            stroke="#334155"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Algeria (5) */}
          <path
            d="M 175,130 L 160,80 L 265,65 L 260,95 L 275,115 L 270,195 L 210,240 L 140,200 L 140,155 Z"
            fill={highlightNumber === 5 ? '#FEF08A' : '#FEF3C7'}
            stroke="#334155"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Libya (3) */}
          <path
            d="M 275,115 L 292,85 L 340,95 L 390,105 L 380,215 L 270,195 Z"
            fill={highlightNumber === 3 ? '#FEF08A' : '#FEF9C3'}
            stroke="#334155"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Egypt (2) */}
          <path
            d="M 390,105 L 475,108 L 485,175 L 460,185 L 380,185 L 385,135 Z"
            fill={highlightNumber === 2 ? '#FEF08A' : '#FDE68A'}
            stroke="#334155"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Sudan (1) */}
          <path
            d="M 380,185 L 460,185 L 485,215 L 460,295 L 365,270 L 380,215 Z"
            fill={highlightNumber === 1 ? '#FEF08A' : '#FEF3C7'}
            stroke="#334155"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Rest of African Continent Outline below */}
          <path
            d="M 90,150 L 80,200 L 140,260 L 210,240 L 270,195 L 365,270 L 460,295 L 440,310 L 330,315 L 120,305 L 75,230 L 90,145 Z"
            fill="#F1F5F9"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Border lines emphasis between Egypt & Libya, Egypt & Sudan */}
          <line x1="385" y1="105" x2="380" y2="185" stroke="#DC2626" strokeWidth="2.5" strokeDasharray="3 2" />
          <line x1="380" y1="185" x2="460" y2="185" stroke="#DC2626" strokeWidth="2.5" strokeDasharray="3 2" />

          {/* Number Badges for countries 1 through 6 */}
          {countries.map((c) => {
            const isHighlighted = highlightNumber === c.num;
            return (
              <g key={c.num} transform={`translate(${c.x}, ${c.y})`}>
                {/* Glow ring if highlighted */}
                {isHighlighted && (
                  <circle
                    cx="0"
                    cy="0"
                    r="22"
                    fill="#FDE047"
                    opacity="0.6"
                    className="map-badge-pulse"
                  />
                )}
                {/* Badge circle */}
                <circle
                  cx="0"
                  cy="0"
                  r="16"
                  fill={isHighlighted ? '#4F46E5' : '#FFFFFF'}
                  stroke={isHighlighted ? '#312E81' : '#1E293B'}
                  strokeWidth="2.5"
                />
                {/* Number text */}
                <text
                  x="0"
                  y="6"
                  textAnchor="middle"
                  fill={isHighlighted ? '#FFFFFF' : '#0F172A'}
                  fontSize="17"
                  fontWeight="900"
                  fontFamily="system-ui, sans-serif"
                >
                  {c.num}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Quick visual helper list */}
      <div className="soc-map-legend-row" aria-label="Country Numbers">
        <span className={`soc-country-pill ${highlightNumber === 1 ? 'pill-active' : ''}`}>
          <strong>(1)</strong> Sudan
        </span>
        <span className={`soc-country-pill ${highlightNumber === 2 ? 'pill-active' : ''}`}>
          <strong>(2)</strong> Egypt
        </span>
        <span className={`soc-country-pill ${highlightNumber === 3 ? 'pill-active' : ''}`}>
          <strong>(3)</strong> Libya
        </span>
        <span className={`soc-country-pill ${highlightNumber === 4 ? 'pill-active' : ''}`}>
          <strong>(4)</strong> Tunisia
        </span>
        <span className={`soc-country-pill ${highlightNumber === 5 ? 'pill-active' : ''}`}>
          <strong>(5)</strong> Algeria
        </span>
        <span className={`soc-country-pill ${highlightNumber === 6 ? 'pill-active' : ''}`}>
          <strong>(6)</strong> Morocco
        </span>
      </div>
    </div>
  );
}
