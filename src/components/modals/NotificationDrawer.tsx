import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, X, MessageCircle, Users, Clock, Calendar, Sparkles } from 'lucide-react';
import { NotificationItem } from '../../types';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotifDrawerOpen,
    setIsNotifDrawerOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    navigateToRoom,
    navigateToActivityRooms,
  } = useApp();

  // Close on Escape key
  useEffect(() => {
    if (!isNotifDrawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNotifDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNotifDrawerOpen, setIsNotifDrawerOpen]);

  if (!isNotifDrawerOpen) return null;

  const handleNotifClick = (notif: NotificationItem) => {
    markNotificationAsRead(notif.id);
    if (notif.targetRoomId) {
      setIsNotifDrawerOpen(false);
      navigateToRoom(notif.targetRoomId);
    } else if (notif.targetActivityId) {
      setIsNotifDrawerOpen(false);
      navigateToActivityRooms(notif.targetActivityId);
    }
  };

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'join':
        return <Users className="w-4 h-4 text-emerald-600" />;
      case 'almost_full':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'chat':
        return <MessageCircle className="w-4 h-4 text-blue-600" />;
      case 'activity_soon':
        return <Calendar className="w-4 h-4 text-[#8B1D1D]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#8B1D1D]" />;
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsNotifDrawerOpen(false);
        }
      }}
      className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end"
    >
      <div className="w-full max-w-md bg-[#FDFBF7]/95 backdrop-blur-2xl h-full shadow-2xl flex flex-col border-l border-white/80 animate-in slide-in-from-right duration-200">
        {/* Drawer Header - Frosted Gradient */}
        <div className="bg-gradient-to-r from-[#8B1D1D] to-[#6D0E1C] text-white px-5 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base font-kanit">การแจ้งเตือน</h3>
            <span className="text-xs bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full font-bold">
              {notifications.filter((n) => !n.read).length} ใหม่
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsAsRead}
              className="text-[11px] text-white/90 hover:text-white underline cursor-pointer"
              title="อ่านทั้งหมด"
            >
              อ่านทั้งหมด
            </button>
            <button
              onClick={() => setIsNotifDrawerOpen(false)}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              aria-label="Close notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List - Frosted */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#777]">
              <div className="text-4xl mb-2">🔔</div>
              <p className="text-sm font-bold text-[#2D2D2D]">ไม่มีการแจ้งเตือนใหม่</p>
              <p className="text-xs text-[#777] mt-1">
                เมื่อมีเพื่อนเข้าร่วมห้อง หรือกิจกรรมใกล้เริ่ม จะแจ้งเตือนที่นี่ (กด Esc เพื่อปิด)
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotifClick(n)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 backdrop-blur-md ${
                  n.read
                    ? 'bg-white/50 border-white/60 opacity-75 hover:opacity-100'
                    : 'bg-white/80 border-white/90 shadow-xs hover:bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white/80 border border-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  {getNotifIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-[#2D2D2D] truncate">{n.title}</h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#8B1D1D] shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#555] mt-0.5 line-clamp-2 leading-relaxed">
                    {n.description}
                  </p>
                  <p className="text-[10px] text-[#888] mt-1">{n.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
