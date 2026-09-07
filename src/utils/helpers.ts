import { Room, RoomStatus } from '../types';

export function calculateRoomStatus(room: {
  participants: any[];
  maxParticipants: number;
  recruitmentDeadline: string;
}): RoomStatus {
  const now = new Date().getTime();
  const deadline = new Date(room.recruitmentDeadline).getTime();

  if (now > deadline) {
    return 'expired';
  }

  if (room.participants.length >= room.maxParticipants) {
    return 'full';
  }

  if (room.participants.length >= Math.max(1, room.maxParticipants - 1)) {
    return 'almost_full';
  }

  return 'open';
}

export function formatRemainingTime(deadlineIso: string): {
  text: string;
  isUrgent: boolean;
  isExpired: boolean;
  hoursLeft: number;
} {
  const now = new Date().getTime();
  const deadline = new Date(deadlineIso).getTime();
  const diffMs = deadline - now;

  if (diffMs <= 0) {
    return {
      text: 'หมดเวลารับสมาชิก',
      isUrgent: false,
      isExpired: true,
      hoursLeft: 0,
    };
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    const remainHours = diffHours % 24;
    return {
      text: `เหลือเวลา ${diffDays} วัน ${remainHours > 0 ? `${remainHours} ชม.` : ''}`,
      isUrgent: false,
      isExpired: false,
      hoursLeft: diffHours,
    };
  }

  if (diffHours > 0) {
    const remainMins = diffMinutes % 60;
    return {
      text: `เหลือเวลา ${diffHours} ชั่วโมง ${remainMins > 0 ? `${remainMins} นาที` : ''}`,
      isUrgent: diffHours <= 3,
      isExpired: false,
      hoursLeft: diffHours,
    };
  }

  return {
    text: `เหลือเวลา ${diffMinutes} นาที`,
    isUrgent: true,
    isExpired: false,
    hoursLeft: 0,
  };
}

export function getStatusDetails(status: RoomStatus): {
  label: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
  icon: string;
} {
  switch (status) {
    case 'open':
      return {
        label: 'เปิดรับสมาชิก',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badgeText: 'text-emerald-700',
        dotColor: 'bg-emerald-500',
        icon: '🟢'
      };
    case 'almost_full':
      return {
        label: 'ใกล้เต็มแล้ว',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        badgeText: 'text-amber-700',
        dotColor: 'bg-amber-500',
        icon: '🟡'
      };
    case 'full':
      return {
        label: 'เต็มแล้ว',
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
        badgeText: 'text-rose-700',
        dotColor: 'bg-rose-500',
        icon: '🔴'
      };
    case 'expired':
      return {
        label: 'หมดเวลารับสมาชิก',
        badgeBg: 'bg-stone-100 text-stone-600 border-stone-300',
        badgeText: 'text-stone-600',
        dotColor: 'bg-stone-400',
        icon: '⚪'
      };
  }
}

export function maskStudentId(studentId: string): string {
  if (!studentId) return '650xxxxxxx';
  if (studentId.length <= 4) return studentId;
  return `${studentId.substring(0, 4)}xxxx`;
}
