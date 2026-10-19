import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  X,
  MessageCircle,
  Users,
  Clock,
  Calendar,
  Sparkles,
  Trash2,
  Check,
  Flame,
  UserCheck,
  UserMinus,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { NotificationItem } from '../../types';

type NotifFilter = 'all' | 'host' | 'interest';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotifDrawerOpen,
    setIsNotifDrawerOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    navigateToRoom,
    navigateToActivityRooms,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<NotifFilter>('all');

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

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'host') {
      return (
        n.category === 'host' ||
        n.type === 'join' ||
        n.type === 'leave' ||
        n.type === 'board_full' ||
        n.type === 'board_updated'
      );
    }
    if (activeFilter === 'interest') {
      return n.category === 'interest' || n.type === 'tag_match' || Boolean(n.tag);
    }
    return true;
  });

  const getNotifIcon = (notif: NotificationItem) => {
    switch (notif.type) {
      case 'tag_match':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
        );
      case 'board_full':
        return (
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200 shrink-0 shadow-2xs">
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
        );
      case 'join':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0 shadow-2xs">
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
        );
      case 'leave':
        return (
          <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center border border-stone-200 shrink-0 shadow-2xs">
            <UserMinus className="w-4 h-4 text-stone-600" />
          </div>
        );
      case 'almost_full':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0 shadow-2xs">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
        );
      case 'chat':
        return (
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200 shrink-0 shadow-2xs">
            <MessageCircle className="w-4 h-4 text-blue-600" />
          </div>
        );
      case 'activity_soon':
      case 'deadline':
        return (
          <div className="w-8 h-8 rounded-xl bg-[#8B1D1D]/10 text-[#8B1D1D] flex items-center justify-center border border-[#8B1D1D]/20 shrink-0 shadow-2xs">
            <Calendar className="w-4 h-4 text-[#8B1D1D]" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-[#8B1D1D]/10 text-[#8B1D1D] flex items-center justify-center border border-[#8B1D1D]/20 shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#8B1D1D]" />
          </div>
        );
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsNotifDrawerOpen(false);
        }
      }}
      className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-[#FDFBF7]/95 backdrop-blur-2xl h-full shadow-2xl flex flex-col border-l border-white/80 animate-in slide-in-from-right duration-200">
        {/* Drawer Header - Frosted Gradient */}
        <div className="bg-gradient-to-r from-[#8B1D1D] to-[#6D0E1C] text-white px-5 py-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Bell className="w-5 h-5 text-amber-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-[#8B1D1D]" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base font-kanit">การแจ้งเตือน</h3>
              <p className="text-[10px] text-white/80">อัปเดตกิจกรรมและคอมมูนิตี้ มธ.</p>
            </div>
            <span className="text-xs bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full font-bold ml-1">
              {unreadCount} ใหม่
            </span>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-[11px] text-white/90 hover:text-white underline cursor-pointer font-medium"
                title="อ่านทั้งหมด"
              >
                อ่านทั้งหมด
              </button>
            )}
            <button
              onClick={() => setIsNotifDrawerOpen(false)}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              aria-label="Close notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Quick Action Bar */}
        <div className="bg-white/60 backdrop-blur-md px-4 py-2.5 border-b border-white/70 flex items-center justify-between gap-2 shrink-0 shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#8B1D1D] text-white shadow-2xs'
                  : 'bg-white/70 text-[#555] hover:bg-white border border-white/80'
              }`}
            >
              ทั้งหมด ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('host')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'host'
                  ? 'bg-[#8B1D1D] text-white shadow-2xs'
                  : 'bg-white/70 text-[#555] hover:bg-white border border-white/80'
              }`}
            >
              👑 บอร์ดของฉัน
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('interest')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'interest'
                  ? 'bg-[#8B1D1D] text-white shadow-2xs'
                  : 'bg-white/70 text-[#555] hover:bg-white border border-white/80'
              }`}
            >
              ✨ ตรงความสนใจ
            </button>
          </div>

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm('ต้องการล้างประวัติการแจ้งเตือนทั้งหมดใช่หรือไม่?')) {
                  clearAllNotifications();
                }
              }}
              className="p-1.5 text-[#888] hover:text-rose-600 transition-colors cursor-pointer rounded-lg hover:bg-rose-50/80 shrink-0"
              title="ล้างการแจ้งเตือนทั้งหมด"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Notifications List - Frosted */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 text-[#777] space-y-2">
              <div className="w-16 h-16 rounded-full bg-white/70 flex items-center justify-center text-3xl shadow-inner border border-white">
                {activeFilter === 'interest' ? '🏷️' : activeFilter === 'host' ? '👑' : '🔔'}
              </div>
              <p className="text-sm font-bold text-[#2D2D2D] font-kanit">
                {activeFilter === 'interest'
                  ? 'ยังไม่มีการแจ้งเตือนแท็กที่สนใจ'
                  : activeFilter === 'host'
                  ? 'ยังไม่มีการแจ้งเตือนสำหรับบอร์ดของคุณ'
                  : 'ไม่มีการแจ้งเตือน'}
              </p>
              <p className="text-xs text-[#777] max-w-xs leading-relaxed">
                {activeFilter === 'interest'
                  ? 'เมื่อมีเพื่อนสร้างห้องที่มีแท็กตรงกับความสนใจในโปรไฟล์ของคุณ ระบบจะแจ้งให้ทราบที่นี่ทันที'
                  : activeFilter === 'host'
                  ? 'เมื่อมีเพื่อนขอเข้าร่วมบอร์ด ออกจากบอร์ด หรือห้องเต็มแล้ว จะแสดงแจ้งเตือนที่นี่'
                  : 'เมื่อมีกิจกรรมใหม่ หรือมีเพื่อนตอบรับคำขอ จะได้รับการแจ้งเตือนที่นี่'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 backdrop-blur-md ${
                  n.read
                    ? 'bg-white/50 border-white/60 opacity-80 hover:opacity-100 hover:bg-white/70'
                    : 'bg-white/85 border-[#8B1D1D]/20 shadow-xs hover:bg-white ring-1 ring-[#8B1D1D]/10'
                }`}
              >
                {/* Clickable Area to navigate */}
                <div
                  className="flex items-start gap-3 flex-1 min-w-0"
                  onClick={() => handleNotifClick(n)}
                >
                  {getNotifIcon(n)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h4 className="text-xs font-bold text-[#2D2D2D] truncate">{n.title}</h4>
                        {n.tag && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[9px] font-bold border border-amber-200 shrink-0">
                            <Tag className="w-2.5 h-2.5" />
                            <span>{n.tag}</span>
                          </span>
                        )}
                      </div>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-[#8B1D1D] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#555] mt-1 line-clamp-2 leading-relaxed">
                      {n.description}
                    </p>
                    <div className="flex items-center justify-between gap-2 mt-1.5">
                      <span className="text-[10px] text-[#888]">{n.time}</span>
                      {n.targetRoomId && (
                        <span className="text-[10px] text-[#8B1D1D] font-bold group-hover:underline">
                          เปิดดูบอร์ด →
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete button on hover / touch */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-all rounded-lg hover:bg-rose-50 cursor-pointer shrink-0"
                  title="ลบการแจ้งเตือนนี้"
                  aria-label="Delete notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
