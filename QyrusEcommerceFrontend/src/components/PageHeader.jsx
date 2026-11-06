import React from 'react';

// Shared decorative gradient header used across the secondary (non-catalog) pages
// so the whole app feels like one cohesive product instead of a patchwork of screens.
const PageHeader = ({ icon, eyebrow, title, subtitle, children }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600">
      <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-10 left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="container relative mx-auto px-4 md:px-6 py-10 md:py-12">
        <div className="flex items-center gap-4">
          {icon && (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur-sm">
              {icon}
            </span>
          )}
          <div>
            {eyebrow && (
              <p className="text-violet-200 text-xs font-semibold uppercase tracking-wide">{eyebrow}</p>
            )}
            <h1 className="mt-0.5 text-2xl md:text-3xl font-extrabold text-white tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1 text-violet-100 text-sm max-w-lg">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default PageHeader;
