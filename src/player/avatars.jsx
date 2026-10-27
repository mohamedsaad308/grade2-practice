import React from 'react';

/**
 * 8 Custom SVG cartoon animal avatars for Grade 2 children
 */
export const AVATAR_LIST = [
  { id: 'fox', label: 'Playful Fox', color: '#F97316' },
  { id: 'panda', label: 'Cuddly Panda', color: '#475569' },
  { id: 'lion', label: 'Brave Lion', color: '#EAB308' },
  { id: 'koala', label: 'Sweet Koala', color: '#94A3B8' },
  { id: 'bunny', label: 'Happy Bunny', color: '#EC4899' },
  { id: 'bear', label: 'Gentle Bear', color: '#B45309' },
  { id: 'kitten', label: 'Curious Cat', color: '#06B6D4' },
  { id: 'puppy', label: 'Friendly Dog', color: '#10B981' }
];

export function AvatarIcon({ avatarId = 'fox', size = 64, className = '' }) {
  const s = size;

  switch (avatarId) {
    case 'panda':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className} aria-label="Panda avatar">
          <circle cx="50" cy="50" r="46" fill="#F8FAFC" stroke="#334155" strokeWidth="3"/>
          <circle cx="24" cy="24" r="14" fill="#1E293B"/>
          <circle cx="76" cy="24" r="14" fill="#1E293B"/>
          <ellipse cx="34" cy="46" rx="10" ry="14" fill="#1E293B" transform="rotate(-15 34 46)"/>
          <circle cx="34" cy="44" r="4" fill="#FFFFFF"/>
          <ellipse cx="66" cy="46" rx="10" ry="14" fill="#1E293B" transform="rotate(15 66 46)"/>
          <circle cx="66" cy="44" r="4" fill="#FFFFFF"/>
          <ellipse cx="50" cy="62" rx="7" ry="5" fill="#1E293B"/>
          <path d="M44 68 Q50 74 56 68" stroke="#1E293B" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <circle cx="25" cy="60" r="5" fill="#F472B6" opacity="0.4"/>
          <circle cx="75" cy="60" r="5" fill="#F472B6" opacity="0.4"/>
        </svg>
      );

    case 'lion':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className} aria-label="Lion avatar">
          {/* Mane */}
          <circle cx="50" cy="50" r="46" fill="#EA580C"/>
          <circle cx="50" cy="50" r="42" fill="#F97316"/>
          {/* Face */}
          <circle cx="50" cy="52" r="32" fill="#FDE047"/>
          {/* Ears */}
          <circle cx="28" cy="30" r="8" fill="#FDE047" stroke="#EA580C" strokeWidth="2"/>
          <circle cx="72" cy="30" r="8" fill="#FDE047" stroke="#EA580C" strokeWidth="2"/>
          {/* Eyes */}
          <circle cx="38" cy="48" r="4.5" fill="#451A03"/>
          <circle cx="39.5" cy="46.5" r="1.5" fill="#FFFFFF"/>
          <circle cx="62" cy="48" r="4.5" fill="#451A03"/>
          <circle cx="63.5" cy="46.5" r="1.5" fill="#FFFFFF"/>
          {/* Nose & Smile */}
          <polygon points="50,56 44,63 56,63" fill="#B45309"/>
          <path d="M44 68 Q50 74 56 68" stroke="#78350F" strokeWidth="3" fill="none" strokeLinecap="round"/>
          {/* Cheeks */}
          <circle cx="30" cy="60" r="4" fill="#FB923C" opacity="0.5"/>
          <circle cx="70" cy="60" r="4" fill="#FB923C" opacity="0.5"/>
        </svg>
      );

    case 'koala':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className} aria-label="Koala avatar">
          {/* Big fluffy ears */}
          <circle cx="22" cy="32" r="16" fill="#94A3B8"/>
          <circle cx="22" cy="32" r="10" fill="#E2E8F0"/>
          <circle cx="78" cy="32" r="16" fill="#94A3B8"/>
          <circle cx="78" cy="32" r="10" fill="#E2E8F0"/>
          {/* Head */}
          <circle cx="50" cy="54" r="36" fill="#CBD5E1"/>
          {/* Eyes */}
          <circle cx="36" cy="48" r="4" fill="#1E293B"/>
          <circle cx="37" cy="46.5" r="1.5" fill="#FFFFFF"/>
          <circle cx="64" cy="48" r="4" fill="#1E293B"/>
          <circle cx="65" cy="46.5" r="1.5" fill="#FFFFFF"/>
          {/* Big dark oval nose */}
          <ellipse cx="50" cy="58" rx="8" ry="13" fill="#334155"/>
          {/* Smile */}
          <path d="M45 74 Q50 78 55 74" stroke="#334155" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <circle cx="28" cy="60" r="5" fill="#F472B6" opacity="0.4"/>
          <circle cx="72" cy="60" r="5" fill="#F472B6" opacity="0.4"/>
        </svg>
      );

    case 'bunny':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className} aria-label="Bunny avatar">
          {/* Long ears */}
          <ellipse cx="36" cy="24" rx="9" ry="22" fill="#FCE7F3" stroke="#F472B6" strokeWidth="2.5"/>
          <ellipse cx="36" cy="24" rx="5" ry="15" fill="#F472B6"/>
          <ellipse cx="64" cy="24" rx="9" ry="22" fill="#FCE7F3" stroke="#F472B6" strokeWidth="2.5"/>
          <ellipse cx="64" cy="24" rx="5" ry="15" fill="#F472B6"/>
          {/* Head */}
          <circle cx="50" cy="58" r="34" fill="#FFF1F2"/>
          {/* Eyes */}
          <circle cx="38" cy="54" r="4" fill="#881337"/>
          <circle cx="39.5" cy="52.5" r="1.5" fill="#FFFFFF"/>
          <circle cx="62" cy="54" r="4" fill="#881337"/>
          <circle cx="63.5" cy="52.5" r="1.5" fill="#FFFFFF"/>
          {/* Little pink nose */}
          <polygon points="50,62 46,67 54,67" fill="#FB7185"/>
          <path d="M44 70 Q50 75 56 70" stroke="#881337" strokeWidth="2" fill="none" strokeLinecap="round"/>
          {/* Cheeks */}
          <circle cx="28" cy="64" r="5" fill="#FDA4AF" opacity="0.6"/>
          <circle cx="72" cy="64" r="5" fill="#FDA4AF" opacity="0.6"/>
        </svg>
      );

    case 'bear':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className} aria-label="Bear avatar">
          {/* Ears */}
          <circle cx="24" cy="28" r="12" fill="#92400E"/>
          <circle cx="24" cy="28" r="6" fill="#FDE68A"/>
          <circle cx="76" cy="28" r="12" fill="#92400E"/>
          <circle cx="76" cy="28" r="6" fill="#FDE68A"/>
          {/* Head */}
          <circle cx="50" cy="54" r="36" fill="#B45309"/>
          {/* Snout */}
          <ellipse cx="50" cy="64" rx="16" ry="12" fill="#FDE68A"/>
          {/* Eyes */}
          <circle cx="36" cy="46" r="4" fill="#451A03"/>
          <circle cx="37" cy="45" r="1.5" fill="#FFFFFF"/>
          <circle cx="64" cy="46" r="4" fill="#451A03"/>
          <circle cx="65" cy="45" r="1.5" fill="#FFFFFF"/>
          {/* Nose */}
          <ellipse cx="50" cy="60" rx="6" ry="4" fill="#451A03"/>
          <path d="M44 68 Q50 73 56 68" stroke="#451A03" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        </svg>
      );

    case 'kitten':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className} aria-label="Kitten avatar">
          {/* Pointy ears */}
          <polygon points="20,40 32,15 44,35" fill="#38BDF8"/>
          <polygon points="24,37 32,20 40,34" fill="#BAE6FD"/>
          <polygon points="80,40 68,15 56,35" fill="#38BDF8"/>
          <polygon points="76,37 68,20 60,34" fill="#BAE6FD"/>
          {/* Head */}
          <circle cx="50" cy="55" r="35" fill="#E0F2FE"/>
          {/* Eyes */}
          <circle cx="37" cy="50" r="4.5" fill="#0C4A6E"/>
          <circle cx="38.5" cy="48.5" r="1.5" fill="#FFFFFF"/>
          <circle cx="63" cy="50" r="4.5" fill="#0C4A6E"/>
          <circle cx="64.5" cy="48.5" r="1.5" fill="#FFFFFF"/>
          {/* Whiskers */}
          <line x1="20" y1="58" x2="33" y2="59" stroke="#7DD3FC" strokeWidth="2"/>
          <line x1="18" y1="64" x2="33" y2="62" stroke="#7DD3FC" strokeWidth="2"/>
          <line x1="80" y1="58" x2="67" y2="59" stroke="#7DD3FC" strokeWidth="2"/>
          <line x1="82" y1="64" x2="67" y2="62" stroke="#7DD3FC" strokeWidth="2"/>
          {/* Nose & Smile */}
          <polygon points="50,58 47,62 53,62" fill="#F43F5E"/>
          <path d="M45 66 Q50 71 55 66" stroke="#0C4A6E" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );

    case 'puppy':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className} aria-label="Puppy avatar">
          {/* Floppy ears */}
          <ellipse cx="20" cy="45" rx="10" ry="18" fill="#15803D" transform="rotate(-15 20 45)"/>
          <ellipse cx="80" cy="45" rx="10" ry="18" fill="#15803D" transform="rotate(15 80 45)"/>
          {/* Head */}
          <circle cx="50" cy="52" r="34" fill="#86EFAC"/>
          {/* Eye patch */}
          <circle cx="38" cy="48" r="9" fill="#4ADE80"/>
          {/* Eyes */}
          <circle cx="38" cy="48" r="4" fill="#064E3B"/>
          <circle cx="39" cy="46.5" r="1.5" fill="#FFFFFF"/>
          <circle cx="62" cy="48" r="4" fill="#064E3B"/>
          <circle cx="63" cy="46.5" r="1.5" fill="#FFFFFF"/>
          {/* Snout */}
          <ellipse cx="50" cy="62" rx="12" ry="9" fill="#DCFCE7"/>
          <ellipse cx="50" cy="58" rx="6" ry="4" fill="#064E3B"/>
          {/* Tongue */}
          <path d="M48 68 Q50 76 53 73" stroke="#F43F5E" strokeWidth="3" fill="#FB7185" strokeLinecap="round"/>
        </svg>
      );

    case 'fox':
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 100 100" className={className} aria-label="Fox avatar">
          {/* Pointed ears */}
          <polygon points="18,36 32,8 44,30" fill="#EA580C"/>
          <polygon points="23,32 32,15 39,28" fill="#FFFFFF"/>
          <polygon points="82,36 68,8 56,30" fill="#EA580C"/>
          <polygon points="77,32 68,15 61,28" fill="#FFFFFF"/>
          {/* Head */}
          <circle cx="50" cy="54" r="35" fill="#F97316"/>
          {/* White cheeks */}
          <path d="M22 62 Q35 78 50 64 Q65 78 78 62 Q72 82 50 84 Q28 82 22 62 Z" fill="#FFFFFF"/>
          {/* Eyes */}
          <circle cx="36" cy="48" r="4.5" fill="#431407"/>
          <circle cx="37.5" cy="46.5" r="1.5" fill="#FFFFFF"/>
          <circle cx="64" cy="48" r="4.5" fill="#431407"/>
          <circle cx="65.5" cy="46.5" r="1.5" fill="#FFFFFF"/>
          {/* Nose */}
          <ellipse cx="50" cy="65" rx="5" ry="4" fill="#431407"/>
          {/* Smile */}
          <path d="M45 71 Q50 75 55 71" stroke="#431407" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
  }
}
