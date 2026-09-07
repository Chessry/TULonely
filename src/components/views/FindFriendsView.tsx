import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RoomCard } from '../cards/RoomCard';
import { RoomCardSkeletonList, ErrorState } from '../common/skeletons';
import { CategoryType } from '../../types';
import { CATEGORY_METADATA, TU_CAMPUSES } from '../../data/mockData';
import { Search, Plus, Users, RefreshCw, X } from 'lucide-react';

export const FindFriendsView: React.FC = () => {
  const {
    rooms,
    isLoadingRooms,
    roomsError,
    refreshRooms,
    searchQuery,
    setSearchQuery,
    selectedTagFilter,
    setSelectedTagFilter,
    openCreateRoomFlow,
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTagFilter(null);
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedTagFilter ||
    categoryFilter !== 'all' ||
    statusFilter !== 'all';

  // Multi-filtering logic
  const filteredRooms = rooms.filter((room) => {
    // Category filter
    if (categoryFilter !== 'all' && room.category !== categoryFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && room.status !== statusFilter) {
      return false;
    }

    // Tag filter
    if (selectedTagFilter && (!room.tags || !room.tags.includes(selectedTagFilter))) {
      return false;
    }

    // Search query across room title, description, tags, location, activity name, host name, faculty
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = room.title.toLowerCase().includes(q);
      const matchDesc = room.description.toLowerCase().includes(q);
      const matchLocation = room.location.toLowerCase().includes(q);
      const matchActivity = room.universityActivityTitle?.toLowerCase().includes(q);
      const matchCreator = room.creator.name.toLowerCase().includes(q);
      const matchFaculty = room.creator.faculty.toLowerCase().includes(q);
      const matchTags = room.tags && room.tags.some((t) => t.toLowerCase().includes(q));

      if (
        !matchTitle &&
        !matchDesc &&
        !matchLocation &&
        !matchActivity &&
        !matchCreator &&
        !matchFaculty &&
        !matchTags
      ) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-16">
      {/* Header Banner - Frosted Glass */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/50 backdrop-blur-lg rounded-3xl p-6 sm:p-7 border border-white/70 shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B1D1D]/10 text-xs font-bold text-[#8B1D1D] mb-1.5 border border-[#8B1D1D]/20">
            <Users className="w-3.5 h-3.5" />
            <span>Community Find Friends</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2D2D] font-kanit">
            หาเพื่อนทั้งหมด
          </h1>
          <p className="text-xs text-[#666]">
            ค้นหาห้องหาเพื่อนจากทุกหมวดหมู่ มธ. หรือสร้างห้องใหม่เพื่อชวนเพื่อนมาจอย
          </p>
        </div>

        <button
          onClick={() => openCreateRoomFlow()}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white text-xs font-bold shadow-md transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างห้องหาเพื่อน</span>
        </button>
      </div>

      {/* Comprehensive Filter Panel - Frosted Glass */}
      <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-5 border border-white/70 shadow-md space-y-4">
        {/* Search Bar + Clear button */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#8B1D1D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อห้อง, กิจกรรม, ร้านอาหาร, คณะ, หรือ #แท็ก..."
              className="w-full bg-white/60 backdrop-blur-sm border border-white/80 rounded-full pl-10 pr-4 py-2.5 text-xs text-[#2D2D2D] placeholder:text-[#888] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#888] hover:text-[#2D2D2D]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50/80 bg-white/50 rounded-full border border-rose-200 transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ล้างตัวกรองทั้งหมด</span>
            </button>
          )}
        </div>

        {/* Categories Tab Pill */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              categoryFilter === 'all'
                ? 'bg-[#8B1D1D] text-white shadow-xs'
                : 'bg-white/50 text-[#555] hover:bg-white/80 border border-white/70'
            }`}
          >
            ทุกหมวดหมู่ ({rooms.length})
          </button>
          {(['food', 'sports', 'study', 'entertainment'] as CategoryType[]).map(
            (cat) => {
              const meta = CATEGORY_METADATA[cat];
              const count = rooms.filter((r) => r.category === cat).length;
              const isSelected = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#8B1D1D] text-white shadow-xs'
                      : 'bg-white/50 text-[#555] hover:bg-white/80 border border-white/70'
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.name}</span>
                  <span className="text-[10px] opacity-85">({count})</span>
                </button>
              );
            }
          )}
        </div>

        {/* Second row filters: Status & Active Tag */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/60">
          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#555] mb-1">
              🟢 สถานะห้อง
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white/60 backdrop-blur-sm border border-white/80 rounded-xl px-3 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D]"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="open">🟢 เปิดรับสมาชิก</option>
              <option value="almost_full">🟡 ใกล้เต็มแล้ว</option>
              <option value="full">🔴 เต็มแล้ว</option>
              <option value="expired">⚪ หมดเวลารับสมาชิก</option>
            </select>
          </div>

          {/* Tag active badge */}
          {selectedTagFilter ? (
            <div className="flex flex-col justify-end">
              <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/80 text-xs text-[#8B1D1D] font-bold shadow-2xs">
                <span>กำลังกรอง: {selectedTagFilter}</span>
                <button
                  onClick={() => setSelectedTagFilter(null)}
                  className="p-0.5 hover:text-rose-700 ml-auto cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-end text-xs text-[#777] font-medium py-2">
              <span>📍 มหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต</span>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-[#555]">
            {isLoadingRooms ? (
              <span>กำลังโหลดข้อมูลห้อง...</span>
            ) : (
              <>
                พบทั้งหมด <span className="text-[#8B1D1D] font-extrabold">{filteredRooms.length}</span> ห้อง
              </>
            )}
          </p>
        </div>

        {/* Error State / Skeleton Loading / Empty States / Results */}
        {roomsError && rooms.length === 0 ? (
          <ErrorState
            title="เกิดข้อผิดพลาดในการโหลดห้องหาเพื่อน"
            message={roomsError}
            onRetry={refreshRooms}
            isRetrying={isLoadingRooms}
          />
        ) : isLoadingRooms ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <RoomCardSkeletonList count={6} />
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-12 text-center border border-white/70 shadow-md space-y-3">
            <div className="text-4xl">👀</div>
            {hasActiveFilters ? (
              <>
                <h3 className="text-base font-bold text-[#2D2D2D] font-kanit">
                  “ไม่เจอสิ่งที่กำลังหา...”
                </h3>
                <p className="text-xs text-[#666] max-w-md mx-auto">
                  “ลองเปลี่ยนคำค้นหาหรือ Tag ดูนะ หรือกดล้างตัวกรองเพื่อดูห้องทั้งหมด”
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 bg-[#8B1D1D] text-white text-xs font-semibold rounded-full shadow-sm cursor-pointer"
                >
                  ล้างตัวกรอง
                </button>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-[#2D2D2D] font-kanit">
                  “ยังไม่มีใครกำลังหาเพื่อนอยู่เลย 👀”
                </h3>
                <p className="text-xs text-[#666] max-w-md mx-auto">
                  “สร้างห้องแรกแล้วชวนเพื่อนใหม่กันเลย!”
                </p>
                <button
                  onClick={() => openCreateRoomFlow()}
                  className="px-6 py-2.5 bg-[#8B1D1D] text-white text-xs font-bold rounded-full shadow-md cursor-pointer"
                >
                  สร้างห้องหาเพื่อนห้องแรก 🚀
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
