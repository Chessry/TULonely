import React from 'react';

interface ActivityCardSkeletonProps {
  count?: number;
}

export const ActivityCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white/45 backdrop-blur-lg rounded-3xl overflow-hidden border border-white/70 shadow-lg flex flex-col justify-between animate-pulse">
      {/* Cover Image Placeholder */}
      <div className="relative h-44 sm:h-48 w-full bg-stone-200/90 flex flex-col justify-between p-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-24 bg-white/60 rounded-full" />
          <div className="w-8 h-8 bg-white/60 rounded-full" />
        </div>

        {/* Bottom Banner Title */}
        <div className="space-y-2">
          <div className="h-3 bg-white/50 rounded w-1/3" />
          <div className="h-5 bg-white/70 rounded w-4/5" />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Schedule Box */}
        <div className="space-y-2.5 bg-white/50 backdrop-blur-sm p-3.5 rounded-2xl border border-white/70">
          <div className="h-3.5 bg-stone-200/90 rounded w-2/3" />
          <div className="h-3.5 bg-stone-200/80 rounded w-1/2" />
          <div className="h-3.5 bg-stone-200/80 rounded w-4/5" />
        </div>

        {/* Description lines */}
        <div className="space-y-1.5">
          <div className="h-3 bg-stone-200/80 rounded w-full" />
          <div className="h-3 bg-stone-200/60 rounded w-5/6" />
        </div>

        {/* Tags placeholder */}
        <div className="flex items-center gap-1.5 pt-1">
          <div className="h-5 w-16 bg-stone-200/70 rounded-full" />
          <div className="h-5 w-14 bg-stone-200/70 rounded-full" />
          <div className="h-5 w-16 bg-stone-200/70 rounded-full" />
        </div>

        {/* Buttons footer */}
        <div className="pt-3 border-t border-white/60 flex items-center gap-2">
          <div className="h-9 flex-1 bg-stone-200/90 rounded-xl" />
          <div className="h-9 flex-1 bg-stone-300/80 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const ActivityCardSkeletonList: React.FC<ActivityCardSkeletonProps> = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ActivityCardSkeleton key={`activity-skeleton-${index}`} />
      ))}
    </>
  );
};
