import React from 'react';

const SIZES = {
  sm: { icon: 'h-7 w-7', text: 'text-xl' },
  md: { icon: 'h-8 w-8', text: 'text-2xl' },
  lg: { icon: 'h-10 w-10', text: 'text-3xl' },
};

// Shared brand mark: a gradient shopping-bag glyph + a gradient wordmark.
// Keeping this in one place means every page (header, auth, backend picker) stays in sync.
const Logo = ({ size = 'md', className = '' }) => {
  const s = SIZES[size] || SIZES.md;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 24 24" className={s.icon} aria-hidden="true">
        <defs>
          <linearGradient id="qart-logo-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
        <path
          d="M6.2 8.3h11.6l-.98 10.65A2.2 2.2 0 0 1 14.63 21H9.37a2.2 2.2 0 0 1-2.19-2.05L6.2 8.3Z"
          fill="url(#qart-logo-gradient)"
        />
        <path
          d="M9 8.3V6.9a3 3 0 1 1 6 0v1.4"
          fill="none"
          stroke="url(#qart-logo-gradient)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M9.4 12c0 1.49 1.17 2.7 2.6 2.7s2.6-1.21 2.6-2.7"
          fill="none"
          stroke="white"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <span
        className={`${s.text} font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent`}
      >
        Qart
      </span>
    </span>
  );
};

export default Logo;
