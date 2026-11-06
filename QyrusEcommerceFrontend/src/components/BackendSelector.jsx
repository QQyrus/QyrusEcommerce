// src/components/BackendSelector.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BACKENDS, getSelectedBackend, setSelectedBackend } from '../services/api';
import Logo from './Logo';

const BackendSelector = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(getSelectedBackend() || '');

  const handleChoose = (key) => {
    setSelectedBackend(key);
    setSelected(key);
    navigate('/products');
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16 overflow-hidden">
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-fuchsia-200/50 blur-3xl" />
      <div className="relative flex flex-col items-center">
        <Logo size="lg" className="mb-6" />
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">Choose a backend</h1>
        <p className="text-gray-500 mb-8 text-center max-w-md text-sm">
          Qart ships with three interchangeable backends. Pick which one the UI
          should send its API calls to.
        </p>
        <div className="grid gap-4 sm:grid-cols-3 w-full max-w-3xl">
          {Object.entries(BACKENDS).map(([key, backend]) => (
            <button
              key={key}
              onClick={() => handleChoose(key)}
              className={`rounded-2xl p-6 text-left bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all border ${
                selected === key ? 'border-violet-600 ring-2 ring-violet-100' : 'border-gray-100 hover:border-violet-300'
              }`}
            >
              <div className="text-base font-semibold text-gray-900">{backend.label}</div>
              <div className="text-xs text-gray-500 mt-1.5 break-all">{backend.url}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BackendSelector;
