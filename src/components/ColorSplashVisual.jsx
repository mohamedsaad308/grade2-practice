import React, { useId } from 'react';

const ALL_PALETTE_COLORS = [
  { hex: '#EF4444', stroke: '#991B1B', label: 'rot' },
  { hex: '#EAB308', stroke: '#854D0E', label: 'gelb' },
  { hex: '#22C55E', stroke: '#166534', label: 'grün' },
  { hex: '#3B82F6', stroke: '#1E40AF', label: 'blau' },
  { hex: '#FFFFFF', stroke: '#334155', label: 'weiß' },
  { hex: '#F97316', stroke: '#9A3412', label: 'orange' },
  { hex: '#A855F7', stroke: '#6B21A8', label: 'lila' },
  { hex: '#6B7280', stroke: '#374151', label: 'grau' },
  { hex: '#111827', stroke: '#000000', label: 'schwarz' },
  { hex: '#F472B6', stroke: '#9D174D', label: 'rosa' },
  { hex: '#92400E', stroke: '#451A03', label: 'braun' }
];

function PaintSplatSvg({ fill, stroke = '#334155', isRainbow = false, gradId, size = 104, label }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className="color-splash-svg"
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : 'true'}
    >
      {isRainbow && (
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="20%" stopColor="#F97316" />
            <stop offset="40%" stopColor="#EAB308" />
            <stop offset="60%" stopColor="#22C55E" />
            <stop offset="80%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
      )}
      {/* Main organic paint splash shape + small droplets */}
      <path
        d="M58 14 C65 14 66 28 73 30 C81 32 88 18 95 24 C101 30 88 41 91 49 C94 56 108 55 107 64 C106 73 91 71 88 79 C85 86 98 94 91 101 C84 107 75 94 67 96 C59 98 59 111 50 110 C42 109 45 94 37 91 C29 88 22 100 16 93 C11 86 24 77 23 68 C22 60 9 59 10 50 C11 42 25 45 29 37 C33 29 22 20 30 15 C37 10 43 24 51 22 C54 21 53 14 58 14 Z"
        fill={isRainbow ? `url(#${gradId})` : fill}
        stroke={stroke}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <circle cx="17" cy="24" r="5" fill={isRainbow ? '#EF4444' : fill} stroke={stroke} strokeWidth="2.2" />
      <circle cx="104" cy="36" r="4.5" fill={isRainbow ? '#22C55E' : fill} stroke={stroke} strokeWidth="2.2" />
      <circle cx="98" cy="105" r="4" fill={isRainbow ? '#3B82F6' : fill} stroke={stroke} strokeWidth="2.2" />
      <circle cx="24" cy="103" r="3.5" fill={isRainbow ? '#F97316' : fill} stroke={stroke} strokeWidth="2.2" />
      {/* Glossy highlight */}
      <ellipse
        cx="46"
        cy="45"
        rx="10"
        ry="5.5"
        transform="rotate(-25 46 45)"
        fill={fill === '#111827' ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.45)'}
      />
    </svg>
  );
}

/**
 * Kid-friendly Paint Splash / Color Bubble visual for German "Die Farben"
 * flashcards, mini-activities, and quiz questions.
 */
export default function ColorSplashVisual({ visual, size = 104, compact = false }) {
  const uid = useId();
  if (!visual) return null;

  if (visual.isMultiPalette) {
    return (
      <div
        className={`color-palette-board ${compact ? 'palette-compact' : ''}`}
        role="img"
        aria-label={visual.ariaLabel || 'All eleven German color paint splashes'}
      >
        {ALL_PALETTE_COLORS.map((c) => (
          <span
            key={c.label}
            className="palette-dot-item"
            title={c.label}
          >
            <span
              className="palette-dot-swatch"
              style={{
                backgroundColor: c.hex,
                borderColor: c.stroke
              }}
            />
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={`color-splash-stage ${compact ? 'splash-compact' : ''}`}>
      <PaintSplatSvg
        fill={visual.colorHex || '#EF4444'}
        stroke={visual.strokeHex || (visual.colorHex === '#FFFFFF' ? '#334155' : '#1E293B')}
        isRainbow={Boolean(visual.isRainbow)}
        gradId={`rainbow-${uid}`}
        size={size}
        label={visual.ariaLabel}
      />
      {visual.badgeEmoji && (
        <span className="color-splash-emoji-badge" aria-hidden="true">
          {visual.badgeEmoji}
        </span>
      )}
    </div>
  );
}
