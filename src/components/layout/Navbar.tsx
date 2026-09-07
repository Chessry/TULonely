import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Search, Bell, Plus, X, Calendar, Users, ArrowRight } from 'lucide-react';
import { CATEGORY_METADATA } from '../../data/mockData';

export const Navbar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    unreadNotifCount,
    setIsNotifDrawerOpen,
    currentUser,
    isLoggedIn,
    setIsAuthModalOpen,
    openCreateRoomFlow,
    setSelectedCategory,
    setSelectedActivityId,
    rooms,
    universityActivities,
    setSearchQuery,
    navigateToRoom,
    navigateToActivityRooms,
  } = useApp();

  const navigate = useNavigate();

  // Search input & dropdown state
  const [navSearchInput, setNavSearchInput] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter matching rooms & activities for live dropdown preview
  const trimmedSearch = navSearchInput.trim().toLowerCase();
  const matchingRooms = trimmedSearch
    ? rooms
        .filter((r) => {
          const matchTitle = r.title.toLowerCase().includes(trimmedSearch);
          const matchDesc = r.description.toLowerCase().includes(trimmedSearch);
          const matchLoc = r.location.toLowerCase().includes(trimmedSearch);
          const matchAct = r.universityActivityTitle?.toLowerCase().includes(trimmedSearch);
          const matchTag = r.tags && r.tags.some((t) => t.toLowerCase().includes(trimmedSearch));
          return matchTitle || matchDesc || matchLoc || matchAct || matchTag;
        })
        .slice(0, 4)
    : [];

  const matchingActivities = trimmedSearch
    ? universityActivities
        .filter((a) => {
          const matchTitle = a.title.toLowerCase().includes(trimmedSearch);
          const matchDesc = a.description.toLowerCase().includes(trimmedSearch);
          const matchLoc = a.location.toLowerCase().includes(trimmedSearch);
          const matchTag = a.tags.some((t) => t.toLowerCase().includes(trimmedSearch));
          return matchTitle || matchDesc || matchLoc || matchTag;
        })
        .slice(0, 3)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearchInput.trim()) {
      setSearchQuery(navSearchInput.trim());
      setIsSearchOpen(false);
      setIsMobileSearchActive(false);
      navigate('/find-friends');
    }
  };

  const handleSelectRoom = (roomId: string) => {
    setIsSearchOpen(false);
    setIsMobileSearchActive(false);
    navigateToRoom(roomId);
  };

  const handleSelectActivity = (activityId: string) => {
    setIsSearchOpen(false);
    setIsMobileSearchActive(false);
    navigateToActivityRooms(activityId);
  };

  const navItems = [
    { id: 'home', label: 'หน้าแรก' },
    { id: 'activities', label: 'กิจกรรม มธ.' },
    { id: 'find-friends', label: 'หาเพื่อนทั้งหมด' },
    { id: 'profile', label: 'โปรไฟล์ของฉัน' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/50 backdrop-blur-md border-b border-white/40 shadow-[0_4px_20px_0_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Brand title, one line */}
        <button
          onClick={() => {
            setActivePage('home');
            setSelectedCategory(null);
            setSelectedActivityId(null);
            navigate('/');
          }}
          className="flex items-center gap-1.5 group text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1D1D] rounded-xl shrink-0"
          aria-label="TUlonely Home"
        >
          <span className="font-black text-2xl sm:text-3xl tracking-tighter text-[#8B1D1D] font-kanit flex items-center gap-1.5">
            TU<span className="text-[#F27D26]">lonely</span>
            <span className="text-xl group-hover:scale-125 transition-transform duration-200 inline-block">👀</span>
          </span>
        </button>

        {/* Zone 2: 4-6 nav links, 1-2 word labels, single-line */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-white/40 backdrop-blur-sm px-2 py-1 rounded-full border border-white/60 shadow-xs" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id as any);
                  if (item.id === 'activities') setSelectedActivityId(null);
                  if (item.id === 'find-friends') setSelectedCategory(null);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#8B1D1D] text-white shadow-sm'
                    : 'text-[#444] hover:bg-white/70 hover:text-[#8B1D1D]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary actions (Search input with live dropdown, Notifications, Create, Profile/Login) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end max-w-xl">
          {/* Interactive Search Bar Container */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-xs sm:max-w-sm hidden sm:block">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative flex items-center bg-white/70 hover:bg-white/90 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#8B1D1D] backdrop-blur-md rounded-full border border-white/80 shadow-xs transition-all">
                <Search className="w-4 h-4 text-[#8B1D1D] ml-3 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={navSearchInput}
                  onChange={(e) => {
                    setNavSearchInput(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="ค้นหาชื่อห้อง, กิจกรรม, #แท็ก..."
                  className="w-full bg-transparent pl-2 pr-8 py-1.5 text-xs text-[#2D2D2D] placeholder:text-[#888] focus:outline-none"
                />
                {navSearchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setNavSearchInput('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 p-0.5 text-[#888] hover:text-[#2D2D2D] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            {/* Live Search Suggestions Dropdown */}
            {isSearchOpen && trimmedSearch.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/90 shadow-2xl p-3 z-50 space-y-3 max-h-96 overflow-y-auto">
                {/* Header info */}
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-100 text-[11px] text-[#777]">
                  <span>ผลการค้นหาสำหรับ "{navSearchInput}"</span>
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="text-[#8B1D1D] font-bold hover:underline flex items-center gap-0.5"
                  >
                    <span>ดูทั้งหมด</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Matching Rooms Section */}
                {matchingRooms.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#8B1D1D] uppercase tracking-wider">
                      <Users className="w-3 h-3" />
                      <span>ห้องหาเพื่อน ({matchingRooms.length})</span>
                    </div>
                    <div className="space-y-1">
                      {matchingRooms.map((room) => {
                        const catMeta = CATEGORY_METADATA[room.category] || CATEGORY_METADATA.university;
                        return (
                          <button
                            key={room.id}
                            type="button"
                            onClick={() => handleSelectRoom(room.id)}
                            className="w-full text-left p-2 rounded-xl hover:bg-[#8B1D1D]/5 transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs">{catMeta.icon}</span>
                                <p className="text-xs font-bold text-[#2D2D2D] truncate group-hover:text-[#8B1D1D]">
                                  {room.title}
                                </p>
                              </div>
                              <p className="text-[10px] text-[#666] truncate mt-0.5">
                                📍 {room.location} • 📅 {room.activityDate}
                              </p>
                            </div>
                            <span className="text-[10px] text-[#8B1D1D] font-semibold shrink-0">
                              {room.participants.length}/{room.maxParticipants} คน
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Matching University Activities Section */}
                {matchingActivities.length > 0 && (
                  <div className="space-y-1.5 pt-1.5 border-t border-stone-100">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#8B1D1D] uppercase tracking-wider">
                      <Calendar className="w-3 h-3" />
                      <span>กิจกรรมมหาวิทยาลัย ({matchingActivities.length})</span>
                    </div>
                    <div className="space-y-1">
                      {matchingActivities.map((act) => (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => handleSelectActivity(act.id)}
                          className="w-full text-left p-2 rounded-xl hover:bg-[#8B1D1D]/5 transition-colors flex items-center gap-2.5 group cursor-pointer"
                        >
                          <img
                            src={act.coverImage}
                            alt={act.title}
                            className="w-8 h-8 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#2D2D2D] truncate group-hover:text-[#8B1D1D]">
                              {act.title}
                            </p>
                            <p className="text-[10px] text-[#666] truncate mt-0.5">
                              📅 {act.date} • 📍 {act.location}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No results */}
                {matchingRooms.length === 0 && matchingActivities.length === 0 && (
                  <div className="text-center py-4 space-y-1">
                    <p className="text-xs font-bold text-[#444]">ไม่พบห้องหรือกิจกรรมที่ตรงกับคำค้นหา</p>
                    <p className="text-[10px] text-[#777]">กด Enter เพื่อค้นหาห้องทั้งหมดด้วยคำนี้</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Search Trigger Icon (visible only on mobile) */}
          <button
            onClick={() => setIsMobileSearchActive(!isMobileSearchActive)}
            className="sm:hidden p-2 rounded-full bg-white/60 hover:bg-white/90 backdrop-blur-md border border-white/70 text-[#444] hover:text-[#8B1D1D] shadow-xs transition-colors cursor-pointer"
            title="ค้นหา"
            aria-label="Mobile Search"
          >
            <Search className="w-4 h-4 text-[#8B1D1D]" />
          </button>

          {/* Notifications button with frosted glass backdrop */}
          <button
            onClick={() => setIsNotifDrawerOpen(true)}
            className="relative p-2 rounded-full bg-white/60 hover:bg-white/90 backdrop-blur-md border border-white/70 text-[#444] hover:text-[#8B1D1D] shadow-xs transition-colors cursor-pointer shrink-0"
            title="การแจ้งเตือน"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#8B1D1D] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* Create Room Primary CTA */}
          <button
            onClick={() => openCreateRoomFlow()}
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white font-bold text-xs px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างห้องหาเพื่อน</span>
          </button>

          {/* User Profile Avatar / Switcher or Login Button */}
          {isLoggedIn ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-white/60 hover:bg-white/90 backdrop-blur-md border border-white/70 shadow-xs hover:border-[#8B1D1D]/40 text-left transition-all cursor-pointer shrink-0"
              title="โปรไฟล์และสลับบัญชีนักศึกษา"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div className="hidden xl:block">
                <p className="text-xs font-bold text-[#2D2D2D] leading-tight truncate max-w-[80px]">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-[#777] leading-none">มธ. ศูนย์รังสิต</p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setActivePage('auth')}
              className="flex items-center gap-1.5 bg-white/80 hover:bg-white text-[#8B1D1D] font-bold text-xs px-3.5 py-1.5 rounded-full border border-[#8B1D1D]/30 shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>ลงทะเบียน / Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Expandable Search Bar */}
      {isMobileSearchActive && (
        <div className="sm:hidden px-4 pb-3 pt-1 border-t border-white/50 bg-white/70 backdrop-blur-lg animate-in fade-in duration-150">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-[#8B1D1D] absolute left-3" />
            <input
              type="text"
              value={navSearchInput}
              onChange={(e) => setNavSearchInput(e.target.value)}
              placeholder="พิมพ์ชื่อห้อง, กิจกรรม, คีย์เวิร์ด..."
              autoFocus
              className="w-full bg-white/90 border border-white/80 rounded-full pl-9 pr-20 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1D1D]"
            />
            <div className="absolute right-1.5 flex items-center gap-1">
              <button
                type="submit"
                className="px-3 py-1 bg-[#8B1D1D] text-white text-[11px] font-bold rounded-full cursor-pointer"
              >
                ค้นหา
              </button>
              <button
                type="button"
                onClick={() => setIsMobileSearchActive(false)}
                className="p-1 text-[#666] hover:text-[#2D2D2D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
};
