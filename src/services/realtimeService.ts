import { supabase, isSupabaseConfigured } from './supabaseClient';
import { ChatMessage, Participant, Room } from '../types';

export interface RealtimeEventHandlers {
  onNewComment?: (roomId: string, message: ChatMessage) => void;
  onDeleteComment?: (roomId: string, messageId: string) => void;
  onEditComment?: (roomId: string, messageId: string, newText: string) => void;
  onToggleLike?: (
    roomId: string,
    messageId: string,
    likedBy: string[],
    likesCount: number
  ) => void;
  onRoomJoined?: (
    roomId: string,
    participant: Participant,
    joinMessage: ChatMessage,
    fullParticipants?: Participant[]
  ) => void;
  onRoomLeft?: (
    roomId: string,
    userId: string,
    leaveMessage: ChatMessage
  ) => void;
  onRoomCreated?: (room: Room) => void;
  onRoomUpdated?: (room: Room) => void;
  onDatabaseUpdate?: () => void;
  onStatusChange?: (status: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED') => void;
}

const GLOBAL_CHANNEL_NAME = 'tulonely_live_sync_channel';
const BROADCAST_TAB_CHANNEL_NAME = 'tulonely_tab_sync';

class RealtimeService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private supabaseChannel: any = null;
  private tabChannel: BroadcastChannel | null = null;
  private handlers: RealtimeEventHandlers = {};
  private isSubscribed = false;
  private currentStatus: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' = 'DISCONNECTED';

  constructor() {
    // Initialize cross-tab BroadcastChannel (supported in modern browsers)
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.tabChannel = new BroadcastChannel(BROADCAST_TAB_CHANNEL_NAME);
        this.tabChannel.onmessage = (event) => {
          if (event && event.data) {
            this.handleIncomingEvent(event.data.type, event.data.payload);
          }
        };
      } catch (err) {
        console.warn('[realtimeService] BroadcastChannel init note:', err);
      }
    }
  }

  /**
   * Initialize and subscribe to online Realtime channels
   */
  public initRealtime(handlers: RealtimeEventHandlers): () => void {
    this.handlers = handlers;

    if (!isSupabaseConfigured) {
      console.info('[realtimeService] Supabase not configured, operating with multi-tab sync');
      this.currentStatus = 'CONNECTED';
      this.handlers.onStatusChange?.('CONNECTED');
      return () => this.cleanup();
    }

    if (this.supabaseChannel && this.isSubscribed) {
      return () => this.cleanup();
    }

    try {
      this.currentStatus = 'CONNECTING';
      this.handlers.onStatusChange?.('CONNECTING');

      // Create or reuse global channel
      this.supabaseChannel = supabase.channel(GLOBAL_CHANNEL_NAME, {
        config: {
          broadcast: {
            self: false, // Do not echo our own broadcast messages back to sender
          },
        },
      });

      // 1. Listen for Broadcast events (sub-100ms client-to-client online sync)
      this.supabaseChannel
        .on('broadcast', { event: 'new_comment' }, ({ payload }: { payload: any }) => {
          if (payload?.roomId && payload?.message) {
            this.handlers.onNewComment?.(payload.roomId, payload.message);
          }
        })
        .on('broadcast', { event: 'delete_comment' }, ({ payload }: { payload: any }) => {
          if (payload?.roomId && payload?.messageId) {
            this.handlers.onDeleteComment?.(payload.roomId, payload.messageId);
          }
        })
        .on('broadcast', { event: 'edit_comment' }, ({ payload }: { payload: any }) => {
          if (payload?.roomId && payload?.messageId && payload?.newText !== undefined) {
            this.handlers.onEditComment?.(payload.roomId, payload.messageId, payload.newText);
          }
        })
        .on('broadcast', { event: 'toggle_like' }, ({ payload }: { payload: any }) => {
          if (payload?.roomId && payload?.messageId) {
            this.handlers.onToggleLike?.(
              payload.roomId,
              payload.messageId,
              payload.likedBy || [],
              payload.likesCount || 0
            );
          }
        })
        .on('broadcast', { event: 'room_joined' }, ({ payload }: { payload: any }) => {
          if (payload?.roomId && payload?.participant && payload?.joinMessage) {
            this.handlers.onRoomJoined?.(
              payload.roomId,
              payload.participant,
              payload.joinMessage,
              payload.fullParticipants
            );
          }
        })
        .on('broadcast', { event: 'room_left' }, ({ payload }: { payload: any }) => {
          if (payload?.roomId && payload?.userId && payload?.leaveMessage) {
            this.handlers.onRoomLeft?.(
              payload.roomId,
              payload.userId,
              payload.leaveMessage
            );
          }
        })
        .on('broadcast', { event: 'room_created' }, ({ payload }: { payload: any }) => {
          if (payload?.room) {
            this.handlers.onRoomCreated?.(payload.room);
          }
        })
        .on('broadcast', { event: 'room_updated' }, ({ payload }: { payload: any }) => {
          if (payload?.room) {
            this.handlers.onRoomUpdated?.(payload.room);
          }
        });

      // 2. Listen for Postgres Changes on DB tables (database-level sync)
      this.supabaseChannel
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'participants' },
          (payload: any) => {
            console.log('⚡ [realtimeService] Supabase DB participants change:', payload.eventType);
            this.handlers.onDatabaseUpdate?.();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'boards' },
          (payload: any) => {
            console.log('⚡ [realtimeService] Supabase DB boards change:', payload.eventType);
            this.handlers.onDatabaseUpdate?.();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'comments' },
          (payload: any) => {
            console.log('⚡ [realtimeService] Supabase DB comments change:', payload.eventType);
            this.handlers.onDatabaseUpdate?.();
          }
        );

      // Subscribe to the channel
      this.supabaseChannel.subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log('🟢 [realtimeService] Online Realtime Connected (Supabase Channel Ready)');
          this.isSubscribed = true;
          this.currentStatus = 'CONNECTED';
          this.handlers.onStatusChange?.('CONNECTED');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.warn('⚠️ [realtimeService] Realtime channel status:', status);
          this.isSubscribed = false;
          this.currentStatus = 'DISCONNECTED';
          this.handlers.onStatusChange?.('DISCONNECTED');
        }
      });
    } catch (err) {
      console.warn('[realtimeService] Error subscribing to Realtime:', err);
      this.currentStatus = 'DISCONNECTED';
      this.handlers.onStatusChange?.('DISCONNECTED');
    }

    return () => this.cleanup();
  }

  /**
   * Internal dispatcher for incoming events (from BroadcastChannel)
   */
  private handleIncomingEvent(type: string, payload: any) {
    switch (type) {
      case 'new_comment':
        if (payload?.roomId && payload?.message) {
          this.handlers.onNewComment?.(payload.roomId, payload.message);
        }
        break;
      case 'delete_comment':
        if (payload?.roomId && payload?.messageId) {
          this.handlers.onDeleteComment?.(payload.roomId, payload.messageId);
        }
        break;
      case 'edit_comment':
        if (payload?.roomId && payload?.messageId && payload?.newText !== undefined) {
          this.handlers.onEditComment?.(payload.roomId, payload.messageId, payload.newText);
        }
        break;
      case 'toggle_like':
        if (payload?.roomId && payload?.messageId) {
          this.handlers.onToggleLike?.(
            payload.roomId,
            payload.messageId,
            payload.likedBy,
            payload.likesCount
          );
        }
        break;
      case 'room_joined':
        if (payload?.roomId && payload?.participant && payload?.joinMessage) {
          this.handlers.onRoomJoined?.(
            payload.roomId,
            payload.participant,
            payload.joinMessage,
            payload.fullParticipants
          );
        }
        break;
      case 'room_left':
        if (payload?.roomId && payload?.userId && payload?.leaveMessage) {
          this.handlers.onRoomLeft?.(
            payload.roomId,
            payload.userId,
            payload.leaveMessage
          );
        }
        break;
      case 'room_created':
        if (payload?.room) {
          this.handlers.onRoomCreated?.(payload.room);
        }
        break;
      case 'room_updated':
        if (payload?.room) {
          this.handlers.onRoomUpdated?.(payload.room);
        }
        break;
    }
  }

  /**
   * Generic sender to broadcast across both Supabase Realtime and Browser TabChannel
   */
  private sendBroadcast(event: string, payload: any) {
    // 1. Send via Browser TabChannel
    if (this.tabChannel) {
      try {
        this.tabChannel.postMessage({ type: event, payload });
      } catch (err) {
        console.warn('[realtimeService] TabChannel post error:', err);
      }
    }

    // 2. Send via Supabase Realtime Channel
    if (this.supabaseChannel) {
      try {
        this.supabaseChannel.send({
          type: 'broadcast',
          event,
          payload,
        });
      } catch (err) {
        console.warn('[realtimeService] Supabase broadcast send error:', err);
      }
    }
  }

  /**
   * Broadcast new comment or reply to all online accounts
   */
  public broadcastNewComment(roomId: string, message: ChatMessage) {
    this.sendBroadcast('new_comment', { roomId, message });
  }

  /**
   * Broadcast deleted comment to all online accounts
   */
  public broadcastDeleteComment(roomId: string, messageId: string) {
    this.sendBroadcast('delete_comment', { roomId, messageId });
  }

  /**
   * Broadcast edited comment to all online accounts
   */
  public broadcastEditComment(roomId: string, messageId: string, newText: string) {
    this.sendBroadcast('edit_comment', { roomId, messageId, newText });
  }

  /**
   * Broadcast liked comment update
   */
  public broadcastToggleLike(
    roomId: string,
    messageId: string,
    likedBy: string[],
    likesCount: number
  ) {
    this.sendBroadcast('toggle_like', { roomId, messageId, likedBy, likesCount });
  }

  /**
   * Broadcast when an account joins a board
   */
  public broadcastRoomJoined(
    roomId: string,
    participant: Participant,
    joinMessage: ChatMessage,
    fullParticipants?: Participant[]
  ) {
    this.sendBroadcast('room_joined', { roomId, participant, joinMessage, fullParticipants });
  }

  /**
   * Broadcast when an account leaves a board
   */
  public broadcastRoomLeft(
    roomId: string,
    userId: string,
    leaveMessage: ChatMessage
  ) {
    this.sendBroadcast('room_left', { roomId, userId, leaveMessage });
  }

  /**
   * Broadcast when a new room is created
   */
  public broadcastRoomCreated(room: Room) {
    this.sendBroadcast('room_created', { room });
  }

  /**
   * Broadcast when a room is updated (e.g. title, date, location edited)
   */
  public broadcastRoomUpdated(room: Room) {
    this.sendBroadcast('room_updated', { room });
  }

  /**
   * Get current connection status
   */
  public getStatus(): 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' {
    return this.currentStatus;
  }

  /**
   * Cleanup channels on unmount
   */
  public cleanup() {
    if (this.supabaseChannel) {
      try {
        supabase.removeChannel(this.supabaseChannel);
      } catch (err) {
        console.warn('[realtimeService] Error removing Supabase channel:', err);
      }
      this.supabaseChannel = null;
      this.isSubscribed = false;
    }
    this.currentStatus = 'DISCONNECTED';
  }
}

export const realtimeService = new RealtimeService();
export default realtimeService;
