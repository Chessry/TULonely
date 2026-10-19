export type CategoryType =
  | 'university'
  | 'food'
  | 'sports'
  | 'study'
  | 'entertainment'
  | 'activity'
  | 'restaurants';

export type RoomStatus = 'open' | 'almost_full' | 'full' | 'expired' | 'closed';

export interface Participant {
  id: string;
  name: string;
  studentId: string;
  faculty: string;
  avatar: string;
  joinedAt: string;
  isHost: boolean;
}

export interface ChatMessage {
  id: string;
  commentId?: number;
  parentId?: number | null;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderFaculty?: string;
  text: string;
  timestamp: string;
  createdAt?: string;
  isSystem?: boolean;
  sticker?: string;
  replyToId?: string;
  replyToName?: string;
  likesCount?: number;
  likedBy?: string[];
  isUpdated?: boolean;
}

export interface UniversityActivity {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  campus: string;
  description: string;
  tags: string[];
  coverImage: string;
  accentColor: string;
  organizer: string;
  icon: string;
  category: 'university';
}

export interface Room {
  id: string;
  boardId?: number;
  title: string;
  description: string;
  category: CategoryType;
  categoryId?: number;
  categoryItemId?: number;
  universityActivityId?: string;
  universityActivityTitle?: string;
  creator: {
    id: string;
    name: string;
    studentId: string;
    faculty: string;
    avatar: string;
    bio?: string | null;
  };
  eventDateTime?: string;
  activityDate: string;
  activityTime: string;
  location: string;
  campus: string;
  tags: string[];
  maxParticipant?: number;
  maxParticipants: number;
  participants: Participant[];
  recruitmentDeadline: string; // ISO string
  recruitmentOption: 'datetime' | 'hours';
  recruitmentHours?: number;
  status: RoomStatus;
  isPaused?: boolean;
  isClosed?: boolean;
  createdAt: string;
  chatMessages: ChatMessage[];
  viewsCount?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  fullName?: string;
  studentId: string;
  email: string;
  faculty: string;
  year: string;
  campus: string;
  bio?: string | null;
  avatar: string;
  interests: string[];
  favoriteRooms: string[];
  favoriteActivities: string[];
}

export interface NotificationItem {
  id: string;
  type:
    | 'join'
    | 'leave'
    | 'chat'
    | 'almost_full'
    | 'board_full'
    | 'deadline'
    | 'activity_soon'
    | 'new_match'
    | 'tag_match'
    | 'board_updated'
    | 'system';
  title: string;
  description: string;
  time: string;
  read: boolean;
  targetRoomId?: string;
  targetActivityId?: string;
  tag?: string;
  category?: 'host' | 'interest' | 'system' | 'general';
  createdAt?: string;
}

export type ReportTargetType = 'user' | 'activity' | 'room' | 'board' | 'message';

export interface ReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  targetTitle: string;
  targetSubtitle?: string;
  targetAvatar?: string;
  reason: string;
  details: string;
  reporterId?: string;
  reporterName?: string;
  createdAt?: string;
}
