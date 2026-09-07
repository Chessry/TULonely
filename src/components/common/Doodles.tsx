import React from 'react';

export const SparkleDoodle: React.FC<{ className?: string }> = ({ className = 'w-5 h-5 text-amber-400' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </svg>
);

export const StarDoodle: React.FC<{ className?: string }> = ({ className = 'w-5 h-5 text-rose-400' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 1.5l3.09 6.26L22 8.77l-5 4.87 1.18 6.88L12 17.27l-6.18 3.25L7 13.64 2 8.77l6.91-1.01L12 1.5z" />
  </svg>
);

export const HeartDoodle: React.FC<{ className?: string }> = ({ className = 'w-5 h-5 text-rose-500' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

export const FunSticker: React.FC<{
  text: string;
  bg?: string;
  textColor?: string;
  rotate?: string;
  icon?: string;
}> = ({
  text,
  bg = 'bg-[#8B1D2C]',
  textColor = 'text-white',
  rotate = '-rotate-3',
  icon = '✨',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full shadow-sm select-none transition-transform hover:scale-105 whitespace-nowrap shrink-0 ${bg} ${textColor} ${rotate}`}
    >
      {icon && <span>{icon}</span>}
      <span>{text}</span>
    </span>
  );
};
