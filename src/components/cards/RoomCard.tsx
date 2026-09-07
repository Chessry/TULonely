import React from 'react';
import { Room } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatRemainingTime, getStatusDetails, maskStudentId } from '../../utils/helpers';
import { CATEGORY_METADATA } from '../../data/mockData';
import { MapPin, Clock, Users, Heart, ArrowRight } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onSelect?: () => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onSelect }) => {
  const {
    navigateToRoom,
    currentUser,
    joinRoom,
    toggleFavoriteRoom,
  } = useApp();

  const isFavorited = currentUser.favoriteRooms.includes(room.id);
  const isMember = room.participants.some((p) => p.id === currentUser.id);
  const isHost = room.creator.id === currentUser.id;

  const timeRemaining = formatRemainingTime(room.recruitmentDeadline);
  const statusDetails = getStatusDetails(room.status);
  const categoryMeta = CATEGORY_METADATA[room.category] || CATEGORY_METADATA.university;

  const handleClick = () => {
    if (onSelect) {
      onSelect();
    } else {
      navigateToRoom(room.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white/45 hover:bg-white/75 backdrop-blur-lg rounded-3xl p-5 border border-white/70 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      {/* Top Bar: Category Pill & Status Badge & Favorite */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/70 backdrop-blur-sm border border-white/80 text-[#8B1D1D] shadow-2xs"
            >
              <span>{categoryMeta.icon}</span>
              <span>{categoryMeta.name}</span>
            </span>

            {room.universityActivityTitle && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#8B1D1D]/10 text-[#8B1D1D] truncate max-w-[130px]">
                🏛️ {room.universityActivityTitle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Status Pill */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border backdrop-blur-xs ${statusDetails.badgeBg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusDetails.dotColor} ${room.status === 'open' ? 'animate-pulse' : ''}`} />
              <span>{statusDetails.label}</span>
            </span>

            {/* Favorite button with frosted circle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavoriteRoom(room.id);
              }}
              className={`p-1.5 rounded-full bg-white/60 hover:bg-white border border-white/80 transition-colors cursor-pointer ${
                isFavorited ? 'text-rose-500 fill-rose-500' : 'text-[#888]'
              }`}
              title="บันทึกห้องนี้"
              aria-label="Favorite"
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Room Title */}
        <h3 className="font-bold text-base sm:text-lg text-[#2D2D2D] group-hover:text-[#8B1D1D] transition-colors line-clamp-2 leading-snug font-kanit">
          {room.title}
        </h3>

        {/* Description snippet */}
        <p className="text-xs text-[#555] mt-1.5 line-clamp-2 leading-relaxed">
          {room.description}
        </p>

        {/* Host info badge in frosted container */}
        <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-white/60">
          <img
            src={room.creator.avatar}
            alt={room.creator.name}
            className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-2xs"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-[#2D2D2D] truncate">{room.creator.name}</span>
              <span className="text-[11px] text-[#777] truncate">
                ({maskStudentId(room.creator.studentId)})
              </span>
            </div>
            <p className="text-[11px] text-[#666] truncate">{room.creator.faculty}</p>
          </div>
        </div>

        {/* Details: Date, Time, Location */}
        <div className="mt-3 space-y-1.5 text-xs text-[#444] bg-white/40 p-2.5 rounded-2xl border border-white/60">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#8B1D1D] shrink-0" />
            <span className="font-semibold text-[#2D2D2D]">กิจกรรม:</span>
            <span className="truncate">{room.activityDate} • {room.activityTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#8B1D1D] shrink-0" />
            <span className="truncate">{room.location}</span>
          </div>
        </div>

        {/* Tags */}
        {room.tags && room.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mt-3">
            {room.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 bg-white/60 backdrop-blur-xs text-[#555] rounded-full text-[11px] font-medium border border-white/80"
              >
                {tag}
              </span>
            ))}
            {room.tags.length > 3 && (
              <span className="text-[11px] text-[#888]">+{room.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Participants, Countdown & Action */}
      <div className="mt-4 pt-3 border-t border-white/60 flex items-center justify-between gap-2">
        {/* Left: Participant count & deadline */}
        <div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#8B1D1D]" />
            <span className="text-xs font-bold text-[#2D2D2D]">
              {room.participants.length}/{room.maxParticipants} คน
            </span>
            {isMember && (
              <span className="px-2 py-0.5 bg-emerald-100/90 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                {isHost ? 'ผู้สร้าง' : 'เข้าร่วมแล้ว'}
              </span>
            )}
          </div>

          <p
            className={`text-[11px] font-medium mt-0.5 ${
              timeRemaining.isExpired
                ? 'text-stone-500'
                : timeRemaining.isUrgent
                ? 'text-rose-600 font-bold'
                : 'text-[#666]'
            }`}
          >
            ⏳ {timeRemaining.text}
          </p>
        </div>

        {/* Right: Join / Details button */}
        <div className="flex items-center gap-1.5">
          {!isMember && room.status === 'open' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                joinRoom(room.id);
              }}
              className="px-3.5 py-1.5 bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white text-xs font-bold rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Join 🚀
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="p-2 text-[#444] hover:text-[#8B1D1D] bg-white/50 hover:bg-white rounded-full border border-white/70 transition-all cursor-pointer shadow-2xs"
            title="ดูรายละเอียดห้อง"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
