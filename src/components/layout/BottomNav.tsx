import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Calendar, Users, User, PlusCircle } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const {
    activePage,
    setActivePage,
    openCreateRoomFlow,
    setSelectedCategory,
    setSelectedActivityId,
    isLoggedIn,
    setIsAuthModalOpen,
    showToast,
  } = useApp();

  const navItems = [
    { id: 'home', label: 'หน้าแรก', icon: Home },
    { id: 'activities', label: 'กิจกรรม มธ.', icon: Calendar },
    { id: 'create', label: 'สร้างห้อง', icon: PlusCircle, isSpecial: true },
    { id: 'find-friends', label: 'หาเพื่อน', icon: Users },
    { id: 'profile', label: 'โปรไฟล์', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/60 backdrop-blur-lg border-t border-white/50 px-2 py-1.5 shadow-[0_-4px_24px_0_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          if (item.isSpecial) {
            return (
              <button
                key={item.id}
                onClick={() => openCreateRoomFlow()}
                className="flex flex-col items-center justify-center p-1 -mt-5 text-[#8B1D1D] cursor-pointer group focus:outline-none"
              >
                <div className="w-12 h-12 rounded-full bg-[#8B1D1D] text-white flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-105 transition-transform">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-[#8B1D1D] mt-0.5">สร้างห้อง</span>
              </button>
            );
          }

          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'profile' && !isLoggedIn) {
                  showToast('🔒 กรุณาลงทะเบียนหรือเข้าสู่ระบบเพื่อดูโปรไฟล์ของคุณ');
                  setIsAuthModalOpen(true);
                  setActivePage('profile');
                  return;
                }
                setActivePage(item.id as any);
                if (item.id === 'activities') setSelectedActivityId(null);
                if (item.id === 'find-friends') setSelectedCategory(null);
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-colors cursor-pointer ${
                isActive ? 'text-[#8B1D1D] font-bold bg-white/50' : 'text-[#666] hover:text-[#2D2D2D]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[11px] mt-0.5 whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
