import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryCard } from '../cards/CategoryCard';
import { RoomCard } from '../cards/RoomCard';
import { ActivityCard } from '../cards/ActivityCard';
import { RoomCardSkeletonList, ErrorState } from '../common/skeletons';
import { Search, Sparkles, Flame, Plus, ArrowRight } from 'lucide-react';
import { CategoryType } from '../../types';

export const HomeView: React.FC = () => {
  const {
    setActivePage,
    rooms,
    isLoadingRooms,
    roomsError,
    refreshRooms,
    universityActivities,
    setSearchQuery,
    setSelectedTagFilter,
    openCreateRoomFlow,
    navigateToRoom,
  } = useApp();

  const [heroSearch, setHeroSearch] = useState('');

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      setSearchQuery(heroSearch.trim());
      setActivePage('find-friends');
    }
  };

  const handleTagClick = (tag: string) => {
    setSelectedTagFilter(tag);
    setActivePage('find-friends');
  };

  // Urgent rooms (hoursLeft <= 12 and status is open or almost_full)
  const urgentRooms = rooms
    .filter((r) => r.status === 'open' || r.status === 'almost_full')
    .slice(0, 3);

  // Trending room for the special frosted banner
  const trendingRoom = rooms[0];

  // Featured University Activities
  const featuredActivities = universityActivities.slice(0, 2);

  const popularQuickTags = [
    '#Freshy',
    '#สุกี้ตี๋น้อย',
    '#Calculus',
    '#แบดมินตัน',
    '#บอร์ดเกม',
    '#อาหารตามสั่ง',
    '#หอสมุดป๋วย',
    '#คอนเสิร์ต'
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO SECTION: Frosted Glass Atmosphere with Playful Doodles */}
      <section className="relative overflow-hidden pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        {/* Floating Playful Stickers and Doodles from Frosted Glass Theme */}
        <div className="absolute top-8 left-12 animate-bounce text-4xl transform -rotate-12 hidden sm:block pointer-events-none select-none">
          ⭐
        </div>
        <div className="absolute top-12 right-20 text-3xl opacity-75 hidden sm:block pointer-events-none select-none">
          ✨
        </div>
        <div className="absolute bottom-6 left-16 text-2xl transform rotate-45 hidden md:block pointer-events-none select-none">
          💗
        </div>
        <div className="absolute top-1/2 right-10 text-5xl hidden md:block pointer-events-none select-none">
          👀
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          {/* Slogan Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/55 backdrop-blur-md border border-white/70 shadow-xs text-xs font-bold text-[#8B1D1D]">
            <Sparkles className="w-3.5 h-3.5 text-[#F27D26]" />
            <span>ศูนย์รวมกิจกรรม & ชุมชนหาเพื่อน มหาวิทยาลัยธรรมศาสตร์</span>
          </div>

          {/* Main Brand Title with "Wanna hang out?" pill */}
          <div className="relative inline-block my-2">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-[#8B1D1D] font-kanit tracking-tight leading-none drop-shadow-xs">
              TU<span className="text-[#F27D26]">lonely</span>
            </h1>
            <div className="absolute -top-5 -right-10 sm:-right-14 bg-yellow-300 text-[#2D2D2D] text-xs sm:text-sm font-bold px-3 py-1 rounded-full border-2 border-[#2D2D2D] transform rotate-12 shadow-sm whitespace-nowrap">
              Wanna hang out? 👀
            </div>
          </div>

          {/* Slogans */}
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold text-[#333] font-kanit">
              “ไม่ต้องเหงาอีกต่อไป 👀”
            </p>
            <p className="text-base sm:text-lg font-medium text-[#666]">
              หาเพื่อน หาอะไรทำ แล้วไปด้วยกัน 🌟 ที่ TU เราไม่จำเป็นต้องทำอะไรคนเดียว
            </p>
          </div>

          {/* Hero Search Bar - Frosted Glass */}
          <form onSubmit={handleHeroSearchSubmit} className="max-w-xl mx-auto pt-3">
            <div className="relative flex items-center bg-white/60 hover:bg-white/80 backdrop-blur-lg rounded-full p-1.5 border border-white/80 shadow-lg focus-within:border-[#8B1D1D] focus-within:bg-white/90 transition-all">
              <Search className="w-5 h-5 text-[#8B1D1D] ml-3.5 shrink-0" />
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="ค้นหากิจกรรม, ชวนกินชาบู, ติวแคล, เตะบอล, บอร์ดเกม..."
                className="w-full bg-transparent px-3.5 py-2 text-xs sm:text-sm text-[#2D2D2D] placeholder:text-[#888] focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
              >
                ค้นหา
              </button>
            </div>
          </form>

          {/* Popular Tag Pills with Frosted Backdrop */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2">
            <span className="text-xs text-[#666] font-medium mr-1">แท็กยอดฮิต:</span>
            {popularQuickTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="text-[11px] px-3 py-1 rounded-full bg-white/50 hover:bg-[#8B1D1D] hover:text-white text-[#444] border border-white/70 backdrop-blur-xs transition-colors cursor-pointer shadow-2xs"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. TRENDING NOW FROSTED GLASS BAR */}
      {trendingRoom && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            onClick={() => navigateToRoom(trendingRoom.id)}
            className="w-full bg-white/60 hover:bg-white/80 backdrop-blur-md rounded-3xl border border-white/80 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B1D1D] bg-[#8B1D1D]/10 px-3 py-1 rounded-full whitespace-nowrap border border-[#8B1D1D]/20">
                🔥 Trending Now
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#2D2D2D] truncate">
                "{trendingRoom.title}" โดย {trendingRoom.creator.name} — 👥 {trendingRoom.participants.length}/{trendingRoom.maxParticipants} Join แล้ว
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openCreateRoomFlow();
              }}
              className="bg-[#8B1D1D] text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-[#6D0E1C] shadow-md transition-transform active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
            >
              สร้างห้องใหม่ +
            </button>
          </div>
        </section>
      )}

      {/* 3. MAIN CATEGORY: "วันนี้อยากทำอะไร?" 5 Frosted Glass Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D2D2D] font-kanit flex items-center gap-2">
              <span>วันนี้อยากทำอะไร?</span>
              <span className="text-2xl">✨</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#666] mt-0.5">
              เลือกหมวดหมู่ที่สนใจ แล้วไปเจอเพื่อนใหม่กันเลย
            </p>
          </div>

          <button
            onClick={() => openCreateRoomFlow()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white text-xs font-bold shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างห้องหาเพื่อนใหม่</span>
          </button>
        </div>

        {/* 5 Frosted Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {(['university', 'food', 'sports', 'study', 'entertainment'] as CategoryType[]).map(
            (catKey) => (
              <CategoryCard key={catKey} categoryKey={catKey} />
            )
          )}
        </div>
      </section>

      {/* 4. UNIVERSITY ACTIVITIES PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B1D1D] bg-white/60 backdrop-blur-xs px-3 py-1 rounded-full border border-white/80 mb-1">
              <span>🏛️</span>
              <span>กิจกรรมอย่างเป็นทางการ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D2D2D] font-kanit">
              กิจกรรมมหาวิทยาลัยธรรมศาสตร์
            </h2>
            <p className="text-xs sm:text-sm text-[#666]">
              กิจกรรมที่ระบบจัดเตรียมไว้ เลือกกิจกรรมแล้วสร้างห้องหรือจอยห้องกับเพื่อนๆ ได้เลย
            </p>
          </div>

          <button
            onClick={() => setActivePage('activities')}
            className="text-xs font-bold text-[#8B1D1D] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>ดูกิจกรรม มธ. ทั้งหมด</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Featured Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredActivities.map((act) => (
            <ActivityCard key={act.id} activity={act} />
          ))}
        </div>
      </section>

      {/* 5. URGENT / ACTIVE ROOMS FEED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/70 backdrop-blur-xs border border-white/80 text-amber-600 flex items-center justify-center font-bold shadow-2xs">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#2D2D2D] font-kanit">
                ห้องที่กำลังหาเพื่อนอยู่ตอนนี้ 👀
              </h2>
              <p className="text-xs text-[#666]">
                รีบจอยก่อนสมาชิกเต็ม หรือหมดเวลารับสมัคร
              </p>
            </div>
          </div>

          <button
            onClick={() => setActivePage('find-friends')}
            className="text-xs font-bold text-[#8B1D1D] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>ดูห้องหาเพื่อนทั้งหมด ({rooms.length} ห้อง)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Rooms Grid / Skeleton / Error */}
        {roomsError && rooms.length === 0 ? (
          <ErrorState
            title="เกิดข้อผิดพลาดในการโหลดห้องหาเพื่อน"
            message={roomsError}
            onRetry={refreshRooms}
            isRetrying={isLoadingRooms}
          />
        ) : isLoadingRooms ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <RoomCardSkeletonList count={3} />
          </div>
        ) : urgentRooms.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-8 text-center border border-white/70 shadow-sm space-y-2">
            <p className="text-sm font-bold text-[#444]">ยังไม่มีห้องที่กำลังเปิดรับสมัคร</p>
            <p className="text-xs text-[#777]">กดสร้างห้องเพื่อเริ่มชวนเพื่อนคนแรกได้เลย</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {urgentRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>

      {/* 6. COMMUNITY BANNER - Frosted Accent Glass */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#8B1D1D]/90 to-[#6D0E1C]/90 backdrop-blur-xl text-white p-8 sm:p-10 overflow-hidden shadow-2xl border border-white/30">
          <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10 text-9xl select-none font-kanit font-black">
            TU
          </div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-bold border border-white/30">
              ✨ Thammasat University Social Space
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-kanit leading-tight">
              อยากทำกิจกรรมอะไร แต่ยังไม่มีเพื่อนไปด้วย?
            </h3>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              เพียงแค่กดสร้างห้อง ระบุเวลา สถานที่ และจำนวนเพื่อนที่ต้องการ ระบบจะช่วยกระจายข่าวให้นักศึกษา มธ. คนอื่นเข้ามาร่วมจอยได้อย่างปลอดภัย
            </p>
            <div className="pt-2 flex items-center gap-3 flex-wrap">
              <button
                onClick={() => openCreateRoomFlow()}
                className="px-6 py-3 bg-[#F27D26] hover:bg-[#D96B1E] text-white font-bold text-xs rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                สร้างห้องหาเพื่อนตอนนี้เลย 🚀
              </button>
              <button
                onClick={() => setActivePage('find-friends')}
                className="px-5 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-semibold text-xs rounded-full border border-white/30 transition-colors cursor-pointer"
              >
                ค้นหาห้องทั้งหมด
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
