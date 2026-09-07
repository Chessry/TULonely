import React from 'react';

interface RoomCardSkeletonProps {
  count?: number;
}

export const RoomCardSkeleton: React.FC = () => {
  return (
    <div className="relative bg-white/45 backdrop-blur-lg rounded-3xl p-5 border border-white/70 shadow-md flex flex-col justify-between animate-pulse">
      {/* Top Bar: Category Pill & Status Badge */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-20 bg-stone-200/80 rounded-full" />
            <div className="h-5 w-24 bg-stone-200/60 rounded-full hidden sm:block" />
          </div>

          <div className="flex items-center gap-1.5">
            <div className="h-5 w-16 bg-stone-200/80 rounded-full" />
            <div className="w-7 h-7 bg-stone-200/80 rounded-full" />
          </div>
        </div>

        {/* Title Lines */}
        <div className="space-y-2 mb-3">
          <div className="h-5 bg-stone-300/80 rounded-lg w-11/12" />
          <div className="h-5 bg-stone-300/60 rounded-lg w-3/4" />
        </div>

        {/* Description snippet lines */}
        <div className="space-y-1.5 mb-4">
          <div className="h-3.5 bg-stone-200/80 rounded w-full" />
          <div className="h-3.5 bg-stone-200/60 rounded w-5/6" />
        </div>

        {/* Host info skeleton */}
        <div className="flex items-center gap-2.5 pt-3 border-t border-white/60">
          <div className="w-8 h-8 rounded-full bg-stone-300/80 shrink-0" />
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="h-3.5 bg-stone-300/70 rounded w-24" />
            <div className="h-2.5 bg-stone-200/70 rounded w-32" />
          </div>
        </div>
      </div>

      {/* Footer info: Location, Time, Members & Button */}
      <div className="mt-4 pt-3 border-t border-white/60 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="h-3 bg-stone-200/80 rounded w-28" />
          <div className="h-3 bg-stone-200/80 rounded w-20" />
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          {/* Participant avatars placeholder */}
          <div className="flex items-center -space-x-2">
            <div className="w-6 h-6 rounded-full bg-stone-300/80 border-2 border-white" />
            <div className="w-6 h-6 rounded-full bg-stone-300/70 border-2 border-white" />
            <div className="w-6 h-6 rounded-full bg-stone-300/60 border-2 border-white" />
          </div>

          {/* Action button placeholder */}
          <div className="h-8 w-20 bg-stone-300/80 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const RoomCardSkeletonList: React.FC<RoomCardSkeletonProps> = ({ count = 6 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <RoomCardSkeleton key={`room-skeleton-${index}`} />
      ))}
    </>
  );
};
