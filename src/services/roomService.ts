import { Room, CategoryType, UserProfile, Participant, ChatMessage } from '../types';
import { INITIAL_ROOMS } from '../data/mockData';
import { calculateRoomStatus } from '../utils/helpers';
import { apiClient } from './apiClient';
import { getLocalUser, saveLocalUser } from './authService';
import { supabase, isSupabaseConfigured } from './supabaseClient';

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
    console.warn('[roomService] Error reading local rooms:', err);
  }
  return INITIAL_ROOMS;
};

/**
 * Save rooms array to localStorage
 */
export const saveLocalRooms = (rooms: Room[]): void => {
  try {
    localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
  } catch (err) {
    console.warn('[roomService] Error saving local rooms:', err);
  }
};

/**
 * Helper to map Supabase database row to Room object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapSupabaseRowToRoom = (row: any): Room => {
  const room: Room = {
    id: String(row.id),
    title: row.title || '',
    description: row.description || '',
    category: row.category || 'entertainment',
    universityActivityId: row.university_activity_id || row.universityActivityId,
    universityActivityTitle: row.university_activity_title || row.universityActivityTitle,
    creator: row.creator || {
      id: 'unknown',
      name: 'นักศึกษา มธ.',
      studentId: '660965xxxx',
      faculty: 'ธรรมศาสตร์',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: '',
    },
    eventDateTime: row.event_date_time || row.eventDateTime,
    activityDate:
      row.activity_date ||
      (row.event_date_time ? String(row.event_date_time).split('T')[0] : ''),
    activityTime:
      row.activity_time ||
      (row.event_date_time && String(row.event_date_time).includes('T')
        ? String(row.event_date_time).split('T')[1].substring(0, 5)
        : '17:00'),
    location: row.location || '',
    campus: row.campus || 'ศูนย์รังสิต',
    tags: Array.isArray(row.tags) ? row.tags : [],
    maxParticipant: Number(row.max_participant || row.max_participants || row.maxParticipants || 4),
    maxParticipants: Number(row.max_participant || row.max_participants || row.maxParticipants || 4),
    participants: Array.isArray(row.participants) ? row.participants : [],
    recruitmentDeadline: row.recruitment_deadline || row.recruitmentDeadline || new Date().toISOString(),
    recruitmentOption: row.recruitment_option || row.recruitmentOption || 'datetime',
    recruitmentHours: row.recruitment_hours || row.recruitmentHours,
    status: row.status || 'open',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    chatMessages: Array.isArray(row.chat_messages)
      ? row.chat_messages
      : Array.isArray(row.chatMessages)
        ? row.chatMessages
        : [],
    viewsCount: Number(row.views_count || row.viewsCount || 0),
  };
  room.status = calculateRoomStatus(room);
  return room;
};

/**
 * Helper to map Supabase 'boards' database row to Room object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapBoardRowToRoom = (row: any): Room => {
  const catItem = row.category_items;
  const categoryRaw = (catItem?.categories?.category_name || '').trim().toLowerCase();

  let category: CategoryType = 'other' as CategoryType;
  if (categoryRaw === 'activity' || catItem?.category_id === 2) {
    category = 'activity';
  } else if (categoryRaw === 'restaurants' || categoryRaw === 'food' || catItem?.category_id === 4) {
    category = 'restaurants';
  } else if (categoryRaw.includes('sports') || catItem?.category_id === 3) {
    category = 'sports';
  } else if (categoryRaw.includes('study') || catItem?.category_id === 5) {
    category = 'study';
  } else if (categoryRaw === 'entertainment' || catItem?.category_id === 1) {
    category = 'entertainment';
  }

  const profile = row.profile;
  const creatorName = profile?.user_name || profile?.real_name || 'นักศึกษา มธ.';
  const studentId = profile?.student_id || '681074xxxx';
  const facultyName = profile?.faculty_name || 'มหาวิทยาลัยธรรมศาสตร์';

  const dateStr = row.event_date_time ? String(row.event_date_time).split('T')[0] : '';
  const timeStr =
    row.event_date_time && String(row.event_date_time).includes('T')
      ? String(row.event_date_time).split('T')[1].substring(0, 5)
      : '17:00';

  const tagName = catItem?.item_name || '';
  const formattedTag = tagName ? (tagName.startsWith('#') ? tagName : `#${tagName}`) : '#หาเพื่อน';

  const room: Room = {
    id: `board-${row.id}`,
    boardId: Number(row.id),
    title: row.title || '',
    description: row.description || '',
    category,
    categoryId: catItem?.category_id ? Number(catItem.category_id) : undefined,
    categoryItemId: row.category_item_id ? Number(row.category_item_id) : undefined,
    universityActivityId: catItem?.category_id === 2 ? `univ-${catItem.id}` : undefined,
    universityActivityTitle: catItem?.category_id === 2 ? catItem.item_name : undefined,
    creator: {
      id: row.user_id || 'unknown',
      name: creatorName,
      studentId: studentId,
      faculty: facultyName,
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: profile?.bio || '',
    },
    eventDateTime: row.event_date_time,
    activityDate: dateStr,
    activityTime: timeStr,
    location: row.location || '',
    campus: 'ศูนย์รังสิต',
    tags: [formattedTag],
    maxParticipant: Number(row.max_participant || 4),
    maxParticipants: Number(row.max_participant || 4),
    participants: [
      {
        id: row.user_id || 'creator',
        name: creatorName,
        studentId: studentId,
        faculty: facultyName,
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        joinedAt: 'เมื่อสักครู่',
        isHost: true,
      },
    ],
    recruitmentDeadline: new Date(
      new Date(row.created_date || Date.now()).getTime() + 12 * 60 * 60 * 1000
    ).toISOString(),
    recruitmentOption: 'hours',
    recruitmentHours: 12,
    status: 'open',
    createdAt: row.created_date || new Date().toISOString(),
    chatMessages: [],
    viewsCount: 1,
  };

  room.status = calculateRoomStatus(room);
  return room;
};

/**
 * Helper to map Room object to Supabase database row
 */
const mapRoomToSupabaseRow = (room: Room) => {
  const eventDateTime =
    room.eventDateTime ||
    (room.activityDate && room.activityTime ? `${room.activityDate}T${room.activityTime}:00` : null);

  return {
    id: room.id,
    title: room.title,
    description: room.description,
    category: room.category,
    category_id: room.categoryId || null,
    university_activity_id: room.universityActivityId || null,
    university_activity_title: room.universityActivityTitle || null,
    creator: room.creator,
    event_date_time: eventDateTime,
    activity_date: room.activityDate,
    activity_time: room.activityTime,
    location: room.location,
    campus: room.campus,
    tags: room.tags,
    max_participant: room.maxParticipant || room.maxParticipants,
    max_participants: room.maxParticipants,
    participants: room.participants,
    recruitment_deadline: room.recruitmentDeadline,
    recruitment_option: room.recruitmentOption,
    recruitment_hours: room.recruitmentHours || null,
    status: room.status,
    created_at: room.createdAt,
    chat_messages: room.chatMessages,
    views_count: room.viewsCount || 0,
  };
};

/**
 * Room Management Service with Supabase & Local Fallback
 */
export const roomService = {
  /**
   * Fetch all rooms with optional filters
   */
  async getRooms(filters?: RoomFilterParams): Promise<Room[]> {
    if (isSupabaseConfigured) {
      try {
        // 1. Try querying from Supabase 'boards' table (with relations)
        const { data: boardData, error: boardError } = await supabase
          .from('boards')
          .select(`
            *,
            category_items (
              id,
              item_name,
              category_id,
              categories (
                id,
                category_name
              )
            ),
            profile (
              id,
              student_id,
              real_name,
              user_name,
              faculty_id,
              bio
            )
          `)
          .order('created_date', { ascending: false });

        if (!boardError && boardData && boardData.length > 0) {
          let mappedRooms = boardData.map(mapBoardRowToRoom);

          if (filters?.category && filters.category !== 'all') {
            mappedRooms = mappedRooms.filter((r) => r.category === filters.category);
          }
          if (filters?.tag) {
            mappedRooms = mappedRooms.filter((r) => r.tags.includes(filters.tag!));
          }
          if (filters?.search) {
            const q = filters.search.toLowerCase();
            mappedRooms = mappedRooms.filter(
              (r) =>
                r.title.toLowerCase().includes(q) ||
                r.description.toLowerCase().includes(q) ||
                r.location.toLowerCase().includes(q) ||
                r.tags.some((t) => t.toLowerCase().includes(q))
            );
          }

          // Cache and merge with local
          const localRooms = getLocalRooms();
          const combined = [
            ...mappedRooms,
            ...localRooms.filter((lr) => !mappedRooms.some((mr) => mr.id === lr.id)),
          ];
          saveLocalRooms(combined);
          return combined;
        }

        // 2. Fallback query from 'rooms' table if configured
        let query = supabase.from('rooms').select('*').order('created_at', { ascending: false });

        if (filters?.category && filters.category !== 'all') {
          query = query.eq('category', filters.category);
        }
        if (filters?.activityId) {
          query = query.eq('university_activity_id', filters.activityId);
        }
        if (filters?.campus) {
          query = query.eq('campus', filters.campus);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          let mappedRooms = data.map(mapSupabaseRowToRoom);

          if (filters?.tag) {
            mappedRooms = mappedRooms.filter((r) => r.tags.includes(filters.tag!));
          }
          if (filters?.search) {
            const q = filters.search.toLowerCase();
            mappedRooms = mappedRooms.filter(
              (r) =>
                r.title.toLowerCase().includes(q) ||
                r.description.toLowerCase().includes(q) ||
                r.location.toLowerCase().includes(q) ||
                r.tags.some((t) => t.toLowerCase().includes(q))
            );
          }

          // Cache locally for offline resilience
          saveLocalRooms(mappedRooms);
          return mappedRooms;
        }
      } catch (sbErr) {
        console.warn('[roomService] Supabase getRooms query failed, using local rooms:', sbErr);
      }
    }

    // Backend API / Local fallback
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
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('rooms').select('*').eq('id', id).single();
        if (!error && data) {
          return mapSupabaseRowToRoom(data);
        }
      } catch (err) {
        console.warn('[roomService] Supabase getRoomById failed:', err);
      }
    }

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

    // Save to Supabase (primary table: 'boards', fallback: 'rooms')
    if (isSupabaseConfigured) {
      try {
        // 1. Resolve Supabase Auth User ID
        let authUserId: string | null = null;
        try {
          const {
            data: { user: sbUser },
          } = await supabase.auth.getUser();
          if (sbUser?.id) {
            authUserId = sbUser.id;
          }
        } catch {
          // ignore
        }

        // If no active auth session, check if creator.id is a valid UUID
        if (
          !authUserId &&
          creator?.id &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(creator.id)
        ) {
          authUserId = creator.id;
        }

        // Format event_date_time as valid ISO string with timezone
        let isoDateTime: string | null = null;
        if (newRoom.activityDate) {
          const timeStr = newRoom.activityTime || '17:00';
          try {
            isoDateTime = new Date(`${newRoom.activityDate}T${timeStr}:00`).toISOString();
          } catch {
            isoDateTime = `${newRoom.activityDate}T${timeStr}:00+07:00`;
          }
        } else if (newRoom.eventDateTime) {
          isoDateTime = newRoom.eventDateTime;
        }

        // 2. Prepare payload for Supabase 'boards' table
        const boardPayload: Record<string, unknown> = {
          title: newRoom.title.trim(),
          description: newRoom.description?.trim() || '',
          location: newRoom.location.trim(),
          event_date_time: isoDateTime,
          max_participant: Number(newRoom.maxParticipant || newRoom.maxParticipants || 4),
          category_item_id: newRoom.categoryItemId || null,
          created_date: new Date().toISOString(),
        };

        if (authUserId) {
          boardPayload.user_id = authUserId;
        }

        console.log('[roomService] Inserting into Supabase boards table:', boardPayload);

        const { data: boardData, error: boardError } = await supabase
          .from('boards')
          .insert(boardPayload)
          .select()
          .single();

        if (!boardError && boardData) {
          console.log('[roomService] Successfully created board in Supabase:', boardData);
          newRoom.boardId = Number(boardData.id);
          newRoom.id = `board-${boardData.id}`;

          // Also insert host into participants table if user_id is available
          if (authUserId) {
            try {
              await supabase.from('participants').insert({
                user_id: authUserId,
                board_id: boardData.id,
              });
            } catch (partErr) {
              console.warn('[roomService] Could not insert host into participants table:', partErr);
            }
          }
        } else if (boardError) {
          console.warn('[roomService] Supabase boards table insert note:', boardError.message);
          // If table 'rooms' also exists, try fallback
          try {
            await supabase.from('rooms').insert(mapRoomToSupabaseRow(newRoom));
          } catch {
            // ignore
          }
        }
      } catch (sbErr) {
        console.warn('[roomService] Failed to insert room to Supabase, saving locally:', sbErr);
      }
    }

    // Always update local cache & state
    const rooms = getLocalRooms();
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
  },

  /**
   * Delete a room by ID
   */
  async deleteRoom(roomId: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        if (roomId.startsWith('board-')) {
          const boardIdNum = Number(roomId.replace('board-', ''));
          if (!isNaN(boardIdNum)) {
            await supabase.from('boards').delete().eq('id', boardIdNum);
          }
        }
        await supabase.from('rooms').delete().eq('id', roomId);
      } catch (err) {
        console.warn('[roomService] Failed to delete from Supabase:', err);
      }
    }

    return apiClient.delete<void>(`/rooms/${roomId}`, () => {
      const rooms = getLocalRooms();
      const updated = rooms.filter((r) => r.id !== roomId);
      saveLocalRooms(updated);
    });
  },

  /**
   * Update an existing room/board by ID
   */
  async updateRoom(roomId: string, updates: Partial<Room>): Promise<Room | null> {
    if (isSupabaseConfigured) {
      try {
        let isoDateTime: string | undefined = undefined;
        if (updates.activityDate) {
          const timeStr = updates.activityTime || '17:00';
          try {
            isoDateTime = new Date(`${updates.activityDate}T${timeStr}:00`).toISOString();
          } catch {
            isoDateTime = `${updates.activityDate}T${timeStr}:00+07:00`;
          }
        } else if (updates.eventDateTime) {
          isoDateTime = updates.eventDateTime;
        }

        // 1. Update Supabase 'boards' table if it corresponds to a board
        if (roomId.startsWith('board-') || updates.boardId) {
          const boardIdNum = updates.boardId || Number(roomId.replace('board-', ''));
          if (!isNaN(boardIdNum)) {
            const boardPayload: Record<string, unknown> = {};
            if (updates.title !== undefined) boardPayload.title = updates.title.trim();
            if (updates.description !== undefined) boardPayload.description = updates.description.trim();
            if (updates.location !== undefined) boardPayload.location = updates.location.trim();
            if (isoDateTime !== undefined) boardPayload.event_date_time = isoDateTime;
            if (updates.maxParticipants !== undefined) {
              boardPayload.max_participant = Number(updates.maxParticipants);
            }
            if (updates.categoryItemId !== undefined) {
              boardPayload.category_item_id = updates.categoryItemId;
            }

            if (Object.keys(boardPayload).length > 0) {
              await supabase.from('boards').update(boardPayload).eq('id', boardIdNum);
            }
          }
        }

        // 2. Also try updating 'rooms' table
        const roomsPayload: Record<string, unknown> = {};
        if (updates.title !== undefined) roomsPayload.title = updates.title.trim();
        if (updates.description !== undefined) roomsPayload.description = updates.description.trim();
        if (updates.category !== undefined) roomsPayload.category = updates.category;
        if (updates.categoryId !== undefined) roomsPayload.category_id = updates.categoryId;
        if (updates.universityActivityId !== undefined) {
          roomsPayload.university_activity_id = updates.universityActivityId;
        }
        if (updates.universityActivityTitle !== undefined) {
          roomsPayload.university_activity_title = updates.universityActivityTitle;
        }
        if (updates.activityDate !== undefined) roomsPayload.activity_date = updates.activityDate;
        if (updates.activityTime !== undefined) roomsPayload.activity_time = updates.activityTime;
        if (isoDateTime !== undefined) roomsPayload.event_date_time = isoDateTime;
        if (updates.location !== undefined) roomsPayload.location = updates.location.trim();
        if (updates.campus !== undefined) roomsPayload.campus = updates.campus;
        if (updates.tags !== undefined) roomsPayload.tags = updates.tags;
        if (updates.maxParticipants !== undefined) {
          roomsPayload.max_participants = Number(updates.maxParticipants);
          roomsPayload.max_participant = Number(updates.maxParticipants);
        }

        if (Object.keys(roomsPayload).length > 0) {
          await supabase.from('rooms').update(roomsPayload).eq('id', roomId);
        }
      } catch (sbErr) {
        console.warn('[roomService] Failed to update room in Supabase:', sbErr);
      }
    }

    return apiClient.put<Room | null>(`/rooms/${roomId}`, updates, () => {
      const rooms = getLocalRooms();
      const roomIndex = rooms.findIndex((r) => r.id === roomId);
      if (roomIndex === -1) return null;

      const current = rooms[roomIndex];
      const maxPart = updates.maxParticipants ?? current.maxParticipants;
      const updatedRoom: Room = {
        ...current,
        ...updates,
        maxParticipants: maxPart,
        maxParticipant: maxPart,
      };
      updatedRoom.status = calculateRoomStatus(updatedRoom);

      rooms[roomIndex] = updatedRoom;
      saveLocalRooms(rooms);
      return updatedRoom;
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
export default roomService;
