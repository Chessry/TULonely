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
  parentId?: number | null;
  commentId?: number;
  replyTo?: {
    id: string;
    name: string;
    parentId?: number | null;
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
    const rooms = getLocalRooms();
    const roomIndex = rooms.findIndex((r) => isRoomMatch(r.id, roomId));
    const targetRoomId = roomIndex !== -1 ? rooms[roomIndex].id : roomId;

    // 1. Calculate parent_id as numeric int8 (or null)
    let parentIdNum: number | null = null;
    if (payload.parentId !== undefined && payload.parentId !== null) {
      const parsed = Number(payload.parentId);
      if (!isNaN(parsed) && parsed > 0) parentIdNum = parsed;
    } else if (payload.replyTo?.parentId !== undefined && payload.replyTo?.parentId !== null) {
      const parsed = Number(payload.replyTo.parentId);
      if (!isNaN(parsed) && parsed > 0) parentIdNum = parsed;
    } else if (payload.replyTo?.id || payload.replyToId) {
      const raw = (payload.replyTo?.id || payload.replyToId || '').replace(/^comment-/, '');
      const parsed = Number(raw);
      if (!isNaN(parsed) && parsed > 0 && !(payload.replyTo?.id || payload.replyToId || '').startsWith('msg-')) {
        parentIdNum = parsed;
      }
    }

    // Fallback: search room.chatMessages for payload.replyTo?.id or payload.replyToId
    if (!parentIdNum && (payload.replyTo?.id || payload.replyToId)) {
      const targetId = payload.replyTo?.id || payload.replyToId;
      const room = rooms.find((r) => isRoomMatch(r.id, roomId));
      const targetMsg = (room?.chatMessages || []).find((m) => m.id === targetId);
      if (targetMsg) {
        if (typeof targetMsg.commentId === 'number' && targetMsg.commentId > 0) {
          parentIdNum = targetMsg.commentId;
        } else {
          const parsed = Number(targetMsg.id.replace(/^comment-/, ''));
          if (!isNaN(parsed) && parsed > 0 && !targetMsg.id.startsWith('msg-')) {
            parentIdNum = parsed;
          }
        }
      }
    }

    // 2. Sync to Supabase 'comments' table
    let insertedCommentId: number | undefined;
    let insertedCreatedAt: string | undefined;
    if (isSupabaseConfigured) {
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
            const insertData = {
              board_id: boardIdNum,
              user_id: authUserId,
              content: payload.text.trim(),
              parent_id: parentIdNum,
              is_updated: false,
            };

            const { data: inserted, error: insertError } = await supabase
              .from('comments')
              .insert(insertData)
              .select('id, created_at')
              .single();

            if (!insertError && inserted?.id) {
              insertedCommentId = inserted.id;
              insertedCreatedAt = inserted.created_at;
            } else if (insertError) {
              console.error('[chatService] Supabase comments insert error:', insertError.message);
            }
          }
        }
      } catch (err) {
        console.warn('[chatService] Comments table insert note:', err);
      }
    }

    // 3. Build ChatMessage object with definitive IDs
    const finalMsgId = insertedCommentId ? `comment-${insertedCommentId}` : `msg-${Date.now()}`;
    const finalCreatedAt = insertedCreatedAt || new Date().toISOString();
    const finalTimestamp =
      new Date(finalCreatedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';

    const newMsg: ChatMessage = {
      id: finalMsgId,
      commentId: insertedCommentId,
      parentId: parentIdNum,
      senderId: payload.senderId,
      senderName: payload.senderName,
      senderAvatar: payload.senderAvatar,
      senderFaculty: payload.senderFaculty,
      text: payload.text.trim(),
      createdAt: finalCreatedAt,
      timestamp: finalTimestamp,
      sticker: payload.sticker,
      replyToId: payload.replyTo?.id || (parentIdNum ? `comment-${parentIdNum}` : undefined),
      replyToName: payload.replyTo?.name,
      likedBy: [],
      likesCount: 0,
      isUpdated: false,
    };

    // 4. Update local cache
    if (roomIndex !== -1 && rooms[roomIndex]) {
      const room = rooms[roomIndex];
      const currentMessages = room.chatMessages || [];
      const updatedMessages = [...currentMessages, newMsg];

      rooms[roomIndex] = {
        ...room,
        chatMessages: updatedMessages,
      };
      saveLocalRooms(rooms);
      saveRoomExtra(targetRoomId, { chatMessages: updatedMessages });
      if (roomId !== targetRoomId) {
        saveRoomExtra(roomId, { chatMessages: updatedMessages });
      }
    }

    // 5. Broadcast live to all other accounts online
    realtimeService.broadcastNewComment(targetRoomId, newMsg);
    if (roomId !== targetRoomId) {
      realtimeService.broadcastNewComment(roomId, newMsg);
    }

    return newMsg;
  },

  async sendMessage(roomId: string, payload: SendMessagePayload): Promise<ChatMessage> {
    return this.sendChatMessage(roomId, payload);
  },

  /**
   * Edit an existing comment/message
   */
  async editChatMessage(roomId: string, messageId: string, newText: string): Promise<boolean> {
    const rooms = getLocalRooms();
    const roomIndex = rooms.findIndex((r) => isRoomMatch(r.id, roomId));
    if (roomIndex === -1) return false;

    const room = rooms[roomIndex];
    const targetRoomId = room.id;

    const updatedMessages = (room.chatMessages || []).map((msg) => {
      if (msg.id === messageId) {
        return {
          ...msg,
          text: newText.trim(),
          isUpdated: true,
        };
      }
      return msg;
    });

    rooms[roomIndex] = {
      ...room,
      chatMessages: updatedMessages,
    };
    saveLocalRooms(rooms);
    saveRoomExtra(targetRoomId, { chatMessages: updatedMessages });
    if (roomId !== targetRoomId) {
      saveRoomExtra(roomId, { chatMessages: updatedMessages });
    }

    // Sync to Supabase 'comments' table
    if (isSupabaseConfigured) {
      (async () => {
        try {
          const raw = messageId.replace(/^comment-/, '');
          const commentIdNum = Number(raw);
          if (!isNaN(commentIdNum) && !messageId.startsWith('msg-')) {
            await supabase
              .from('comments')
              .update({
                content: newText.trim(),
                is_updated: true,
              })
              .eq('id', commentIdNum);
          }
        } catch (err) {
          console.warn('[chatService] Edit message sync error:', err);
        }
      })();
    }

    // Broadcast edit to all online accounts
    realtimeService.broadcastEditComment(targetRoomId, messageId, newText.trim());
    if (roomId !== targetRoomId) {
      realtimeService.broadcastEditComment(roomId, messageId, newText.trim());
    }

    return true;
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

    const raw = messageId.replace(/^comment-/, '');
    const commentIdNum = Number(raw);
    const validNum = !isNaN(commentIdNum) && !messageId.startsWith('msg-') ? commentIdNum : null;

    // Filter out the deleted comment and any nested replies replying to it
    const updatedMessages = (room.chatMessages || []).filter((msg) => {
      if (msg.id === messageId) return false;
      if (msg.replyToId === messageId) return false;
      if (validNum && (msg.parentId === validNum || msg.replyToId === `comment-${validNum}`)) return false;
      return true;
    });

    rooms[roomIndex] = {
      ...room,
      chatMessages: updatedMessages,
    };
    saveLocalRooms(rooms);
    saveRoomExtra(targetRoomId, { chatMessages: updatedMessages });
    if (roomId !== targetRoomId) {
      saveRoomExtra(roomId, { chatMessages: updatedMessages });
    }

    if (isSupabaseConfigured && validNum) {
      (async () => {
        try {
          // Delete child replies first
          await supabase.from('comments').delete().eq('parent_id', validNum);
          // Delete parent comment
          await supabase.from('comments').delete().eq('id', validNum);
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
