import React from 'react';
import { UniversityActivity } from '../../types';
import { useApp } from '../../context/AppContext';
import { Calendar, Clock, MapPin, Building, Users, Plus, Eye, Star } from 'lucide-react';

interface ActivityCardProps {
  activity: UniversityActivity;
  onViewRooms?: () => void;
  onCreateRoom?: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onViewRooms,
  onCreateRoom,
}) => {
  const {
    rooms,
    currentUser,
    toggleFavoriteActivity,
    navigateToActivityRooms,
    openCreateRoomFlow,
  } = useApp();

  const isFavorited = currentUser.favoriteActivities.includes(activity.id);

  // Active rooms created for this specific university activity
  const linkedRooms = rooms.filter((r) => r.universityActivityId === activity.id);
  const activeRoomsCount = linkedRooms.filter((r) => r.status !== 'expired').length;

  const handleViewRooms = () => {
    if (onViewRooms) {
      onViewRooms();
    } else {
      navigateToActivityRooms(activity.id);
    }
  };

  const handleCreateRoom = () => {
    if (onCreateRoom) {
      onCreateRoom();
    } else {
      openCreateRoomFlow('university', activity);
    }
  };

  return (
    <div className="group bg-white/45 hover:bg-white/70 backdrop-blur-lg rounded-3xl overflow-hidden border border-white/70 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
      {/* Cover Image & Badges */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-stone-100">
        <img
          src={activity.coverImage}
          alt={activity.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#8B1D1D]/90 backdrop-blur-md text-white shadow-md border border-white/30">
            <span>{activity.icon}</span>
            <span>{activity.campus}</span>
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavoriteActivity(activity.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer border border-white/40 ${
              isFavorited
                ? 'bg-amber-400 text-stone-900 shadow-md'
                : 'bg-black/30 hover:bg-black/50 text-white'
            }`}
            title="บันทึกกิจกรรมนี้"
          >
            <Star className={`w-4 h-4 ${isFavorited ? 'fill-stone-900' : ''}`} />
          </button>
        </div>

        {/* Bottom Banner Title */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-[11px] font-medium text-white/90 flex items-center gap-1 mb-0.5">
            <Building className="w-3 h-3" />
            <span className="truncate">{activity.organizer}</span>
          </p>
          <h3 className="font-bold text-lg sm:text-xl text-white font-kanit line-clamp-1 leading-snug drop-shadow-md">
            {activity.title}
          </h3>
        </div>
      </div>

      {/* Card Content with Full Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Key Schedule & Venue Details on Frosted Card */}
          <div className="space-y-2 text-xs text-[#444] bg-white/50 backdrop-blur-sm p-3.5 rounded-2xl border border-white/70 shadow-2xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#8B1D1D] shrink-0" />
              <span className="font-bold text-[#2D2D2D]">วันที่:</span>
              <span className="font-semibold text-[#2D2D2D]">{activity.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8B1D1D] shrink-0" />
              <span className="font-bold text-[#2D2D2D]">เวลา:</span>
              <span>{activity.time}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#8B1D1D] shrink-0 mt-0.5" />
              <span className="font-bold text-[#2D2D2D] shrink-0">สถานที่:</span>
              <span className="line-clamp-1">{activity.location}</span>
            </div>
          </div>

          {/* Description */}
          <div className="mt-3">
            <p className="text-xs text-[#555] leading-relaxed line-clamp-3">
              📝 {activity.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap mt-3">
            {activity.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 bg-white/60 backdrop-blur-xs text-[#8B1D1D] rounded-full text-[11px] font-bold border border-white/80"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Zone: "ดูห้อง" & "สร้างห้อง" */}
        <div className="mt-5 pt-3 border-t border-white/60">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="flex items-center gap-1.5 font-bold text-[#444]">
              <Users className="w-4 h-4 text-[#8B1D1D]" />
              <span>ห้องหาเพื่อน:</span>
            </span>
            <span className="font-bold text-[#8B1D1D] bg-white/70 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/80 shadow-2xs">
              {activeRoomsCount} ห้องเปิดรับ
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* View Rooms */}
            <button
              onClick={handleViewRooms}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-white/60 hover:bg-white text-[#333] font-bold text-xs border border-white/80 transition-all shadow-xs cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#8B1D1D]" />
              <span>ดูห้อง ({activeRoomsCount})</span>
            </button>

            {/* Create Room */}
            <button
              onClick={handleCreateRoom}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>สร้างห้อง</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
