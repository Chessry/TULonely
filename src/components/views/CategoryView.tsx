import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { RoomCard } from '../cards/RoomCard';
import { CATEGORY_METADATA } from '../../data/mockData';
import { CategoryType } from '../../types';
import { Search, Plus, ArrowLeft } from 'lucide-react';

interface CategoryViewProps {
  categoryOverride?: CategoryType;
}

export const CategoryView: React.FC<CategoryViewProps> = ({ categoryOverride }) => {
  const {
    selectedCategory,
    setSelectedCategory,
    rooms,
    openCreateRoomFlow,
  } = useApp();

  const { categoryKey: paramCategoryKey } = useParams<{ categoryKey?: string }>();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Resolve category key from prop, param, or state
  let resolvedKey: CategoryType = 'food';
  if (categoryOverride) {
    resolvedKey = categoryOverride;
  } else if (paramCategoryKey) {
    if (paramCategoryKey === 'eating' || paramCategoryKey === 'food') {
      resolvedKey = 'food';
    } else if (paramCategoryKey === 'sports') {
      resolvedKey = 'sports';
    } else if (paramCategoryKey === 'study') {
      resolvedKey = 'study';
    } else if (paramCategoryKey === 'entertainment') {
      resolvedKey = 'entertainment';
    } else if (paramCategoryKey === 'university') {
      resolvedKey = 'university';
    }
  } else if (selectedCategory) {
    resolvedKey = selectedCategory;
  }

  const categoryKey: CategoryType = resolvedKey;

  // Sync context state if needed
  useEffect(() => {
    if (selectedCategory !== categoryKey) {
      setSelectedCategory(categoryKey);
    }
  }, [categoryKey, selectedCategory, setSelectedCategory]);

  const meta = CATEGORY_METADATA[categoryKey] || CATEGORY_METADATA.food;

  const handleCategorySwitch = (catKey: CategoryType) => {
    setSelectedCategory(catKey);
    setActiveTag(null);
    if (catKey === 'food') {
      navigate('/eating');
    } else if (catKey === 'university') {
      navigate('/activities');
    } else {
      navigate(`/${catKey}`);
    }
  };

  // Filter rooms in this category
  const categoryRooms = rooms.filter((r) => r.category === categoryKey);

  const filteredRooms = categoryRooms.filter((room) => {
    const matchTag = !activeTag || (room.tags && room.tags.includes(activeTag));
    const matchSearch =
      !search.trim() ||
      room.title.toLowerCase().includes(search.toLowerCase()) ||
      room.description.toLowerCase().includes(search.toLowerCase()) ||
      room.location.toLowerCase().includes(search.toLowerCase()) ||
      (room.tags && room.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));
    return matchTag && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-16">
      {/* Category Header Banner - Frosted with Theme color tint */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-white/30 backdrop-blur-xl"
        style={{
          background: `linear-gradient(135deg, ${meta.color}E6 0%, #8B1D1DE6 100%)`,
        }}
      >
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold cursor-pointer border border-white/30"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>หน้าแรก</span>
            </button>
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30">
              {meta.englishName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-4xl sm:text-5xl">{meta.icon}</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-kanit">{meta.name}</h1>
          </div>

          <p className="text-sm sm:text-base font-medium text-white/95">"{meta.tagline}"</p>
          <p className="text-xs text-white/85">{meta.description}</p>
        </div>
      </div>

      {/* Category Switcher Tabs - Frosted Glass */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {(['food', 'sports', 'study', 'entertainment'] as CategoryType[]).map((catKey) => {
          const itemMeta = CATEGORY_METADATA[catKey];
          const isCurrent = categoryKey === catKey;
          return (
            <button
              key={catKey}
              onClick={() => handleCategorySwitch(catKey)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap backdrop-blur-md ${
                isCurrent
                  ? 'bg-white/90 border-[#8B1D1D] text-[#8B1D1D] shadow-md'
                  : 'bg-white/45 border-white/70 text-[#555] hover:bg-white/70 shadow-2xs'
              }`}
            >
              <span>{itemMeta.icon}</span>
              <span>{itemMeta.name}</span>
            </button>
          );
        })}
      </div>

      {/* Controls: Search, Popular Tags, and Create Room Button */}
      <div className="bg-white/50 backdrop-blur-md rounded-3xl p-5 border border-white/70 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#8B1D1D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`ค้นหาในหมวด${meta.name}...`}
              className="w-full bg-white/60 backdrop-blur-sm border border-white/80 rounded-full pl-9 pr-4 py-2 text-xs text-[#2D2D2D] placeholder:text-[#888] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D]"
            />
          </div>

          {/* Create Room CTA */}
          <button
            onClick={() => openCreateRoomFlow(categoryKey)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white text-xs font-bold shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างห้อง{meta.name}</span>
          </button>
        </div>

        {/* Popular Tags */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/60">
          <span className="text-xs text-[#666] font-medium mr-1">แท็กแนะนำ:</span>
          <button
            onClick={() => setActiveTag(null)}
            className={`text-[11px] px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
              activeTag === null
                ? 'bg-[#8B1D1D] text-white shadow-2xs'
                : 'bg-white/50 text-[#555] hover:bg-white/80 border border-white/70'
            }`}
          >
            ทั้งหมด
          </button>
          {meta.popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`text-[11px] px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                activeTag === tag
                  ? 'bg-[#8B1D1D] text-white font-bold shadow-2xs'
                  : 'bg-white/50 text-[#555] hover:bg-white/80 border border-white/70'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms Grid or Empty State */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#2D2D2D] font-kanit">
            ห้องที่เปิดรับสมาชิก ({filteredRooms.length} ห้อง)
          </h3>
        </div>

        {filteredRooms.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-12 text-center border border-white/70 shadow-md space-y-3">
            <div className="text-4xl">👀</div>
            <h4 className="text-base font-bold text-[#2D2D2D] font-kanit">
              ยังไม่มีใครกำลังหาเพื่อนในหมวดนี้เลย
            </h4>
            <p className="text-xs text-[#666] max-w-md mx-auto">
              “ยังไม่มีใครกำลังหาเพื่อนอยู่เลย 👀 สร้างห้องแรกแล้วชวนเพื่อนใหม่กันเลย!”
            </p>
            <button
              onClick={() => openCreateRoomFlow(categoryKey)}
              className="px-6 py-2.5 bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white text-xs font-bold rounded-full shadow-md cursor-pointer"
            >
              สร้างห้อง{meta.name}ห้องแรก 🚀
            </button>
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
