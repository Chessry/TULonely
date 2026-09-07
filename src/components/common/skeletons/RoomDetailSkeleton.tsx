import React from 'react';

export const RoomDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-pulse">
      {/* Back button & Actions Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="h-9 w-28 bg-white/60 rounded-full border border-white/80" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 bg-white/60 rounded-full border border-white/80" />
          <div className="h-9 w-24 bg-white/60 rounded-full border border-white/80" />
          <div className="h-9 w-20 bg-white/60 rounded-full border border-white/80" />
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Room Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-6 sm:p-7 border border-white/80 shadow-lg space-y-6">
            {/* Top row: Category & Status */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-24 bg-stone-200/90 rounded-full" />
                <div className="h-6 w-32 bg-stone-200/70 rounded-full hidden sm:block" />
              </div>
              <div className="h-6 w-24 bg-stone-200/90 rounded-full" />
            </div>

            {/* Room Title */}
            <div className="space-y-2.5">
              <div className="h-7 bg-stone-300/80 rounded-xl w-10/12" />
              <div className="h-7 bg-stone-300/60 rounded-xl w-2/3" />
              <div className="h-4 bg-stone-200/70 rounded w-32 pt-1" />
            </div>

            {/* Host info box */}
            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/80 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-stone-300/90 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-stone-300/80 rounded w-28" />
                  <div className="h-4 bg-stone-200/80 rounded w-16" />
                </div>
                <div className="h-3 bg-stone-200/80 rounded w-40" />
                <div className="h-3 bg-stone-200/60 rounded w-52" />
              </div>
            </div>

            {/* Event Info Grid (Date, Time, Location, Campus, Deadline) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white/60 backdrop-blur-sm p-3.5 rounded-2xl border border-white/80 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-stone-200/90 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-2.5 bg-stone-200/70 rounded w-16" />
                    <div className="h-3.5 bg-stone-300/80 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>

            {/* Description Block */}
            <div className="space-y-2 pt-2">
              <div className="h-4 bg-stone-300/80 rounded w-24 mb-2" />
              <div className="h-3.5 bg-stone-200/80 rounded w-full" />
              <div className="h-3.5 bg-stone-200/70 rounded w-11/12" />
              <div className="h-3.5 bg-stone-200/60 rounded w-4/5" />
            </div>

            {/* Tags placeholder */}
            <div className="flex items-center gap-2 pt-1">
              <div className="h-6 w-16 bg-stone-200/80 rounded-full" />
              <div className="h-6 w-20 bg-stone-200/80 rounded-full" />
              <div className="h-6 w-14 bg-stone-200/80 rounded-full" />
            </div>

            {/* Participants Section */}
            <div className="pt-4 border-t border-white/70 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-5 bg-stone-300/80 rounded w-36" />
                <div className="h-4 bg-stone-200/80 rounded w-24" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 border border-white/80"
                  >
                    <div className="w-10 h-10 rounded-full bg-stone-300/80 shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 bg-stone-300/80 rounded w-24" />
                      <div className="h-2.5 bg-stone-200/70 rounded w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Join Action button placeholder */}
            <div className="pt-4">
              <div className="h-12 w-full bg-stone-300/90 rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Right 1 Column: Group Chat Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white/50 backdrop-blur-lg rounded-3xl border border-white/80 shadow-lg h-[520px] flex flex-col justify-between p-4 sm:p-5">
            {/* Chat header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-stone-200/90" />
                <div className="space-y-1">
                  <div className="h-3.5 bg-stone-300/80 rounded w-20" />
                  <div className="h-2.5 bg-stone-200/70 rounded w-28" />
                </div>
              </div>
            </div>

            {/* Chat message bubbles */}
            <div className="flex-1 py-4 space-y-3.5 overflow-hidden">
              <div className="flex items-start gap-2 max-w-[80%]">
                <div className="w-7 h-7 rounded-full bg-stone-300/80 shrink-0" />
                <div className="h-12 w-48 bg-stone-200/90 rounded-2xl rounded-tl-none p-3" />
              </div>
              <div className="flex items-start justify-end">
                <div className="h-10 w-40 bg-[#8B1D1D]/20 rounded-2xl rounded-tr-none p-3" />
              </div>
              <div className="flex items-start gap-2 max-w-[80%]">
                <div className="w-7 h-7 rounded-full bg-stone-300/80 shrink-0" />
                <div className="h-14 w-52 bg-stone-200/90 rounded-2xl rounded-tl-none p-3" />
              </div>
            </div>

            {/* Chat input box */}
            <div className="pt-3 border-t border-white/70 flex items-center gap-2">
              <div className="h-10 flex-1 bg-white/70 rounded-full border border-white/90" />
              <div className="w-10 h-10 rounded-full bg-stone-300/90 shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
