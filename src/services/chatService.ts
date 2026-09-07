import { ChatMessage } from '../types';
import { apiClient } from './apiClient';
import { getLocalRooms, saveLocalRooms } from './roomService';

export interface SendMessagePayload {
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  sticker?: string;
}

/**
 * Chat Service
 */
export const chatService = {
  /**
   * Get all chat messages for a specific room
   */
  async getMessages(roomId: string): Promise<ChatMessage[]> {
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
    return apiClient.post<ChatMessage>(
      `/rooms/${roomId}/messages`,
      payload,
      () => {
        const rooms = getLocalRooms();
        const roomIndex = rooms.findIndex((r) => r.id === roomId);

        if (roomIndex === -1) {
          throw new Error('ไม่พบห้องสำหรับการส่งข้อความ');
        }

        const room = rooms[roomIndex];
        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderId: payload.senderId,
          senderName: payload.senderName,
          senderAvatar: payload.senderAvatar,
          text: payload.text.trim(),
          timestamp: new Date().toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
          }) + ' น.',
          sticker: payload.sticker,
        };

        const updatedRoom = {
          ...room,
          chatMessages: [...room.chatMessages, newMsg],
        };

        rooms[roomIndex] = updatedRoom;
        saveLocalRooms(rooms);

        return newMsg;
      }
    );
  },
};
