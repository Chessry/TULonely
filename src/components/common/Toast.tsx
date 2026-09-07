import React from 'react';
import { useApp } from '../../context/AppContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 sm:right-8 z-50 animate-bounce">
      <div className="bg-[#2D2D2D]/90 backdrop-blur-xl text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-2.5 max-w-sm">
        <span className="text-base">✨</span>
        <p className="text-xs font-semibold text-[#FDFBF7]">{toastMessage}</p>
      </div>
    </div>
  );
};
