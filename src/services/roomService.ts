import { Room, CategoryType, UserProfile, Participant, ChatMessage } from '../types';
import { INITIAL_ROOMS } from '../data/mockData';
import { calculateRoomStatus } from '../utils/helpers';
import { apiClient } from './apiClient';
import { getLocalUser, saveLocalUser } from './authService';

const ROOMS_STORAGE_KEY = 'tulonely_rooms';

export interface RoomFilterParams {
  category?: CategoryType | 'all';
  search?: string;
  tag?: string;
  campus?: string;
  activityId?: string;
}

/**
 * Get all rooms from localStorage, initialized with INITIAL_ROOMS if empty
 */
export const getLocalRooms = (): Room[] => {
  try {
    const raw = localStorage.getItem(ROOMS_STORAGE_KEY);
    if (raw) {
      const parsed: Room[] = JSON.parse(raw);
      return parsed.map((r) => ({
        ...r,
        status: calculateRoomStatus(r),
      }));
    }
  } catch (err) {
    console.warn('[roomService] Failed to parse local rooms:', err);
  }

  // Initial seeding
  const seeded = INITIAL_ROOMS.map((r) => ({
    ...r,
    status: calculateRoomStatus(r),
  }));
  saveLocalRooms(seeded);
  return seeded;
};

/**
 * Save rooms array to localStorage
 */
export const saveLocalRooms = (rooms: Room[]): void => {
  try {
    localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
  } catch (err) {
    console.warn('[roomService] Failed to save local rooms:', err);
  }
};

/**
 * Room Service
 */
export const roomService = {
  /**
   * Fetch rooms with optional filters
   */
  async getRooms(filters?: RoomFilterParams): Promise<Room[]> {
    const queryParams = new URLSearchParams();
    if (filters?.category && filters.category !== 'all') {
      queryParams.set('category', filters.category);
    }
    if (filters?.search) {
      queryParams.set('search', filters.search);
    }
    if (filters?.tag) {
      queryParams.set('tag', filters.tag);
    }
    if (filters?.campus) {
      queryParams.set('campus', filters.campus);
    }
    if (filters?.activityId) {
      queryParams.set('activityId', filters.activityId);
    }

    const endpoint = `/rooms${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return apiClient.get<Room[]>(endpoint, () => {
      let result = getLocalRooms();

      if (filters?.category && filters.category !== 'all') {
        result = result.filter((r) => r.category === filters.category);
      }
      if (filters?.activityId) {
        result = result.filter((r) => r.universityActivityId === filters.activityId);
      }
      if (filters?.tag) {
        result = result.filter((r) => r.tags.includes(filters.tag!));
      }
      if (filters?.campus) {
        result = result.filter((r) => r.campus === filters.campus);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.location.toLowerCase().includes(q) ||
            r.tags.some((t) => t.toLowerCase().includes(q))
        );
      }

      return result;
    });
  },

  /**
   * Get single room details by ID
   */
  async getRoomById(id: string): Promise<Room | null> {
    return apiClient.get<Room | null>(`/rooms/${id}`, () => {
      const rooms = getLocalRooms();
      const match = rooms.find((r) => r.id === id);
      return match || null;
    });
  },

  /**
   * Create a new room
   */
  async createRoom(
    newRoomData: Omit<
      Room,
      'id' | 'createdAt' | 'status' | 'chatMessages' | 'viewsCount' | 'creator' | 'participants'
    >,
    creator: UserProfile
  ): Promise<Room> {
    return apiClient.post<Room>('/rooms', { ...newRoomData, creatorId: creator.id }, () => {
      const rooms = getLocalRooms();
      const newId = `room-${Date.now()}`;

      const initialParticipants: Participant[] = [
        {
          id: creator.id,
          name: creator.name,
          studentId: creator.studentId,
          faculty: creator.faculty,
          avatar: creator.avatar,
          joinedAt: 'เมื่อสักครู่',
          isHost: true,
        },
      ];

      const initialChatMessage: ChatMessage = {
        id: `msg-init-${Date.now()}`,
        senderId: creator.id,
        senderName: creator.name,
        senderAvatar: creator.avatar,
        text: `สวัสดีทุกคน! ห้อง "${newRoomData.title}" เปิดรับเพื่อนแล้วครับ ทักทายพูดคุยกันได้เลย ✨`,
        timestamp: 'เมื่อสักครู่',
      };

      const newRoom: Room = {
        ...newRoomData,
        id: newId,
        creator: {
          id: creator.id,
          name: creator.name,
          studentId: creator.studentId,
          faculty: creator.faculty,
          avatar: creator.avatar,
          bio: creator.bio,
        },
        participants: initialParticipants,
        createdAt: new Date().toISOString(),
        viewsCount: 1,
        chatMessages: [initialChatMessage],
        status: 'open',
      };

      newRoom.status = calculateRoomStatus(newRoom);
      const updatedRooms = [newRoom, ...rooms];
      saveLocalRooms(updatedRooms);

      // Add to creator's favorite rooms
      const user = getLocalUser();
      if (!user.favoriteRooms.includes(newId)) {
        saveLocalUser({
          ...user,
          favoriteRooms: [...user.favoriteRooms, newId],
        });
      }

      return newRoom;
    });
  },

  /**
   * Delete a room by ID
   */
  async deleteRoom(roomId: string): Promise<void> {
    return apiClient.delete<void>(`/rooms/${roomId}`, () => {
      const rooms = getLocalRooms();
      const updated = rooms.filter((r) => r.id !== roomId);
      saveLocalRooms(updated);
    });
  },

  /**
   * Join an existing room
   */
  async joinRoom(
    roomId: string,
    user: UserProfile
  ): Promise<{ room: Room; success: boolean; message?: string }> {
    return apiClient.post<{ room: Room; success: boolean; message?: string }>(
      `/rooms/${roomId}/join`,
      { userId: user.id },
      () => {
        const rooms = getLocalRooms();
        const roomIndex = rooms.findIndex((r) => r.id === roomId);

        if (roomIndex === -1) {
          throw new Error('ไม่พบห้องที่ต้องการเข้าร่วม');
        }

        const room = rooms[roomIndex];

        if (room.participants.some((p) => p.id === user.id)) {
          return { room, success: true, message: 'คุณอยู่ในห้องนี้เรียบร้อยแล้ว' };
        }

        if (room.participants.length >= room.maxParticipants) {
          return { room, success: false, message: 'ขออภัย ห้องนี้สมาชิกเต็มแล้ว' };
        }

        const currentStatus = calculateRoomStatus(room);
        if (currentStatus === 'expired') {
          return { room, success: false, message: 'ขออภัย ห้องนี้หมดเวลารับสมาชิกแล้ว' };
        }

        const newParticipant: Participant = {
          id: user.id,
          name: user.name,
          studentId: user.studentId,
          faculty: user.faculty,
          avatar: user.avatar,
          joinedAt: 'เมื่อสักครู่',
          isHost: false,
        };

        const joinSystemMessage: ChatMessage = {
          id: `sys-${Date.now()}`,
          senderId: 'system',
          senderName: 'ระบบ TUlonely',
          senderAvatar: '',
          text: `🎉 ${user.name} (${user.faculty}) ได้เข้าร่วมห้องแล้ว!`,
          timestamp: 'เมื่อสักครู่',
          isSystem: true,
        };

        const updatedRoom: Room = {
          ...room,
          participants: [...room.participants, newParticipant],
          chatMessages: [...room.chatMessages, joinSystemMessage],
        };
        updatedRoom.status = calculateRoomStatus(updatedRoom);

        rooms[roomIndex] = updatedRoom;
        saveLocalRooms(rooms);

        return { room: updatedRoom, success: true };
      }
    );
  },

  /**
   * Leave a room
   */
  async leaveRoom(
    roomId: string,
    userId: string,
    userName = 'เพื่อนร่วมห้อง'
  ): Promise<Room | null> {
    return apiClient.post<Room | null>(
      `/rooms/${roomId}/leave`,
      { userId },
      () => {
        const rooms = getLocalRooms();
        const roomIndex = rooms.findIndex((r) => r.id === roomId);

        if (roomIndex === -1) return null;

        const room = rooms[roomIndex];
        const updatedParticipants = room.participants.filter((p) => p.id !== userId);

        const leaveMessage: ChatMessage = {
          id: `sys-leave-${Date.now()}`,
          senderId: 'system',
          senderName: 'ระบบ TUlonely',
          senderAvatar: '',
          text: `👋 ${userName} ได้ออกจากห้อง`,
          timestamp: 'เมื่อสักครู่',
          isSystem: true,
        };

        const updatedRoom: Room = {
          ...room,
          participants: updatedParticipants,
          chatMessages: [...room.chatMessages, leaveMessage],
        };
        updatedRoom.status = calculateRoomStatus(updatedRoom);

        rooms[roomIndex] = updatedRoom;
        saveLocalRooms(rooms);
        return updatedRoom;
      }
    );
  },

  /**
   * Toggle favorite/saved room for user
   */
  async toggleFavoriteRoom(roomId: string, _userId: string): Promise<string[]> {
    return apiClient.post<string[]>(
      `/rooms/${roomId}/favorite`,
      {},
      () => {
        const user = getLocalUser();
        const exists = user.favoriteRooms.includes(roomId);
        const updatedFavorites = exists
          ? user.favoriteRooms.filter((id) => id !== roomId)
          : [...user.favoriteRooms, roomId];

        saveLocalUser({
          ...user,
          favoriteRooms: updatedFavorites,
        });

        return updatedFavorites;
      }
    );
  },
};
