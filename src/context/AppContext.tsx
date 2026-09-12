import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CategoryType,
  Room,
  Participant,
  UniversityActivity,
  UserProfile,
  NotificationItem,
  ChatMessage,
  ReportPayload
} from '../types';
import {
  INITIAL_ROOMS,
  UNIVERSITY_ACTIVITIES,
  INITIAL_USER,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';
import { calculateRoomStatus } from '../utils/helpers';
import {
  roomService,
  authService,
  activityService,
  chatService,
  realtimeService,
  getLocalRooms,
  getLocalUser,
  saveRoomExtra,
  isRoomMatch,
} from '../services';
import { supabase, isSupabaseConfigured, testSupabaseConnection } from '../lib/supabaseClient';


export type ActivePage =
  | 'home'
  | 'activities'
  | 'category'
  | 'find-friends'
  | 'room-detail'
  | 'create-room'
  | 'profile'
  | 'auth';

interface AppContextType {
  // Auth state
  isLoggedIn: boolean;
  setIsLoggedIn: (logged: boolean) => void;
  login: (credentials?: { studentId?: string; email?: string; password?: string; name?: string }) => Promise<UserProfile>;
  register: (userProfile: Partial<UserProfile> & { password?: string }) => Promise<UserProfile>;

  logout: () => void;

  // Navigation & view states
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  selectedCategory: CategoryType | null;
  setSelectedCategory: (cat: CategoryType | null) => void;
  selectedRoomId: string | null;
  setSelectedRoomId: (id: string | null) => void;
  selectedActivityId: string | null;
  setSelectedActivityId: (id: string | null) => void;

  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTagFilter: string | null;
  setSelectedTagFilter: (tag: string | null) => void;

  // Data
  rooms: Room[];
  isLoadingRooms: boolean;
  roomsError: string | null;
  refreshRooms: (silent?: boolean) => Promise<void>;
  universityActivities: UniversityActivity[];
  currentUser: UserProfile;
  notifications: NotificationItem[];
  unreadNotifCount: number;

  // Modals & Drawers
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  preselectedActivityForRoom: UniversityActivity | null;
  setPreselectedActivityForRoom: (act: UniversityActivity | null) => void;
  preselectedCategoryForRoom: CategoryType | null;
  setPreselectedCategoryForRoom: (cat: CategoryType | null) => void;

  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  reportTarget: ReportPayload | null;
  setReportTarget: (target: ReportPayload | null) => void;

  isNotifDrawerOpen: boolean;
  setIsNotifDrawerOpen: (open: boolean) => void;

  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  editingRoom: Room | null;
  setEditingRoom: (room: Room | null) => void;
  openEditRoomModal: (room: Room) => void;
  closeEditRoomModal: () => void;

  // Actions
  createRoom: (newRoomData: Omit<Room, 'id' | 'createdAt' | 'status' | 'chatMessages' | 'viewsCount' | 'creator' | 'participants'>) => Promise<string>;
  updateRoom: (roomId: string, updates: Partial<Room>) => Promise<boolean>;
  deleteRoom: (roomId: string) => void;
  joinRoom: (roomId: string) => boolean;
  leaveRoom: (roomId: string) => void;
  sendChatMessage: (roomId: string, text: string, sticker?: string, replyTo?: { id: string; name: string }) => void;
  deleteChatMessage: (roomId: string, messageId: string) => void;
  toggleCommentLike: (roomId: string, commentId: string) => void;
  toggleFavoriteRoom: (roomId: string) => void;
  toggleFavoriteActivity: (actId: string) => void;
  updateUserProfile: (updated: Partial<UserProfile>) => void;
  markNotificationAsRead: (notifId: string) => void;
  markAllNotificationsAsRead: () => void;
  submitReport: (report: ReportPayload) => void;

  // Navigation helpers
  navigateToRoom: (roomId: string) => void;
  navigateToCategory: (category: CategoryType) => void;
  navigateToActivityRooms: (activityId: string) => void;
  openCreateRoomFlow: (category?: CategoryType, activity?: UniversityActivity) => void;

  // Toast feedback
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Realtime online connection status
  realtimeStatus: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED';
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state - check localStorage for first-time use
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const localUser = getLocalUser();
    if (!localUser.id || localUser.id === 'user-me-noah') {
      localStorage.removeItem('tulonely_is_logged_in');
      localStorage.removeItem('tulonely_user');
      return false;
    }
    const saved = localStorage.getItem('tulonely_is_logged_in');
    return saved !== null ? saved === 'true' : false;
  });

  // Router hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Dynamically derive activePage from current URL path
  const activePage = useMemo<ActivePage>(() => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'home';
    if (path.startsWith('/activities')) return 'activities';
    if (path.startsWith('/rooms/') || path.startsWith('/room/')) return 'room-detail';
    if (path === '/find-friends' || path === '/rooms') return 'find-friends';
    if (
      path.startsWith('/category') ||
      path === '/eating' ||
      path === '/food' ||
      path === '/sports' ||
      path === '/study' ||
      path === '/entertainment'
    ) {
      return 'category';
    }
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/auth') || path === '/login' || path === '/register') return 'auth';
    return 'home';
  }, [location.pathname]);

  const setActivePage = (page: ActivePage) => {
    switch (page) {
      case 'home':
        navigate('/');
        break;
      case 'activities':
        navigate('/activities');
        break;
      case 'find-friends':
        navigate('/find-friends');
        break;
      case 'category':
        if (selectedCategory && selectedCategory !== 'university') {
          if (selectedCategory === 'food') navigate('/eating');
          else navigate(`/${selectedCategory}`);
        } else {
          navigate('/eating');
        }
        break;
      case 'room-detail':
        if (selectedRoomId) {
          navigate(`/rooms/${selectedRoomId}`);
        } else {
          navigate('/find-friends');
        }
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'auth':
        navigate('/auth');
        break;
      default:
        navigate('/');
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  // Storage persistence with service fallback
  const [rooms, setRooms] = useState<Room[]>(() => getLocalRooms());
  const [isLoadingRooms, setIsLoadingRooms] = useState<boolean>(true);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  const refreshRooms = async (silent = false) => {
    if (!silent) setIsLoadingRooms(true);
    setRoomsError(null);
    try {
      const freshRooms = await roomService.getRooms();
      if (freshRooms) {
        setRooms(freshRooms);
      }
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูลห้องได้ กรุณาลองใหม่อีกครั้ง';
      console.error('[AppContext] Failed to load rooms:', err);
      if (!silent) setRoomsError(errMsg);
    } finally {
      if (!silent) setIsLoadingRooms(false);
    }
  };

  const [universityActivities] = useState<UniversityActivity[]>(UNIVERSITY_ACTIVITIES);

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => getLocalUser());

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('tulonely_notifs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((n: NotificationItem) => !n.id.startsWith('notif-'));
          localStorage.setItem('tulonely_notifs', JSON.stringify(filtered));
          return filtered;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [preselectedActivityForRoom, setPreselectedActivityForRoom] = useState<UniversityActivity | null>(null);
  const [preselectedCategoryForRoom, setPreselectedCategoryForRoom] = useState<CategoryType | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<ReportPayload | null>(null);

  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Edit Room Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const openEditRoomModal = (room: Room) => {
    setEditingRoom(room);
    setIsEditModalOpen(true);
  };

  const closeEditRoomModal = () => {
    setIsEditModalOpen(false);
    setEditingRoom(null);
  };

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('tulonely_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('tulonely_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('tulonely_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('tulonely_is_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  // Load fresh data from services (Backend or local fallback)
  useEffect(() => {
    // Test Supabase connection status
    testSupabaseConnection().then((status) => {
      if (status.connected) {
        console.log('⚡ [Supabase] Connected successfully:', status.message);
      } else if (status.configured) {
        console.warn('⚠️ [Supabase] Configured but test check failed:', status.message);
      } else {
        console.info('ℹ️ [Supabase] Note: Operating in local/mock mode until VITE_SUPABASE_ANON_KEY is set in .env');
      }
    });

    refreshRooms();

    authService
      .getCurrentUser()
      .then((user) => {
        if (user) {
          const hash = window.location.hash || '';
          const search = window.location.search || '';
          const isRecovery =
            hash.includes('type=recovery') ||
            search.includes('type=recovery') ||
            window.location.pathname === '/reset-password';

          setCurrentUser(user);
          if (!isRecovery) {
            setIsLoggedIn(true);
          }
        }
      })
      .catch((err) => console.warn('[AppContext] Failed to load user:', err));

    let authSub: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          navigate('/reset-password', { replace: true });
        } else if (event === 'SIGNED_OUT') {
          setIsLoggedIn(false);
        }
      });
      authSub = subscription;
    }

    return () => {
      authSub?.unsubscribe();
    };
  }, [navigate]);

  const [realtimeStatus, setRealtimeStatus] = useState<'CONNECTED' | 'CONNECTING' | 'DISCONNECTED'>('CONNECTING');

  // Supabase Online Realtime & Cross-Client Live Synchronization
  useEffect(() => {
    const unsubRealtime = realtimeService.initRealtime({
      onStatusChange: (st) => setRealtimeStatus(st),
      onNewComment: (roomId, message) => {
        setRooms((prev) =>
          prev.map((r) => {
            if (isRoomMatch(r.id, roomId)) {
              const curMessages = r.chatMessages || [];
              if (curMessages.some((m) => m.id === message.id)) return r;
              const updated = [...curMessages, message];
              saveRoomExtra(r.id, { chatMessages: updated });
              return { ...r, chatMessages: updated };
            }
            return r;
          })
        );
      },
      onDeleteComment: (roomId, messageId) => {
        setRooms((prev) =>
          prev.map((r) => {
            if (isRoomMatch(r.id, roomId)) {
              const curMessages = r.chatMessages || [];
              const updated = curMessages.filter(
                (m) => m.id !== messageId && m.replyToId !== messageId
              );
              saveRoomExtra(r.id, { chatMessages: updated });
              return { ...r, chatMessages: updated };
            }
            return r;
          })
        );
      },
      onToggleLike: (roomId, messageId, likedBy, likesCount) => {
        setRooms((prev) =>
          prev.map((r) => {
            if (isRoomMatch(r.id, roomId)) {
              const curMessages = r.chatMessages || [];
              const updated = curMessages.map((m) =>
                m.id === messageId ? { ...m, likedBy, likesCount } : m
              );
              saveRoomExtra(r.id, { chatMessages: updated });
              return { ...r, chatMessages: updated };
            }
            return r;
          })
        );
      },
      onRoomJoined: (roomId, participant, joinMessage, fullParticipants) => {
        setRooms((prev) =>
          prev.map((r) => {
            if (isRoomMatch(r.id, roomId)) {
              const pMap = new Map<string, Participant>();
              (r.participants || []).forEach((p) => pMap.set(p.id, p));
              if (fullParticipants && Array.isArray(fullParticipants)) {
                fullParticipants.forEach((p) => pMap.set(p.id, p));
              }
              pMap.set(participant.id, participant);
              const updatedParticipants = Array.from(pMap.values());

              const curMessages = r.chatMessages || [];
              const updatedMessages = curMessages.some((m) => m.id === joinMessage.id)
                ? curMessages
                : [...curMessages, joinMessage];

              saveRoomExtra(r.id, {
                participants: updatedParticipants,
                chatMessages: updatedMessages,
              });

              const updatedRoom: Room = {
                ...r,
                participants: updatedParticipants,
                chatMessages: updatedMessages,
              };
              updatedRoom.status = calculateRoomStatus(updatedRoom);
              return updatedRoom;
            }
            return r;
          })
        );
        showToast(`🎉 ${participant.name} ได้เข้าร่วมห้องแล้ว!`);
      },
      onRoomLeft: (roomId, userId, leaveMessage) => {
        setRooms((prev) =>
          prev.map((r) => {
            if (isRoomMatch(r.id, roomId)) {
              const updatedParticipants = (r.participants || []).filter((p) => p.id !== userId);
              const curMessages = r.chatMessages || [];
              const updatedMessages = curMessages.some((m) => m.id === leaveMessage.id)
                ? curMessages
                : [...curMessages, leaveMessage];

              saveRoomExtra(r.id, {
                participants: updatedParticipants,
                chatMessages: updatedMessages,
              });

              const updatedRoom: Room = {
                ...r,
                participants: updatedParticipants,
                chatMessages: updatedMessages,
              };
              updatedRoom.status = calculateRoomStatus(updatedRoom);
              return updatedRoom;
            }
            return r;
          })
        );
      },
      onRoomCreated: (newRoom) => {
        setRooms((prev) => {
          if (prev.some((r) => isRoomMatch(r.id, newRoom.id))) return prev;
          return [newRoom, ...prev];
        });
      },
      onRoomUpdated: (updatedRoom) => {
        setRooms((prev) =>
          prev.map((r) => (isRoomMatch(r.id, updatedRoom.id) ? { ...r, ...updatedRoom } : r))
        );
      },
      onDatabaseUpdate: () => {
        refreshRooms(true);
      },
    });

    return () => {
      unsubRealtime();
    };
  }, []);


  // Auth actions
  const login = async (credentials?: { studentId?: string; email?: string; password?: string; name?: string }): Promise<UserProfile> => {
    try {
      const { user } = await authService.login(credentials);
      setCurrentUser(user);
      setIsLoggedIn(true);
      setActivePage('home');
      showToast(`ยินดีต้อนรับกลับสู่ TUlonely 🎉`);
      return user;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ';
      console.error('[AppContext] Login failed:', err);
      showToast(`❌ ${errMsg}`);
      throw err;
    }
  };

  const register = async (userProfile: Partial<UserProfile> & { password?: string }): Promise<UserProfile> => {
    try {
      const { user } = await authService.register(userProfile);
      setCurrentUser(user);
      setIsLoggedIn(true);
      setActivePage('home');
      showToast(`ยินดีต้อนรับเพื่อนใหม่ ${user.name || 'นักศึกษา มธ.'} เข้าสู่ TUlonely! 🥳✨`);
      return user;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลงทะเบียน';
      console.error('[AppContext] Registration failed:', err);
      showToast(`❌ ${errMsg}`);
      throw err;
    }
  };

  const logout = () => {
    authService.logout().catch((err) => console.warn('[AppContext] Logout error:', err));
    setIsLoggedIn(false);
    setActivePage('auth');
    showToast('ออกจากระบบเรียบร้อยแล้ว');
  };

  // Recalculate room statuses periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setRooms((prev) =>
        prev.map((r) => {
          const newStatus = calculateRoomStatus(r);
          if (newStatus !== r.status) {
            return { ...r, status: newStatus };
          }
          return r;
        })
      );
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  // Actions
  const createRoom = async (
    newRoomData: Omit<
      Room,
      'id' | 'createdAt' | 'status' | 'chatMessages' | 'viewsCount' | 'creator' | 'participants'
    >
  ): Promise<string> => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      showToast('กรุณาลงทะเบียนหรือเข้าสู่ระบบก่อนสร้างห้องหาเพื่อน 🎓');
      return '';
    }

    try {
      // Direct Supabase persistence with roomService
      const created = await roomService.createRoom(newRoomData, currentUser);

      setRooms((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);

      // Update user's favorite or created rooms list
      setCurrentUser((prev) => ({
        ...prev,
        favoriteRooms: [...prev.favoriteRooms, created.id],
      }));

      showToast('สร้างห้องสำเร็จและบันทึกข้อมูลเข้าสู่ Supabase เรียบร้อยแล้ว! 🎉');
      return created.id;
    } catch (err) {
      console.error('[AppContext] createRoom service error:', err);

      // Fallback local creation if an unexpected crash occurs
      const newId = `room-${Date.now()}`;
      const fallbackRoom: Room = {
        ...newRoomData,
        id: newId,
        creator: {
          id: currentUser.id,
          name: currentUser.name,
          studentId: currentUser.studentId,
          faculty: currentUser.faculty,
          avatar: currentUser.avatar,
          bio: currentUser.bio,
        },
        participants: [
          {
            id: currentUser.id,
            name: currentUser.name,
            studentId: currentUser.studentId,
            faculty: currentUser.faculty,
            avatar: currentUser.avatar,
            joinedAt: 'เมื่อสักครู่',
            isHost: true,
          },
        ],
        createdAt: new Date().toISOString(),
        viewsCount: 1,
        chatMessages: [],
        status: 'open',
      };
      setRooms((prev) => [fallbackRoom, ...prev]);
      showToast('สร้างห้องเรียบร้อย (บันทึกข้อมูลในเครื่อง) ✨');
      return newId;
    }
  };

  const updateRoom = async (roomId: string, updates: Partial<Room>): Promise<boolean> => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      showToast('กรุณาเข้าสู่ระบบก่อนแก้ไขข้อมูลบอร์ด');
      return false;
    }

    try {
      const maxPart = updates.maxParticipants ?? editingRoom?.maxParticipants;
      setRooms((prev) =>
        prev.map((r) => {
          if (r.id === roomId) {
            const updated = {
              ...r,
              ...updates,
              maxParticipants: maxPart ?? r.maxParticipants,
              maxParticipant: maxPart ?? r.maxParticipant ?? r.maxParticipants,
            };
            return {
              ...updated,
              status: calculateRoomStatus(updated),
            };
          }
          return r;
        })
      );

      await roomService.updateRoom(roomId, updates);
      showToast('แก้ไขข้อมูลบอร์ดเรียบร้อยแล้ว ✨');
      closeEditRoomModal();
      return true;
    } catch (err) {
      console.error('[AppContext] updateRoom error:', err);
      showToast('เกิดข้อผิดพลาดในการแก้ไขบอร์ด กรุณาลองใหม่อีกครั้ง');
      return false;
    }
  };

  const deleteRoom = (roomId: string) => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      showToast('กรุณาเข้าสู่ระบบก่อน');
      return;
    }
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    roomService
      .deleteRoom(roomId)
      .catch((err) => console.warn('[AppContext] deleteRoom service error:', err));
    showToast('ลบห้องเรียบร้อยแล้ว');
    if (selectedRoomId === roomId) {
      setActivePage('find-friends');
      setSelectedRoomId(null);
    }
  };

  const joinRoom = (roomId: string): boolean => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      showToast('กรุณาลงทะเบียนหรือเข้าสู่ระบบนักศึกษาก่อนเข้าร่วมห้อง 🎓');
      return false;
    }

    const room = rooms.find((r) => isRoomMatch(r.id, roomId));
    if (!room) return false;

    // Check if already in
    const isAlreadyMember = room.participants.some((p) => p.id === currentUser.id);
    if (isAlreadyMember) {
      showToast('คุณอยู่ในห้องนี้เรียบร้อยแล้ว');
      return true;
    }

    if (room.participants.length >= room.maxParticipants) {
      showToast('ขออภัย ห้องนี้สมาชิกเต็มแล้ว');
      return false;
    }

    const currentStatus = calculateRoomStatus(room);
    if (currentStatus === 'expired') {
      showToast('ขออภัย ห้องนี้หมดเวลารับสมาชิกแล้ว');
      return false;
    }

    const newParticipant = {
      id: currentUser.id,
      name: currentUser.name,
      studentId: currentUser.studentId,
      faculty: currentUser.faculty,
      avatar: currentUser.avatar,
      joinedAt: 'เมื่อสักครู่',
      isHost: false,
    };

    const pMap = new Map<string, Participant>();
    (room.participants || []).forEach((p) => pMap.set(p.id, p));
    pMap.set(newParticipant.id, newParticipant);
    const updatedParticipants = Array.from(pMap.values());

    const joinSystemMessage: ChatMessage = {
      id: `sys-${Date.now()}`,
      senderId: 'system',
      senderName: 'ระบบ TUlonely',
      senderAvatar: '',
      text: `🎉 ${currentUser.name} (${currentUser.faculty}) ได้เข้าร่วมห้องแล้ว!`,
      timestamp: 'เมื่อสักครู่',
      isSystem: true,
    };

    const updatedMessages = [...(room.chatMessages || []), joinSystemMessage];

    saveRoomExtra(room.id, {
      participants: updatedParticipants,
      chatMessages: updatedMessages,
    });
    if (roomId !== room.id) {
      saveRoomExtra(roomId, {
        participants: updatedParticipants,
        chatMessages: updatedMessages,
      });
    }

    setRooms((prev) =>
      prev.map((r) => {
        if (isRoomMatch(r.id, roomId)) {
          const updated = {
            ...r,
            participants: updatedParticipants,
            chatMessages: updatedMessages,
          };
          return {
            ...updated,
            status: calculateRoomStatus(updated),
          };
        }
        return r;
      })
    );

    // Call roomService to persist join
    roomService
      .joinRoom(room.id, currentUser)
      .catch((err) => console.warn('[AppContext] joinRoom service error:', err));

    // Add notification for creator if not self
    if (room.creator.id !== currentUser.id) {
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        type: 'join',
        title: 'มีเพื่อนใหม่เข้าร่วมห้อง! 🥳',
        description: `${currentUser.name} ได้เข้าร่วมห้อง "${room.title}"`,
        time: 'เมื่อสักครู่',
        read: false,
        targetRoomId: room.id,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

    showToast(`ยินดีต้อนรับเข้าสู่ห้อง "${room.title}" 🥳`);
    return true;
  };

  const leaveRoom = (roomId: string) => {
    const room = rooms.find((r) => isRoomMatch(r.id, roomId));
    if (!room) return;

    const updatedParticipants = room.participants.filter((p) => p.id !== currentUser.id);

    const leaveMessage: ChatMessage = {
      id: `sys-leave-${Date.now()}`,
      senderId: 'system',
      senderName: 'ระบบ TUlonely',
      senderAvatar: '',
      text: `👋 ${currentUser.name} ได้ออกจากห้อง`,
      timestamp: 'เมื่อสักครู่',
      isSystem: true,
    };

    const updatedMessages = [...(room.chatMessages || []), leaveMessage];

    saveRoomExtra(room.id, {
      participants: updatedParticipants,
      chatMessages: updatedMessages,
    });
    if (roomId !== room.id) {
      saveRoomExtra(roomId, {
        participants: updatedParticipants,
        chatMessages: updatedMessages,
      });
    }

    setRooms((prev) =>
      prev.map((r) => {
        if (isRoomMatch(r.id, roomId)) {
          const updated = {
            ...r,
            participants: updatedParticipants,
            chatMessages: updatedMessages,
          };
          return {
            ...updated,
            status: calculateRoomStatus(updated),
          };
        }
        return r;
      })
    );

    // Call roomService to persist leave
    roomService
      .leaveRoom(room.id, currentUser.id, currentUser.name)
      .catch((err) => console.warn('[AppContext] leaveRoom service error:', err));

    showToast('ออกจากห้องเรียบร้อยแล้ว');
  };

  const sendChatMessage = (
    roomId: string,
    text: string,
    sticker?: string,
    replyTo?: { id: string; name: string }
  ) => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      showToast('กรุณาลงทะเบียนหรือเข้าสู่ระบบก่อนแสดงความคิดเห็น 💬');
      return;
    }

    if (!text.trim() && !sticker) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderFaculty: currentUser.faculty,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
      sticker,
      replyToId: replyTo?.id,
      replyToName: replyTo?.name,
      likesCount: 0,
      likedBy: [],
    };

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            chatMessages: [...r.chatMessages, newMsg],
          };
        }
        return r;
      })
    );

    // Call chatService
    chatService
      .sendMessage(roomId, {
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        senderFaculty: currentUser.faculty,
        text: text.trim(),
        sticker,
        replyToId: replyTo?.id,
        replyToName: replyTo?.name,
      })
      .catch((err) => console.warn('[AppContext] sendChatMessage service error:', err));
  };

  const deleteChatMessage = (roomId: string, messageId: string) => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      showToast('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          const updatedMessages = (r.chatMessages || []).filter(
            (m) => m.id !== messageId && m.replyToId !== messageId
          );
          saveRoomExtra(roomId, { chatMessages: updatedMessages });
          return {
            ...r,
            chatMessages: updatedMessages,
          };
        }
        return r;
      })
    );

    chatService
      .deleteMessage(roomId, messageId)
      .catch((err) => console.warn('[AppContext] deleteChatMessage service error:', err));

    showToast('ลบความคิดเห็นเรียบร้อยแล้ว 🗑️');
  };

  const toggleCommentLike = (roomId: string, commentId: string) => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      showToast('กรุณาเข้าสู่ระบบก่อนกดถูกใจความคิดเห็น');
      return;
    }

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          const updatedMessages = r.chatMessages.map((msg) => {
            if (msg.id === commentId) {
              const likedBy = msg.likedBy || [];
              const alreadyLiked = likedBy.includes(currentUser.id);
              const newLikedBy = alreadyLiked
                ? likedBy.filter((id) => id !== currentUser.id)
                : [...likedBy, currentUser.id];
              return {
                ...msg,
                likedBy: newLikedBy,
                likesCount: newLikedBy.length,
              };
            }
            return msg;
          });
          return { ...r, chatMessages: updatedMessages };
        }
        return r;
      })
    );

    chatService
      .toggleLikeComment(roomId, commentId, currentUser.id)
      .catch((err) => console.warn('[AppContext] toggleCommentLike error:', err));
  };

  const toggleFavoriteRoom = (roomId: string) => {
    setCurrentUser((prev) => {
      const exists = prev.favoriteRooms.includes(roomId);
      const updated = exists
        ? prev.favoriteRooms.filter((id) => id !== roomId)
        : [...prev.favoriteRooms, roomId];
      showToast(exists ? 'นำออกจากรายการบันทึกแล้ว' : 'บันทึกห้องนี้ไว้แล้ว 💗');
      return { ...prev, favoriteRooms: updated };
    });

    roomService
      .toggleFavoriteRoom(roomId, currentUser.id)
      .catch((err) => console.warn('[AppContext] toggleFavoriteRoom service error:', err));
  };

  const toggleFavoriteActivity = (actId: string) => {
    setCurrentUser((prev) => {
      const exists = prev.favoriteActivities.includes(actId);
      const updated = exists
        ? prev.favoriteActivities.filter((id) => id !== actId)
        : [...prev.favoriteActivities, actId];
      showToast(exists ? 'นำกิจกรรมออกจากรายการบันทึก' : 'บันทึกกิจกรรมนี้ไว้แล้ว ⭐');
      return { ...prev, favoriteActivities: updated };
    });

    activityService
      .toggleFavoriteActivity(actId, currentUser.id)
      .catch((err) => console.warn('[AppContext] toggleFavoriteActivity service error:', err));
  };

  const updateUserProfile = (updated: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({ ...prev, ...updated }));
    authService
      .updateProfile(updated)
      .catch((err) => console.warn('[AppContext] updateUserProfile service error:', err));
    showToast('อัปเดตข้อมูลโปรไฟล์เรียบร้อย ✨');
  };

  const markNotificationAsRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('อ่านการแจ้งเตือนทั้งหมดแล้ว');
  };

  const submitReport = (report: ReportPayload) => {
    console.log('Report submitted:', report);
    setIsReportModalOpen(false);
    setReportTarget(null);
    showToast('ได้รับรายงานของคุณแล้ว ขอบคุณที่ช่วยดูแลคอมมูนิตี้ มธ. 🙏');
  };

  // Nav helpers
  const navigateToRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    navigate(`/rooms/${roomId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (cat: CategoryType) => {
    setSelectedCategory(cat);
    if (cat === 'university') {
      navigate('/activities');
    } else if (cat === 'food') {
      navigate('/eating');
    } else {
      navigate(`/${cat}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToActivityRooms = (actId: string) => {
    setSelectedActivityId(actId);
    navigate(`/activities/${actId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCreateRoomFlow = (category?: CategoryType, activity?: UniversityActivity) => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      showToast('กรุณาลงทะเบียนหรือเข้าสู่ระบบก่อนสร้างห้องหาเพื่อน 🎓');
      return;
    }

    if (activity) {
      setPreselectedActivityForRoom(activity);
      setPreselectedCategoryForRoom('university');
    } else if (category) {
      setPreselectedCategoryForRoom(category);
      setPreselectedActivityForRoom(null);
    } else {
      setPreselectedCategoryForRoom(null);
      setPreselectedActivityForRoom(null);
    }
    setIsCreateModalOpen(true);
  };

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        selectedCategory,
        setSelectedCategory,
        selectedRoomId,
        setSelectedRoomId,
        selectedActivityId,
        setSelectedActivityId,
        searchQuery,
        setSearchQuery,
        selectedTagFilter,
        setSelectedTagFilter,
        rooms,
        isLoadingRooms,
        roomsError,
        refreshRooms,
        universityActivities,
        currentUser,
        notifications,
        unreadNotifCount,
        isCreateModalOpen,
        setIsCreateModalOpen,
        preselectedActivityForRoom,
        setPreselectedActivityForRoom,
        preselectedCategoryForRoom,
        setPreselectedCategoryForRoom,
        isReportModalOpen,
        setIsReportModalOpen,
        reportTarget,
        setReportTarget,
        isNotifDrawerOpen,
        setIsNotifDrawerOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        editingRoom,
        setEditingRoom,
        openEditRoomModal,
        closeEditRoomModal,
        isLoggedIn,
        setIsLoggedIn,
        login,
        register,
        logout,
        createRoom,
        updateRoom,
        deleteRoom,
        joinRoom,
        leaveRoom,
        sendChatMessage,
        deleteChatMessage,
        toggleCommentLike,
        toggleFavoriteRoom,
        toggleFavoriteActivity,
        updateUserProfile,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        submitReport,
        navigateToRoom,
        navigateToCategory,
        navigateToActivityRooms,
        openCreateRoomFlow,
        toastMessage,
        showToast,
        realtimeStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
