import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ActivityCard } from '../cards/ActivityCard';
import { RoomCard } from '../cards/RoomCard';
import { RoomCardSkeletonList, ActivityCardSkeletonList, ErrorState } from '../common/skeletons';
import { Search, Plus, Users, ArrowLeft } from 'lucide-react';

export const ActivitiesView: React.FC = () => {
  const {
    universityActivities,
    rooms,
    isLoadingRooms,
    roomsError,
    refreshRooms,
    selectedActivityId,
    setSelectedActivityId,
    openCreateRoomFlow,
  } = useApp();

  const { activityId: paramActivityId } = useParams<{ activityId?: string }>();
  const navigate = useNavigate();

  const [search, setSearch] = useState<string>('');

  // Sync paramActivityId with selectedActivityId if present in URL
  useEffect(() => {
    if (paramActivityId && paramActivityId !== selectedActivityId) {
      setSelectedActivityId(paramActivityId);
    }
  }, [paramActivityId, selectedActivityId, setSelectedActivityId]);

  const effectiveActivityId = paramActivityId || selectedActivityId;

  // Find active selected activity if in detail/room filter mode
  const activeSelectedActivity = universityActivities.find(
    (a) => a.id === effectiveActivityId
  );

  const handleBackToAllActivities = () => {
    setSelectedActivityId(null);
    navigate('/activities');
  };

  const handleSelectActivity = (actId: string) => {
    setSelectedActivityId(actId);
    navigate(`/activities/${actId}`);
  };

  // Filter activities
  const filteredActivities = universityActivities.filter((act) => {
    const matchSearch =
      !search.trim() ||
      act.title.toLowerCase().includes(search.toLowerCase()) ||
      act.description.toLowerCase().includes(search.toLowerCase()) ||
      act.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      act.location.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  // Rooms under the currently selected activity (Section 8: University Activity -> Room)
  const roomsForSelectedActivity = activeSelectedActivity
    ? rooms.filter((r) => r.universityActivityId === activeSelectedActivity.id)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-16">
      {/* Header Banner - Frosted Glass Gradient */}
      <div className="bg-gradient-to-r from-[#8B1D1D]/90 to-[#6D0E1C]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-white/30">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/30">
            <span>🎉</span>
            <span>กิจกรรมมหาวิทยาลัยธรรมศาสตร์</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-kanit">
            กิจกรรมมหาวิทยาลัย
          </h1>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            กิจกรรมอย่างเป็นทางการของ มธ. และชมรมต่าง ๆ ข้อมูลและรายละเอียดถูกกำหนดโดยระบบ
            นักศึกษาสามารถ <span className="font-bold text-[#F27D26]">สร้างห้องหาเพื่อน</span> หรือเข้าร่วมห้องที่มีอยู่เพื่อไปร่วมงานด้วยกันได้เลย!
          </p>
        </div>
      </div>

      {/* If an activity is selected, show Activity info + Rooms under it (Section 8) */}
      {activeSelectedActivity ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleBackToAllActivities}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/60 hover:bg-white/90 backdrop-blur-md text-[#333] border border-white/70 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-[#8B1D1D]" />
              <span>ดูกิจกรรม มธ. ทั้งหมด</span>
            </button>

            <button
              onClick={() => openCreateRoomFlow('university', activeSelectedActivity)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white text-xs font-bold shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างห้องในกิจกรรมนี้</span>
            </button>
          </div>

          {/* Activity Header Card - Frosted */}
          <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-6 border border-white/80 shadow-lg">
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={activeSelectedActivity.coverImage}
                alt={activeSelectedActivity.title}
                className="w-full md:w-64 h-44 rounded-2xl object-cover shadow-sm"
              />
              <div className="flex-1 space-y-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#8B1D1D] text-white shadow-xs">
                  {activeSelectedActivity.campus}
                </span>
                <h2 className="text-2xl font-bold text-[#2D2D2D] font-kanit">
                  {activeSelectedActivity.title}
                </h2>
                <p className="text-xs text-[#555] leading-relaxed">
                  {activeSelectedActivity.description}
                </p>
                <div className="text-xs text-[#444] bg-white/60 backdrop-blur-xs p-3.5 rounded-2xl border border-white/80 flex flex-wrap gap-4 shadow-2xs">
                  <span>📅 {activeSelectedActivity.date}</span>
                  <span>🕐 {activeSelectedActivity.time}</span>
                  <span>📍 {activeSelectedActivity.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 8: Room list under this activity */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#2D2D2D] font-kanit flex items-center gap-2">
                <Users className="w-5 h-5 text-[#8B1D1D]" />
                <span>ห้องที่กำลังหาเพื่อนไปงานนี้ ({roomsForSelectedActivity.length} ห้อง)</span>
              </h3>
            </div>

            {roomsError && rooms.length === 0 ? (
              <ErrorState
                title="เกิดข้อผิดพลาดในการโหลดห้องสำหรับกิจกรรมนี้"
                message={roomsError}
                onRetry={refreshRooms}
                isRetrying={isLoadingRooms}
              />
            ) : isLoadingRooms ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <RoomCardSkeletonList count={3} />
              </div>
            ) : roomsForSelectedActivity.length === 0 ? (
              <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-10 text-center border border-white/70 shadow-md space-y-3">
                <div className="text-4xl">👀</div>
                <h4 className="text-base font-bold text-[#2D2D2D] font-kanit">
                  ยังไม่มีใครกำลังหาเพื่อนไปงานนี้เลย
                </h4>
                <p className="text-xs text-[#666] max-w-md mx-auto">
                  สร้างห้องแรกแล้วชวนเพื่อนใหม่ไปงาน {activeSelectedActivity.title} ด้วยกันเลย!
                </p>
                <button
                  onClick={() => openCreateRoomFlow('university', activeSelectedActivity)}
                  className="px-5 py-2.5 bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white text-xs font-bold rounded-full shadow-md cursor-pointer"
                >
                  สร้างห้องแรกตอนนี้ 🚀
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {roomsForSelectedActivity.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Default: List of all University Activities Cards (Section 7) */
        <div className="space-y-6">
          {/* Search Bar - Frosted Glass */}
          <div className="bg-white/50 backdrop-blur-md rounded-3xl p-4 border border-white/70 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-[#8B1D1D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหากิจกรรม มธ. ศูนย์รังสิต ..."
                className="w-full bg-white/60 backdrop-blur-sm border border-white/80 rounded-full pl-9 pr-4 py-2 text-xs text-[#2D2D2D] placeholder:text-[#888] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D]"
              />
            </div>

            <div className="text-xs text-[#666] font-medium hidden sm:flex items-center gap-1.5 bg-white/60 px-3.5 py-1.5 rounded-full border border-white/70 shadow-2xs">
              <span>📍</span>
              <span className="font-bold text-[#8B1D1D]">มธ. ศูนย์รังสิต</span>
              <span>({filteredActivities.length} กิจกรรม)</span>
            </div>
          </div>

          {/* Activities Cards Grid */}
          {filteredActivities.length === 0 ? (
            <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-12 text-center border border-white/70 shadow-md space-y-2">
              <div className="text-4xl">🔍</div>
              <h3 className="text-base font-bold text-[#2D2D2D] font-kanit">
                ไม่พบกิจกรรมที่คุณกำลังค้นหา
              </h3>
              <p className="text-xs text-[#666]">ลองเปลี่ยนคำค้นหาดูนะ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((act) => (
                <ActivityCard
                  key={act.id}
                  activity={act}
                  onViewRooms={() => handleSelectActivity(act.id)}
                  onCreateRoom={() => openCreateRoomFlow('university', act)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
