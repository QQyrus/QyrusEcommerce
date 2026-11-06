import React from 'react';

const EmptyState = ({ icon, title, subtitle, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center text-center py-20 px-4">
    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-50 text-4xl mb-5">
      {icon}
    </span>
    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    {subtitle && <p className="mt-1.5 text-sm text-gray-500 max-w-sm">{subtitle}</p>}
    {actionLabel && (
      <button
        onClick={onAction}
        className="mt-6 rounded-full bg-violet-600 text-white font-semibold px-6 py-2.5 hover:bg-violet-700 transition-colors shadow-sm"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
