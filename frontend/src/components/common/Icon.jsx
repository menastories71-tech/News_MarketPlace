import React from 'react';

/**
 * Minimal inline SVG Icon component.
 * - Props: name (string), size (one of 'sm','lg','xl','2xl' or number), className, style
 * - Returns a mapped inline SVG for known names, otherwise a neutral placeholder.
 *
 * This avoids runtime "Icon not found" warnings and keeps the API compatible.
 */

const SIZE_MAP = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32
};

export default function Icon({ name = '', size = 'md', className = '', style = {}, ...rest }) {
  const s = typeof size === 'number' ? size : (SIZE_MAP[size] || SIZE_MAP.md);
  const common = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

  // Simple mapping of icon names used in the admin UI -> inline SVG paths
  switch (name) {
    case 'shield-check':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M12 2l7 3v5c0 5-3.5 9.5-7 11-3.5-1.5-7-6-7-11V5l7-3z" />
          <path d="M9 12l2 2 4-4" strokeWidth="2" />
        </svg>
      );

    case 'arrow-right-on-rectangle':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <rect x="3" y="5" width="14" height="14" rx="2" />
          <path d="M10 12h7" />
          <path d="M14 8l4 4-4 4" />
        </svg>
      );

    case 'document-text':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M8 13h8M8 17h8M8 9h4" />
        </svg>
      );

    case 'arrow-down-tray':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M12 3v12" />
          <path d="M8 11l4 4 4-4" />
          <path d="M21 21H3" />
        </svg>
      );

    case 'cog-6-tooth':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09c.7 0 1.27-.4 1.51-1a1.65 1.65 0 0 0-.33-1.82L4.3 6.3A2 2 0 0 1 7.12 3.47l.06.06c.5.5 1.2.66 1.82.33.44-.22.93-.33 1.42-.33H12a2 2 0 0 1 4 0h.09c.49 0 .98.11 1.42.33.62.33 1.32.17 1.82-.33l.06-.06A2 2 0 0 1 20.7 6.3l-.06.06c-.5.5-.66 1.2-.33 1.82.22.44.33.93.33 1.42V12a2 2 0 0 1 0 4h-.09c-.7 0-1.27.4-1.51 1z" />
        </svg>
      );

    case 'toggle-left':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <rect x="2" y="7" width="20" height="10" rx="5" />
          <circle cx="8" cy="12" r="3" />
        </svg>
      );

    case 'list-bullet':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M8 6h13M8 12h13M8 18h13" />
          <path d="M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      );

    case 'boxes':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="M7 8.5l5 3 5-3" />
        </svg>
      );

    case 'tag':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M20.59 13.41L13 6 4 6v8l9 8 9-8v-0z" />
          <circle cx="7.5" cy="7.5" r="1.5" />
        </svg>
      );

    case 'video':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <rect x="2" y="5" width="15" height="14" rx="2" />
          <path d="M23 7l-6 4v2l6 4V7z" />
        </svg>
      );

    case 'users':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M9 21v-2a4 4 0 0 1 3-3.87" />
          <path d="M12 7a4 4 0 1 0 0 8" />
        </svg>
      );

    case 'home':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M3 9l9-7 9 7" />
          <path d="M9 22V12h6v10" />
        </svg>
      );

    case 'key':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M3 11a5 5 0 1 0 7 7L21 7l-4-4L10 10" />
        </svg>
      );

    case 'pencil-square':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M16 3l5 5" />
          <path d="M17 6l-10 10H3v-4L13 2z" />
        </svg>
      );

    case 'chart-bar':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M3 3v18h18" />
          <path d="M7 12v6" />
          <path d="M12 8v10" />
          <path d="M17 4v14" />
        </svg>
      );

    case 'check-circle':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );

    case 'x-circle':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <circle cx="12" cy="12" r="9" />
          <path d="M15 9l-6 6M9 9l6 6" />
        </svg>
      );

    default:
      // neutral placeholder: square with first letter (keeps layout stable)
      const label = (name || '').split('-').map(p => p[0]).join('').slice(0, 2).toUpperCase() || '?';
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <rect x="2" y="2" width="20" height="20" rx="3" fill="#e5e7eb" stroke="none" />
          <text x="12" y="15" fontSize={s / 2.5} textAnchor="middle" fill="#374151" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700">
            {label}
          </text>
        </svg>
      );
  }
}