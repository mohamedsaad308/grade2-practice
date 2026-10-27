import React from 'react';

/**
 * Friendly reactive Mascot SVG character: "Sparky the Star Buddy"
 * Moods: 'idle' | 'waving' | 'thinking' | 'celebrating' | 'supportive'
 */
export default function Mascot({ mood = 'idle', size = 120, className = '' }) {
  const s = size;

  return (
    <div className={`inline-flex items-center justify-center mascot-mood-${mood} ${className}`} style={{ width: s, height: s }}>
      <svg width={s} height={s} viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="70%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#D97706" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Glow / Body: 5-pointed curved friendly Star */}
        <path
          d="M70 12
             C72 12, 79 38, 86 42
             C94 46, 122 46, 124 50
             C126 54, 102 72, 100 80
             C98 88, 108 114, 104 118
             C100 122, 78 104, 70 104
             C62 104, 40 122, 36 118
             C32 114, 42 88, 40 80
             C38 72, 14 54, 16 50
             C18 46, 46 46, 54 42
             C61 38, 68 12, 70 12 Z"
          fill="url(#starGlow)"
          stroke="#D97706"
          strokeWidth="4"
          strokeLinejoin="round"
          filter="url(#softShadow)"
        />

        {/* Cheeks */}
        <circle cx="48" cy="74" r="7" fill="#FB7185" opacity="0.5" />
        <circle cx="92" cy="74" r="7" fill="#FB7185" opacity="0.5" />

        {/* Dynamic Expressions based on mood */}
        {mood === 'celebrating' && (
          <g>
            {/* Joyful wink/star eyes */}
            <path d="M46 60 L54 66 L46 72" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M94 60 L86 66 L94 72" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Big Open Joyful Mouth */}
            <path d="M56 74 Q70 94 84 74 Z" fill="#991B1B" />
            <path d="M62 80 Q70 86 78 80" stroke="#F87171" strokeWidth="3" fill="#FB7185" />
            {/* Arms up high celebrating */}
            <path d="M26 44 Q14 28 20 18" stroke="#D97706" strokeWidth="5" strokeLinecap="round" fill="none" />
            <circle cx="20" cy="18" r="5" fill="#F59E0B" />
            <path d="M114 44 Q126 28 120 18" stroke="#D97706" strokeWidth="5" strokeLinecap="round" fill="none" />
            <circle cx="120" cy="18" r="5" fill="#F59E0B" />
          </g>
        )}

        {mood === 'thinking' && (
          <g>
            {/* Curious eyes looking up */}
            <circle cx="52" cy="61" r="5" fill="#78350F" />
            <circle cx="53.5" cy="59" r="2" fill="#FFFFFF" />
            <circle cx="88" cy="61" r="5" fill="#78350F" />
            <circle cx="89.5" cy="59" r="2" fill="#FFFFFF" />
            {/* Raised eyebrow */}
            <path d="M46 54 Q52 50 58 54" stroke="#78350F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M82 52 Q88 47 94 51" stroke="#78350F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Pensive cute mouth */}
            <ellipse cx="72" cy="76" rx="4" ry="5" fill="#991B1B" />
            {/* Hand on chin */}
            <path d="M60 84 Q66 84 70 80" stroke="#D97706" strokeWidth="4" strokeLinecap="round" fill="none" />
          </g>
        )}

        {mood === 'waving' && (
          <g>
            {/* Happy eyes */}
            <circle cx="52" cy="64" r="5" fill="#78350F" />
            <circle cx="53.5" cy="62" r="2" fill="#FFFFFF" />
            <circle cx="88" cy="64" r="5" fill="#78350F" />
            <circle cx="89.5" cy="62" r="2" fill="#FFFFFF" />
            {/* Cheerful wide smile */}
            <path d="M56 74 Q70 86 84 74" stroke="#78350F" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            {/* Waving right arm */}
            <path d="M114 50 Q130 36 126 22" stroke="#D97706" strokeWidth="5" strokeLinecap="round" fill="none" />
            <circle cx="126" cy="22" r="6" fill="#F59E0B" />
            {/* Wave motion lines */}
            <path d="M132 16 Q136 22 134 28" stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M136 20 Q139 24 138 27" stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        )}

        {mood === 'supportive' && (
          <g>
            {/* Kind warm eyes */}
            <path d="M46 64 Q52 58 58 64" stroke="#78350F" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M82 64 Q88 58 94 64" stroke="#78350F" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            {/* Encouraging gentle smile */}
            <path d="M58 74 Q70 84 82 74" stroke="#78350F" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </g>
        )}

        {mood === 'idle' && (
          <g>
            {/* Round sparkling eyes */}
            <circle cx="52" cy="64" r="5" fill="#78350F" />
            <circle cx="53.5" cy="62" r="2" fill="#FFFFFF" />
            <circle cx="88" cy="64" r="5" fill="#78350F" />
            <circle cx="89.5" cy="62" r="2" fill="#FFFFFF" />
            {/* Sweet happy smile */}
            <path d="M58 74 Q70 84 82 74" stroke="#78350F" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
}
