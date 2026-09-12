import { ChatMessage } from '../types';
import { apiClient } from './apiClient';
import { getLocalRooms, saveLocalRooms, saveRoomExtra, isRoomMatch } from './roomService';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { realtimeService } from './realtimeService';

export interface SendMessagePayload {
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderFaculty?: string;
  text: string;
  sticker?: string;
  replyToId?: string;
  replyToName?: string;
  replyTo?: {
    id: string;
    name: string;
  };
}

/**
 * Chat Service with Realtime Supabase & Local Fallback
 */
export const chatService = {
  /**
   * Get all chat messages for a specific room
   */
  async getMessages(roomId: string): Promise<ChatMessage[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('chat_messages')
          .eq('id', roomId)
          .single();

        if (!error && data?.chat_messages) {
          return data.chat_messages as ChatMessage[];
        }
      } catch (err) {
        console.warn('[chatService] Supabase getMessages error, using local fallback:', err);
      }
    }

    return apiClient.get<ChatMessage[]>(`/rooms/${roomId}/messages`, () => {
      const rooms = getLocalRooms();
      const room = rooms.find((r) => r.id === roomId);
      return room ? room.chatMessages : [];
    });
  },

  /**
   * Send a new message or comment in room
   */
  async sendChatMessage(roomId: string, payload: SendMessagePayload): Promise<ChatMessage> {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: payload.senderId,
      senderName: payload.senderName,
      senderAvatar: payload.senderAvatar,
      text: payload.text,
      timestamp: 'เมื่อสักครู่',
      sticker: payload.sticker,
      replyToId: payload.replyTo?.id,
      replyToName: payload.replyTo?.name,
      likedBy: [],
      likesCount: 0,
    };

    // Client/Local first for instantaneous UI update
    const rooms = getLocalRooms();
    const roomIndex = rooms.findIndex((r) => isRoomMatch(r.id, roomId));

    if (roomIndex !== -1 || !isSupabaseConfigured) {
      const room = roomIndex !== -1 ? rooms[roomIndex] : null;
      const targetRoomId = room ? room.id : roomId;
      const currentMessages = room?.chatMessages || [];
      const updatedMessages = [...currentMessages, newMsg];

      if (roomIndex !== -1 && room) {
        rooms[roomIndex] = {
          ...room,
          chatMessages: updatedMessages,
        };
        saveLocalRooms(rooms);
      }
      saveRoomExtra(targetRoomId, { chatMessages: updatedMessages });
      if (roomId !== targetRoomId) {
        saveRoomExtra(roomId, { chatMessages: updatedMessages });
      }

      // Sync to Supabase 'comments' table in background
      if (isSupabaseConfigured) {
        (async () => {
          try {
            const boardIdNum = targetRoomId.startsWith('board-')
              ? Number(targetRoomId.replace('board-', ''))
              : Number(targetRoomId);

            if (!isNaN(boardIdNum)) {
              let authUserId = payload.senderId;
              try {
                const {
                  data: { user: sbUser },
                } = await supabase.auth.getUser();
                if (sbUser?.id) authUserId = sbUser.id;
              } catch {
                // ignore
              }

              if (
                authUserId &&
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                  authUserId
                )
              ) {
                let parentIdNum: number | null = null;
                if (payload.replyTo?.id) {
                  const cleaned = payload.replyTo.id.replace('comment-', '');
                  if (!isNaN(Number(cleaned))) parentIdNum = Number(cleaned);
                }

                await supabase.from('comments').insert({
                  board_id: boardIdNum,
                  user_id: authUserId,
                  content: payload.text,
                  parent_id: parentIdNum,
                });
              }
            }
          } catch (err) {
            console.warn('[chatService] Comments table insert note:', err);
          }
        })();
      }

      // Broadcast live to all other accounts online
      realtimeService.broadcastNewComment(targetRoomId, newMsg);
      if (roomId !== targetRoomId) {
        realtimeService.broadcastNewComment(roomId, newMsg);
      }

      return newMsg;
    }

    // Backend API fallback
    return apiClient.post<ChatMessage>(`/rooms/${roomId}/messages`, payload, () => newMsg);
  },

  async sendMessage(roomId: string, payload: SendMessagePayload): Promise<ChatMessage> {
    return this.sendChatMessage(roomId, payload);
  },

  /**
   * Delete a chat message/comment and any of its direct replies
   */
  async deleteMessage(roomId: string, messageId: string): Promise<boolean> {
    const rooms = getLocalRooms();
    const roomIndex = rooms.findIndex((r) => isRoomMatch(r.id, roomId));
    if (roomIndex === -1) return false;

    const room = rooms[roomIndex];
    const targetRoomId = room.id;
    // Filter out the deleted comment and any nested replies replying to it
    const updatedMessages = (room.chatMessages || []).filter(
      (msg) => msg.id !== messageId && msg.replyToId !== messageId
    );

    rooms[roomIndex] = {
      ...room,
      chatMessages: updatedMessages,
    };
    saveLocalRooms(rooms);
    saveRoomExtra(targetRoomId, { chatMessages: updatedMessages });
    if (roomId !== targetRoomId) {
      saveRoomExtra(roomId, { chatMessages: updatedMessages });
    }

    if (isSupabaseConfigured) {
      (async () => {
        try {
          if (messageId.startsWith('comment-')) {
            const commentIdNum = Number(messageId.replace('comment-', ''));
            if (!isNaN(commentIdNum)) {
              await supabase.from('comments').delete().eq('id', commentIdNum);
            }
          }
        } catch (err) {
          console.warn('[chatService] Delete message sync error:', err);
        }
      })();
    }

    // Broadcast live to all other accounts online
    realtimeService.broadcastDeleteComment(targetRoomId, messageId);
    if (roomId !== targetRoomId) {
      realtimeService.broadcastDeleteComment(roomId, messageId);
    }

    return true;
  },

  /**
   * Listen to real-time chat updates for a room via Supabase Realtime
   */
  subscribeToRoom(roomId: string, onUpdate: (messages: ChatMessage[]) => void) {
    if (!isSupabaseConfigured) {
      return () => {};
    }

    try {
      const channel = supabase
        .channel(`room-chat-${roomId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'rooms',
            filter: `id=eq.${roomId}`,
          },
          (payload) => {
            if (payload.new && (payload.new as Record<string, unknown>).chat_messages) {
              onUpdate((payload.new as Record<string, unknown>).chat_messages as ChatMessage[]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('[chatService] Error setting up Realtime subscription:', err);
      return () => {};
    }
  },

  /**
   * Toggle like on a comment/message
   */
  async toggleLikeComment(roomId: string, messageId: string, userId: string): Promise<boolean> {
    const rooms = getLocalRooms();
    const roomIndex = rooms.findIndex((r) => r.id === roomId);
    if (roomIndex === -1) return false;

    const room = rooms[roomIndex];
    let isLiked = false;
    const updatedMessages = room.chatMessages.map((msg) => {
      if (msg.id === messageId) {
        const likedBy = msg.likedBy || [];
        const alreadyLiked = likedBy.includes(userId);
        const newLikedBy = alreadyLiked
          ? likedBy.filter((id) => id !== userId)
          : [...likedBy, userId];
        isLiked = !alreadyLiked;
        return {
          ...msg,
          likedBy: newLikedBy,
          likesCount: newLikedBy.length,
        };
      }
      return msg;
    });

    rooms[roomIndex] = {
      ...room,
      chatMessages: updatedMessages,
    };
    saveLocalRooms(rooms);
    saveRoomExtra(roomId, { chatMessages: updatedMessages });

    if (isSupabaseConfigured) {
      Promise.resolve(
        supabase
          .from('rooms')
          .upsert({
            id: roomId,
            title: room.title,
            description: room.description,
            category: room.category,
            creator: room.creator,
            participants: room.participants,
            chat_messages: updatedMessages,
            status: room.status,
            max_participants: room.maxParticipants,
          })
      ).catch((err) => console.warn('[chatService] Like sync error:', err));
    }

    const targetMsg = updatedMessages.find((m) => m.id === messageId);
    if (targetMsg) {
      realtimeService.broadcastToggleLike(
        roomId,
        messageId,
        targetMsg.likedBy || [],
        targetMsg.likesCount || 0
      );
    }

    return isLiked;
  },
};

export default chatService;
