import React from 'react';
import { CategoryType } from '../../types';
import { CATEGORY_METADATA } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  categoryKey: CategoryType;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ categoryKey }) => {
  const { navigateToCategory, rooms, universityActivities } = useApp();
  const meta = CATEGORY_METADATA[categoryKey];

  // Count active items
  let countLabel = '';
  if (categoryKey === 'university') {
    const actCount = universityActivities.length;
    const roomCount = rooms.filter((r) => r.category === 'university' && r.status !== 'expired').length;
    countLabel = `${actCount} กิจกรรม • ${roomCount} ห้อง`;
  } else {
    const roomCount = rooms.filter((r) => r.category === categoryKey && r.status !== 'expired').length;
    countLabel = `${roomCount} ห้อง`;
  }

  return (
    <div
      onClick={() => navigateToCategory(categoryKey)}
      className="group bg-white/40 hover:bg-white/65 backdrop-blur-lg p-6 rounded-3xl border border-white/70 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer text-center flex flex-col items-center justify-between min-h-[240px] relative overflow-hidden"
    >
      {/* Subtle colored glow corner blob */}
      <div
        className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-15 group-hover:scale-150 transition-transform duration-500 pointer-events-none blur-xl"
        style={{ backgroundColor: meta.color }}
      />

      {/* Top Section */}
      <div className="flex flex-col items-center w-full">
        {/* Category Icon */}
        <div className="text-4xl mb-3 transform group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
          {meta.icon}
        </div>

        {/* Category Name */}
        <h3 className="font-extrabold text-lg sm:text-xl text-[#8B1D1D] group-hover:text-[#6D0E1C] transition-colors font-kanit">
          {meta.name}
        </h3>

        {/* Tagline */}
        <p className="text-xs text-[#555] mt-1.5 leading-snug line-clamp-2 px-1">
          {meta.tagline}
        </p>

        {/* Count Badge */}
        <span className="mt-3 inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/60 backdrop-blur-xs border border-white/80 text-[#8B1D1D] shadow-2xs">
          {countLabel}
        </span>
      </div>

      {/* Arrow Pill Action Button */}
      <div className="mt-4 w-9 h-9 rounded-full bg-[#8B1D1D]/10 border border-[#8B1D1D]/20 flex items-center justify-center text-[#8B1D1D] group-hover:bg-[#8B1D1D] group-hover:text-white group-hover:border-transparent transition-all shadow-2xs">
        <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );
};
