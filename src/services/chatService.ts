import { ChatMessage } from '../types';
import { apiClient } from './apiClient';
import { getLocalRooms, saveLocalRooms } from './roomService';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface SendMessagePayload {
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderFaculty?: string;
  text: string;
  sticker?: string;
  replyToId?: string;
  replyToName?: string;
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
   * Send a new message to a room
   */
  async sendMessage(roomId: string, payload: SendMessagePayload): Promise<ChatMessage> {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: payload.senderId,
      senderName: payload.senderName,
      senderAvatar: payload.senderAvatar,
      senderFaculty: payload.senderFaculty,
      text: payload.text.trim(),
      timestamp:
        new Date().toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
        }) + ' น.',
      sticker: payload.sticker,
      replyToId: payload.replyToId,
      replyToName: payload.replyToName,
      likesCount: 0,
      likedBy: [],
    };

    // Update local state first for immediate snappy UI
    const rooms = getLocalRooms();
    const roomIndex = rooms.findIndex((r) => r.id === roomId);

    if (roomIndex !== -1) {
      const room = rooms[roomIndex];
      const updatedMessages = [...room.chatMessages, newMsg];
      rooms[roomIndex] = {
        ...room,
        chatMessages: updatedMessages,
      };
      saveLocalRooms(rooms);

      // Sync to Supabase in background
      if (isSupabaseConfigured) {
        Promise.resolve(
          supabase
            .from('rooms')
            .update({ chat_messages: updatedMessages })
            .eq('id', roomId)
        )
          .then(({ error }) => {
            if (error) {
              console.warn('[chatService] Failed to sync message to Supabase:', error.message);
            }
          })
          .catch((err) => console.warn('[chatService] Chat sync error:', err));
      }


      return newMsg;
    }

    // Backend API fallback
    return apiClient.post<ChatMessage>(`/rooms/${roomId}/messages`, payload, () => newMsg);
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

    if (isSupabaseConfigured) {
      Promise.resolve(
        supabase
          .from('rooms')
          .update({ chat_messages: updatedMessages })
          .eq('id', roomId)
      ).catch((err) => console.warn('[chatService] Like sync error:', err));
    }

    return isLiked;
  },
};

export default chatService;
