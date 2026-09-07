import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { GroupChat } from '../chat/GroupChat';
import { RoomDetailSkeleton, ErrorState } from '../common/skeletons';
import { formatRemainingTime, getStatusDetails, maskStudentId } from '../../utils/helpers';
import { CATEGORY_METADATA } from '../../data/mockData';
import {
  ArrowLeft,
  Clock,
  Calendar,
  MapPin,
  Users,
  Heart,
  Share2,
  Trash2,
  ShieldAlert,
  Crown,
  CheckCircle2
} from 'lucide-react';

export const RoomDetailView: React.FC = () => {
  const {
    rooms,
    isLoadingRooms,
    roomsError,
    refreshRooms,
    selectedRoomId,
    setSelectedRoomId,
    currentUser,
    joinRoom,
    leaveRoom,
    deleteRoom,
    toggleFavoriteRoom,
    setReportTarget,
    setIsReportModalOpen,
    showToast,
    navigateToActivityRooms,
  } = useApp();

  const { roomId: paramRoomId } = useParams<{ roomId?: string }>();
  const navigate = useNavigate();

  const currentRoomId = paramRoomId || selectedRoomId;

  // Sync paramRoomId to context if available
  useEffect(() => {
    if (paramRoomId && paramRoomId !== selectedRoomId) {
      setSelectedRoomId(paramRoomId);
    }
  }, [paramRoomId, selectedRoomId, setSelectedRoomId]);

  const room = rooms.find((r) => r.id === currentRoomId);

  if (isLoadingRooms) {
    return <RoomDetailSkeleton />;
  }

  if (roomsError && !room) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorState
          title="เกิดข้อผิดพลาดในการโหลดรายละเอียดห้อง"
          message={roomsError}
          onRetry={refreshRooms}
          isRetrying={isLoadingRooms}
        />
        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/find-friends')}
            className="text-xs text-[#8B1D1D] hover:underline font-semibold cursor-pointer"
          >
            ← กลับไปดูห้องหาเพื่อนทั้งหมด
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-3">👀</div>
        <h2 className="text-xl font-bold text-[#2D2D2D] font-kanit">ไม่พบห้องที่คุณต้องการ</h2>
        <p className="text-xs text-[#666] mt-1 mb-6">ห้องนี้อาจถูกลบหรือหมดอายุไปแล้ว</p>
        <button
          onClick={() => navigate('/find-friends')}
          className="px-5 py-2.5 bg-[#8B1D1D] text-white rounded-full text-xs font-semibold shadow-md cursor-pointer"
        >
          กลับไปดูห้องหาเพื่อนทั้งหมด
        </button>
      </div>
    );
  }

  const isFavorited = currentUser.favoriteRooms.includes(room.id);
  const isMember = room.participants.some((p) => p.id === currentUser.id);
  const isHost = room.creator.id === currentUser.id;

  const timeRemaining = formatRemainingTime(room.recruitmentDeadline);
  const statusDetails = getStatusDetails(room.status);
  const categoryMeta = CATEGORY_METADATA[room.category] || CATEGORY_METADATA.university;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('คัดลอกลิงก์ห้องเรียบร้อยแล้ว ชวนเพื่อนเลย! 🔗');
    } else {
      showToast('ลิงก์พร้อมแชร์');
    }
  };

  const handleReport = () => {
    setReportTarget({
      targetType: 'room',
      targetId: room.id,
      targetTitle: room.title,
      reason: 'spam',
      details: '',
    });
    setIsReportModalOpen(true);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/find-friends');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Back button & Actions Bar - Frosted */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/60 hover:bg-white/90 backdrop-blur-md text-[#333] border border-white/80 text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#8B1D1D]" />
          <span>ย้อนกลับ</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/60 hover:bg-white backdrop-blur-md border border-white/80 text-[#555] shadow-xs transition-colors cursor-pointer"
            title="แชร์ห้องนี้"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Favorite */}
          <button
            onClick={() => toggleFavoriteRoom(room.id)}
            className={`p-2 rounded-full bg-white/60 hover:bg-white backdrop-blur-md border border-white/80 shadow-xs transition-colors cursor-pointer ${
              isFavorited ? 'text-rose-500 fill-rose-500' : 'text-[#888] hover:text-rose-500'
            }`}
            title="บันทึกห้องนี้"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* Report */}
          <button
            onClick={handleReport}
            className="p-2 rounded-full bg-white/60 hover:bg-white backdrop-blur-md border border-white/80 text-[#888] hover:text-rose-600 shadow-xs transition-colors cursor-pointer"
            title="รายงานความไม่เหมาะสม"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>

          {/* Delete (if host) */}
          {isHost && (
            <button
              onClick={() => {
                if (confirm('คุณต้องการลบห้องหาเพื่อนนี้ใช่หรือไม่?')) {
                  deleteRoom(room.id);
                  navigate('/find-friends');
                }
              }}
              className="p-2 rounded-full bg-rose-50/80 backdrop-blur-xs border border-rose-200 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer shadow-xs"
              title="ลบห้องนี้"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Details & Right Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Room Info, Host, Participants */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Info Card - Frosted Glass */}
          <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-6 sm:p-7 border border-white/80 shadow-lg space-y-5">
            {/* Top Badges & Status */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/70 backdrop-blur-sm border border-white/80 text-[#8B1D1D] shadow-2xs"
                >
                  <span>{categoryMeta.icon}</span>
                  <span>{categoryMeta.name}</span>
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-xs shadow-2xs ${statusDetails.badgeBg}`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusDetails.dotColor} ${room.status === 'open' ? 'animate-pulse' : ''}`} />
                  <span>{statusDetails.label}</span>
                </span>
              </div>

              <span className="text-xs text-[#777]">
                โพสต์เมื่อ {new Date(room.createdAt).toLocaleDateString('th-TH')}
              </span>
            </div>

            {/* University activity link banner if attached */}
            {room.universityActivityTitle && room.universityActivityId && (
              <div
                onClick={() => navigateToActivityRooms(room.universityActivityId!)}
                className="bg-[#8B1D1D]/10 backdrop-blur-xs p-3.5 rounded-2xl border border-[#8B1D1D]/20 flex items-center justify-between gap-2 cursor-pointer hover:bg-[#8B1D1D]/15 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏛️</span>
                  <div>
                    <p className="text-[10px] font-bold text-[#8B1D1D] uppercase tracking-wider">
                      กิจกรรมมหาวิทยาลัยธรรมศาสตร์
                    </p>
                    <p className="text-xs font-bold text-[#2D2D2D] font-kanit">
                      {room.universityActivityTitle}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[#8B1D1D] font-bold">ดูกิจกรรม ➔</span>
              </div>
            )}

            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2D2D] font-kanit leading-snug">
                {room.title}
              </h1>
            </div>

            {/* Description */}
            <div className="bg-white/50 backdrop-blur-xs p-4 rounded-2xl border border-white/70 shadow-2xs">
              <h4 className="text-xs font-bold text-[#8B1D1D] mb-1.5">📝 รายละเอียด</h4>
              <p className="text-sm text-[#444] leading-relaxed whitespace-pre-line">
                {room.description}
              </p>
            </div>

            {/* Tags */}
            {room.tags && room.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {room.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-white/60 backdrop-blur-xs text-[#555] rounded-full text-xs font-medium border border-white/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Key Schedule & Location Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/60">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/40 backdrop-blur-xs border border-white/70 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-[#8B1D1D]/10 text-[#8B1D1D] flex items-center justify-center shrink-0 border border-[#8B1D1D]/20">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-[#777]">วันเวลากิจกรรม</p>
                  <p className="text-xs font-bold text-[#2D2D2D]">
                    {room.activityDate} • {room.activityTime}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/40 backdrop-blur-xs border border-white/70 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-[#8B1D1D]/10 text-[#8B1D1D] flex items-center justify-center shrink-0 border border-[#8B1D1D]/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-[#777]">สถานที่นัดพบ ({room.campus})</p>
                  <p className="text-xs font-bold text-[#2D2D2D] truncate max-w-[180px]">
                    {room.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Recruitment Deadline Box */}
            <div className="p-4 rounded-2xl bg-amber-50/75 backdrop-blur-xs border border-amber-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8B1D1D] flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> ระยะเวลาเปิดรับเพื่อน
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    timeRemaining.isExpired
                      ? 'bg-stone-200 text-stone-700'
                      : timeRemaining.isUrgent
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-200/90 text-amber-900'
                  }`}
                >
                  ⏳ {timeRemaining.text}
                </span>
              </div>
              <p className="text-[11px] text-[#555]">
                ปิดรับสมาชิกในวันที่:{' '}
                <span className="font-bold text-[#2D2D2D]">
                  {new Date(room.recruitmentDeadline).toLocaleString('th-TH', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </p>
            </div>

            {/* Join / Leave Call To Action */}
            <div className="pt-2">
              {isMember ? (
                <div className="flex items-center justify-between gap-3 p-4 bg-emerald-50/80 backdrop-blur-xs rounded-2xl border border-emerald-200 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900">
                        {isHost ? 'คุณคือผู้สร้างห้องนี้' : 'คุณเป็นสมาชิกในห้องนี้แล้ว'}
                      </p>
                      <p className="text-[11px] text-emerald-700">สามารถพูดคุยกับเพื่อนๆ ในแชทได้เลย</p>
                    </div>
                  </div>

                  {!isHost && (
                    <button
                      onClick={() => leaveRoom(room.id)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 bg-white/70 rounded-xl transition-colors cursor-pointer shadow-2xs"
                    >
                      ออกจากห้อง
                    </button>
                  )}
                </div>
              ) : room.status === 'expired' ? (
                <div className="p-4 bg-stone-100/80 backdrop-blur-xs rounded-2xl border border-stone-300 text-center">
                  <p className="text-xs font-bold text-stone-700">⚪ ห้องนี้หมดเวลารับสมาชิกแล้ว</p>
                </div>
              ) : room.status === 'full' ? (
                <div className="p-4 bg-rose-50/80 backdrop-blur-xs rounded-2xl border border-rose-200 text-center">
                  <p className="text-xs font-bold text-rose-700">🔴 ห้องนี้สมาชิกเต็มแล้ว ({room.maxParticipants}/{room.maxParticipants} คน)</p>
                </div>
              ) : (
                <button
                  onClick={() => joinRoom(room.id)}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white font-bold text-sm shadow-md hover:shadow-lg transition-transform active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>เข้าร่วมห้องนี้ (Join Room) 🚀</span>
                </button>
              )}
            </div>
          </div>

          {/* Members List Card - Frosted */}
          <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-6 border border-white/80 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#2D2D2D] font-kanit flex items-center gap-2">
                <Users className="w-5 h-5 text-[#8B1D1D]" />
                <span>สมาชิกในห้อง ({room.participants.length}/{room.maxParticipants} คน)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {room.participants.map((p) => {
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 backdrop-blur-xs border border-white/80 shadow-2xs"
                  >
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-2xs"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#2D2D2D] truncate">{p.name}</span>
                        {p.isHost && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                            <Crown className="w-2.5 h-2.5" /> Host
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#666] truncate">{p.faculty}</p>
                      <p className="text-[10px] text-[#888]">{maskStudentId(p.studentId)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Group Chat Interface */}
        <div className="lg:col-span-5 space-y-4">
          <GroupChat room={room} />
        </div>
      </div>
    </div>
  );
};
