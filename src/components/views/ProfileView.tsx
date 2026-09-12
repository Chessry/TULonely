import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { RoomCard } from '../cards/RoomCard';
import { ActivityCard } from '../cards/ActivityCard';
import { maskStudentId } from '../../utils/helpers';
import {
  Edit3,
  Calendar,
  Heart,
  History,
  LayoutGrid,
  Plus,
  ShieldCheck,
  LogOut,
  Lock,
  UserPlus,
  LogIn,
  Sparkles,
  CheckCircle2,
  Users,
  Compass,
  ArrowRight,
  Camera,
  Upload,
  Link as LinkIcon,
  X,
  Check,
} from 'lucide-react';

const PRESET_AVATARS = [
  {
    id: 'av-1',
    name: 'สไตล์ 1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-2',
    name: 'สไตล์ 2',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-3',
    name: 'สไตล์ 3',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-4',
    name: 'สไตล์ 4',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-5',
    name: 'สไตล์ 5',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-6',
    name: 'สไตล์ 6',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-7',
    name: 'สไตล์ 7',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-8',
    name: 'สไตล์ 8',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-9',
    name: 'สไตล์ 9',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-10',
    name: 'สไตล์ 10',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-11',
    name: 'สไตล์ 11',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-12',
    name: 'สไตล์ 12',
    url: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=300&auto=format&fit=crop&q=80',
  },
];

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    isLoggedIn,
    login,
    updateUserProfile,
    rooms,
    universityActivities,
    openCreateRoomFlow,
    openEditRoomModal,
    setIsAuthModalOpen,
    logout,
    showToast,
  } = useApp();

  const navigate = useNavigate();

  type ProfileTab = 'my-board' | 'upcoming' | 'favorites' | 'history';
  const [activeTab, setActiveTab] = useState<ProfileTab>('my-board');
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [name, setName] = useState(currentUser.name);
  const [fullName, setFullName] = useState(currentUser.fullName || 'ณภัทร ปิติเจริญวงศ์');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [faculty, setFaculty] = useState(currentUser.faculty);
  const [campus, setCampus] = useState(currentUser.campus);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [interestsInput, setInterestsInput] = useState(currentUser.interests.join(' '));

  // Avatar customization modal state
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState(currentUser.avatar);
  const [avatarTab, setAvatarTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customUrlInput, setCustomUrlInput] = useState('');

  // Sync edit form with currentUser updates
  React.useEffect(() => {
    setName(currentUser.name);
    setFullName(currentUser.fullName || 'ณภัทร ปิติเจริญวงศ์');
    setBio(currentUser.bio || '');
    setFaculty(currentUser.faculty);
    setCampus(currentUser.campus);
    setAvatar(currentUser.avatar);
    setTempAvatar(currentUser.avatar);
    setInterestsInput(currentUser.interests.join(' '));
  }, [currentUser]);

  // Handle escape key for Avatar modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAvatarModalOpen) {
        setIsAvatarModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAvatarModalOpen]);

  const handleOpenAvatarModal = () => {
    setTempAvatar(avatar);
    setIsAvatarModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('ขนาดไฟล์ต้องไม่เกิน 5 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setTempAvatar(reader.result);
        showToast('โหลดรูปภาพเรียบร้อย ✨');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) {
      showToast('กรุณากรอก URL รูปภาพ');
      return;
    }
    setTempAvatar(customUrlInput.trim());
    showToast('นำเข้า URL รูปภาพเรียบร้อย');
  };

  const handleConfirmAvatar = () => {
    setAvatar(tempAvatar);
    setIsAvatarModalOpen(false);
    showToast('เปลี่ยนรูปโปรไฟล์เรียบร้อย (อย่าลืมกดบันทึกข้อมูล) ✨');
  };

  const handleCancelEdit = () => {
    setName(currentUser.name);
    setFullName(currentUser.fullName || 'ณภัทร ปิติเจริญวงศ์');
    setBio(currentUser.bio || '');
    setFaculty(currentUser.faculty);
    setCampus(currentUser.campus);
    setAvatar(currentUser.avatar);
    setInterestsInput(currentUser.interests.join(' '));
    setIsEditing(false);
  };

  // 1. My Board: Rooms created by current user
  const myBoardRooms = rooms.filter((r) => r.creator.id === currentUser.id);

  // 2. Upcoming Activities: Rooms where current user is a participant
  const upcomingRooms = rooms.filter((r) =>
    r.participants.some((p) => p.id === currentUser.id && !p.isHost)
  );

  // 3. Favorites: Rooms & Activities bookmarked
  const favoriteRoomsList = rooms.filter((r) => currentUser.favoriteRooms.includes(r.id));
  const favoriteActivitiesList = universityActivities.filter((a) =>
    currentUser.favoriteActivities.includes(a.id)
  );

  // 4. History: Past/Expired rooms or attended
  const historyRooms = rooms.filter(
    (r) =>
      r.participants.some((p) => p.id === currentUser.id) && r.status === 'expired'
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedInterests = interestsInput
      .split(/[\s,]+/)
      .map((t) => (t.startsWith('#') ? t : `#${t}`))
      .filter((t) => t.length > 1);

    updateUserProfile({
      name: name.trim() || currentUser.name,
      fullName: fullName.trim() || currentUser.fullName || 'ณภัทร ปิติเจริญวงศ์',
      bio: bio.trim(),
      faculty,
      campus,
      avatar,
      interests: parsedInterests.length > 0 ? parsedInterests : currentUser.interests,
    });
    setIsEditing(false);
  };

  // If user is not logged in / registered yet, show dedicated Registration & Login Required screen
  if (!isLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
        {/* Header Banner - Frosted Glass Gradient */}
        <div className="bg-gradient-to-r from-[#8B1D1D]/90 to-[#6D0E1C]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-white/30 text-center sm:text-left">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/30">
              <Lock className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบนักศึกษา มธ.</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-kanit">
              โปรไฟล์ของฉัน
            </h1>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              หน้านี้สำหรับจัดการข้อมูลส่วนตัว บอร์ดกิจกรรมที่คุณสร้าง กิจกรรมที่กำลังจะไป และรายการโปรดของคุณ
            </p>
          </div>
        </div>

        {/* Auth Gate Card - Frosted Glass */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/80 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#8B1D1D]/10 border border-[#8B1D1D]/20 flex items-center justify-center text-[#8B1D1D] shadow-inner">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2D2D2D] font-kanit">
              กรุณาลงทะเบียนหรือเข้าสู่ระบบก่อน
            </h2>
            <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
              คุณต้องยืนยันตัวตนด้วยรหัสนักศึกษาธรรมศาสตร์ <span className="font-bold text-[#8B1D1D]">10 หลัก</span> เพื่อเข้าถึงโปรไฟล์ บอร์ดห้องของคุณ และประวัติการเข้าร่วม
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>ลงทะเบียนนักศึกษาใหม่</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/80 hover:bg-white text-[#8B1D1D] font-bold text-xs sm:text-sm rounded-2xl border border-[#8B1D1D]/30 shadow-xs hover:border-[#8B1D1D] transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบ (Login)</span>
            </button>
          </div>

          {/* 1-Click Fast Demo Accounts for testing */}
          <div className="pt-4 border-t border-white/70">
            <p className="text-xs text-[#777] font-medium mb-3 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>หรือเข้าสู่ระบบด่วนด้วยบัญชีตัวอย่าง (1-Click Demo):</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
              <button
                type="button"
                onClick={() =>
                  login({
                    studentId: '6702610012',
                    name: 'น้องนวมินทร์ Freshy',
                    email: 'nawamin.tu67@dome.tu.ac.th',
                  })
                }
                className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/60 hover:bg-white backdrop-blur-xs border border-white/80 shadow-2xs hover:border-[#8B1D1D]/40 transition-all text-left cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Nawamin"
                  className="w-8 h-8 rounded-full object-cover border border-white"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#2D2D2D] truncate">น้องนวมินทร์</p>
                  <p className="text-[10px] text-[#777] truncate">TBS ปี 1 (มธ.67)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  login({
                    studentId: '6609650084',
                    name: 'Noah TSE',
                    email: 'noah.tse66@dome.tu.ac.th',
                  })
                }
                className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/60 hover:bg-white backdrop-blur-xs border border-white/80 shadow-2xs hover:border-[#8B1D1D]/40 transition-all text-left cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80"
                  alt="Noah"
                  className="w-8 h-8 rounded-full object-cover border border-white"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#2D2D2D] truncate">Noah TSE</p>
                  <p className="text-[10px] text-[#777] truncate">วิศวะ ปี 3 (มธ.65)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  login({
                    studentId: '6501650341',
                    name: 'ฟ้าใส ศิลปศาสตร์',
                    email: 'fahhsai.arts@dome.tu.ac.th',
                  })
                }
                className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/60 hover:bg-white backdrop-blur-xs border border-white/80 shadow-2xs hover:border-[#8B1D1D]/40 transition-all text-left cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                  alt="Fahsai"
                  className="w-8 h-8 rounded-full object-cover border border-white"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#2D2D2D] truncate">ฟ้าใส ศิลปศาสตร์</p>
                  <p className="text-[10px] text-[#777] truncate">ศิลปศาสตร์ ปี 2</p>
                </div>
              </button>
            </div>
          </div>

          {/* Benefits Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left border-t border-white/60">
            <div className="bg-white/40 backdrop-blur-xs p-4 rounded-2xl border border-white/60 shadow-2xs space-y-1">
              <span className="text-xl">📋</span>
              <h4 className="text-xs font-bold text-[#2D2D2D]">My Board & ห้องของฉัน</h4>
              <p className="text-[11px] text-[#666]">ดูและจัดการห้องหาเพื่อนที่คุณสร้าง สมาชิก และสถานะห้อง</p>
            </div>

            <div className="bg-white/40 backdrop-blur-xs p-4 rounded-2xl border border-white/60 shadow-2xs space-y-1">
              <span className="text-xl">🏃</span>
              <h4 className="text-xs font-bold text-[#2D2D2D]">กิจกรรมที่จะไป (Upcoming)</h4>
              <p className="text-[11px] text-[#666]">ติดตามนัดหมายและกิจกรรมที่คุณกดเข้าร่วม ไม่พลาดทุกนัด</p>
            </div>

            <div className="bg-white/40 backdrop-blur-xs p-4 rounded-2xl border border-white/60 shadow-2xs space-y-1">
              <span className="text-xl">💗</span>
              <h4 className="text-xs font-bold text-[#2D2D2D]">รายการโปรด & ประวัติ</h4>
              <p className="text-[11px] text-[#666]">บันทึกห้องและกิจกรรมที่สนใจ พร้อมย้อนดูประวัติกิจกรรมเดิม</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-16">
      {/* Profile Header Card - Frosted Glass */}
      <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border border-white/80 shadow-lg relative overflow-hidden">
        {/* Background accent bar */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-[#8B1D1D] via-[#A8283B] to-[#F27D26] opacity-90" />

        <div className="relative pt-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          {/* Avatar & Student Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={isEditing ? avatar : currentUser.avatar}
                alt={currentUser.name}
                className={`w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-white transition-all ${
                  isEditing ? 'ring-4 ring-[#8B1D1D]/30' : ''
                }`}
              />
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleOpenAvatarModal}
                  className="absolute inset-0 rounded-full bg-black/45 hover:bg-black/60 text-white flex flex-col items-center justify-center gap-1 transition-all backdrop-blur-2xs cursor-pointer shadow-md group"
                  title="คลิกเพื่อเปลี่ยนรูปโปรไฟล์"
                >
                  <div className="p-1.5 rounded-full bg-white/20 group-hover:bg-[#8B1D1D] transition-colors">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white tracking-wide">เปลี่ยนรูป</span>
                </button>
              ) : (
                <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-2xs" title="สถานะออนไลน์" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2D2D] font-kanit">
                  {currentUser.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50/90 text-emerald-800 border border-emerald-200 shadow-2xs">
                  <ShieldCheck className="w-3 h-3" />
                  <span>นักศึกษา มธ. ยืนยันแล้ว</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#555] flex-wrap font-medium">
                <span className="font-bold text-[#8B1D1D]">{currentUser.faculty}</span>
                <span>•</span>
                <span>รหัสนักศึกษา: {maskStudentId(currentUser.studentId)}</span>
                <span>•</span>
                <span>ชื่อจริง - นามสกุล: <span className="font-semibold text-[#2D2D2D]">{currentUser.fullName || 'ณภัทร ปิติเจริญวงศ์'}</span></span>
                <span>•</span>
                <span>มธ. {currentUser.campus}</span>
              </div>

              <p className="text-xs sm:text-sm text-[#444] max-w-xl pt-1 leading-relaxed">
                {currentUser.bio || 'ยังไม่มีคำแนะนำตัว'}
              </p>

              {/* Interests chips */}
              {currentUser.interests && currentUser.interests.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-2">
                  {currentUser.interests.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-white/70 backdrop-blur-xs text-[#8B1D1D] border border-white/80 shadow-2xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => {
                if (isEditing) {
                  handleCancelEdit();
                } else {
                  setIsEditing(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/70 hover:bg-white backdrop-blur-md text-[#333] border border-white/80 text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#8B1D1D]" />
              <span>{isEditing ? 'ปิดการแก้ไข' : 'แก้ไขโปรไฟล์'}</span>
            </button>

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/70 hover:bg-white backdrop-blur-md text-[#333] border border-white/80 text-xs font-bold shadow-xs transition-all cursor-pointer"
              title="สลับหรือจัดการบัญชี"
            >
              <span>สลับบัญชี</span>
            </button>

            <button
              onClick={logout}
              className="p-2 rounded-full bg-rose-50/80 hover:bg-rose-100 backdrop-blur-xs border border-rose-200 text-rose-600 shadow-xs transition-colors cursor-pointer"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inline Edit Profile Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-white/70 space-y-4">
            <h3 className="text-sm font-bold text-[#8B1D1D] font-kanit">แก้ไขข้อมูลโปรไฟล์</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#555] mb-1">ชื่อเล่น / ชื่อเรียก</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/70 border border-white/80 rounded-2xl px-3.5 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#555]">ชื่อจริง - นามสกุล</label>
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#8B1D1D] font-medium bg-[#8B1D1D]/5 px-2 py-0.5 rounded-full">
                    <Lock className="w-2.5 h-2.5" />
                    <span>แก้ไขไม่ได้</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={currentUser.fullName || 'ณภัทร ปิติเจริญวงศ์'}
                    className="w-full bg-black/5 border border-white/60 rounded-2xl px-3.5 py-2 text-xs text-[#666] cursor-not-allowed select-none font-medium shadow-inner"
                  />
                  <Lock className="w-3.5 h-3.5 text-[#999] absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#555]">คณะ / วิทยาลัย</label>
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#8B1D1D] font-medium bg-[#8B1D1D]/5 px-2 py-0.5 rounded-full">
                    <Lock className="w-2.5 h-2.5" />
                    <span>แก้ไขไม่ได้</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={currentUser.faculty}
                    className="w-full bg-black/5 border border-white/60 rounded-2xl px-3.5 py-2 text-xs text-[#666] cursor-not-allowed select-none font-medium shadow-inner"
                  />
                  <Lock className="w-3.5 h-3.5 text-[#999] absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#555]">ศูนย์การศึกษา</label>
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#8B1D1D] font-medium bg-[#8B1D1D]/5 px-2 py-0.5 rounded-full">
                    <Lock className="w-2.5 h-2.5" />
                    <span>แก้ไขไม่ได้</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={`มธ. ${currentUser.campus}`}
                    className="w-full bg-black/5 border border-white/60 rounded-2xl px-3.5 py-2 text-xs text-[#666] cursor-not-allowed select-none font-medium shadow-inner"
                  />
                  <Lock className="w-3.5 h-3.5 text-[#999] absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#555] mb-1">สิ่งที่สนใจ (คั่นด้วยวรรค หรือ #)</label>
                <input
                  type="text"
                  value={interestsInput}
                  onChange={(e) => setInterestsInput(e.target.value)}
                  placeholder="#บอร์ดเกม #วิ่งGym4 #ตี๋น้อย"
                  className="w-full bg-white/70 border border-white/80 rounded-2xl px-3.5 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1">คำแนะนำตัว (Bio)</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="เขียนแนะนำตัวเองสั้นๆ เพื่อให้เพื่อนๆ รู้จัก..."
                className="w-full bg-white/70 border border-white/80 rounded-2xl p-3 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D]"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 text-xs font-semibold text-[#666] hover:bg-white/60 rounded-xl transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                บันทึกข้อมูล
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Tabs Matrix: 1. My Board, 2. Upcoming, 3. Favorites, 4. History */}
      <div className="space-y-6">
        {/* Navigation Tabs - Frosted Glass */}
        <div className="flex items-center gap-2 border-b border-white/70 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('my-board')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap backdrop-blur-md ${
              activeTab === 'my-board'
                ? 'bg-white/90 text-[#8B1D1D] shadow-md border border-[#8B1D1D]/30'
                : 'bg-white/40 text-[#666] hover:bg-white/70 border border-white/60 shadow-2xs'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>My Board ({myBoardRooms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap backdrop-blur-md ${
              activeTab === 'upcoming'
                ? 'bg-white/90 text-[#8B1D1D] shadow-md border border-[#8B1D1D]/30'
                : 'bg-white/40 text-[#666] hover:bg-white/70 border border-white/60 shadow-2xs'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>กิจกรรมที่จะไป ({upcomingRooms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap backdrop-blur-md ${
              activeTab === 'favorites'
                ? 'bg-white/90 text-[#8B1D1D] shadow-md border border-[#8B1D1D]/30'
                : 'bg-white/40 text-[#666] hover:bg-white/70 border border-white/60 shadow-2xs'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>รายการโปรด ({favoriteRoomsList.length + favoriteActivitiesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap backdrop-blur-md ${
              activeTab === 'history'
                ? 'bg-white/90 text-[#8B1D1D] shadow-md border border-[#8B1D1D]/30'
                : 'bg-white/40 text-[#666] hover:bg-white/70 border border-white/60 shadow-2xs'
            }`}
          >
            <History className="w-4 h-4" />
            <span>ประวัติกิจกรรม ({historyRooms.length})</span>
          </button>
        </div>

        {/* Tab 1: My Board (Rooms created by current user) */}
        {activeTab === 'my-board' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#666]">ห้องหาเพื่อนที่คุณเป็นผู้สร้าง จัดการและดูสมาชิกได้ที่นี่</p>
              <button
                onClick={() => openCreateRoomFlow()}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#8B1D1D] text-white text-xs font-bold shadow-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>สร้างห้องใหม่</span>
              </button>
            </div>

            {myBoardRooms.length === 0 ? (
              <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-10 text-center border border-white/70 shadow-md space-y-2">
                <div className="text-4xl">📝</div>
                <h3 className="text-sm font-bold text-[#2D2D2D]">คุณยังไม่ได้สร้างห้องหาเพื่อน</h3>
                <p className="text-xs text-[#666]">ชวนเพื่อนไปทำกิจกรรมแรกของคุณกันเลย</p>
                <button
                  onClick={() => openCreateRoomFlow()}
                  className="mt-2 px-5 py-2 bg-[#8B1D1D] text-white text-xs font-bold rounded-full shadow-md cursor-pointer"
                >
                  สร้างห้องใหม่ 🚀
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myBoardRooms.map((room) => (
                  <div key={room.id} className="relative group/mycard flex flex-col justify-between">
                    <RoomCard room={room} />
                    <div className="mt-2.5 flex items-center justify-between px-3.5 py-2 rounded-2xl bg-white/50 backdrop-blur-xs border border-white/70 shadow-2xs">
                      <span className="text-[11px] font-semibold text-[#666]">
                        👥 {room.participants.length}/{room.maxParticipants} สมาชิก
                      </span>
                      <button
                        type="button"
                        onClick={() => openEditRoomModal(room)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-[#8B1D1D] hover:text-[#6D0E1C] border border-[#8B1D1D]/25 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                        title="แก้ไขข้อมูลบอร์ดนี้"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#8B1D1D]" />
                        <span>แก้ไขบอร์ด</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Upcoming Activities */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            <p className="text-xs text-[#666]">ห้องและกิจกรรมที่คุณได้กดเข้าร่วม (Join) ไว้แล้ว</p>
            {upcomingRooms.length === 0 ? (
              <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-10 text-center border border-white/70 shadow-md space-y-2">
                <div className="text-4xl">🏃</div>
                <h3 className="text-sm font-bold text-[#2D2D2D]">ยังไม่มีกิจกรรมที่กำลังจะเข้าร่วม</h3>
                <p className="text-xs text-[#666]">ไปหาห้องที่น่าสนใจแล้วกด Join ได้เลย!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {upcomingRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Favorites */}
        {activeTab === 'favorites' && (
          <div className="space-y-6">
            {/* Favorite Activities */}
            {favoriteActivitiesList.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#8B1D1D]">⭐ กิจกรรม มธ. ที่บันทึกไว้</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {favoriteActivitiesList.map((act) => (
                    <ActivityCard key={act.id} activity={act} />
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Rooms */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#8B1D1D]">💗 ห้องหาเพื่อนที่บันทึกไว้</h3>
              {favoriteRoomsList.length === 0 ? (
                <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-8 text-center border border-white/70 shadow-md">
                  <p className="text-xs text-[#666]">ยังไม่ได้บันทึกห้องใดไว้</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {favoriteRoomsList.map((room) => (
                    <RoomCard key={room.id} room={room} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <p className="text-xs text-[#666]">ประวัติห้องที่ปิดรับหรือเสร็จสิ้นกิจกรรมแล้ว</p>
            {historyRooms.length === 0 ? (
              <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-10 text-center border border-white/70 shadow-md space-y-2">
                <div className="text-4xl">📜</div>
                <h3 className="text-sm font-bold text-[#2D2D2D]">ยังไม่มีประวัติกิจกรรมในอดีต</h3>
                <p className="text-xs text-[#666]">เมื่อห้องหมดอายุหรือเสร็จสิ้นจะถูกจัดเก็บไว้ที่นี่</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {historyRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Avatar Selection Modal */}
      {isAvatarModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAvatarModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg bg-[#FDFBF7]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden my-6 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#8B1D1D] to-[#6D0E1C] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/30 text-amber-300 shadow-inner">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-kanit">เปลี่ยนรูปโปรไฟล์อย่างอิสระ</h3>
                  <p className="text-[11px] text-white/80">เลือกรูปพรีเซ็ต อัปโหลด หรือใส่ URL (กด Esc เพื่อปิด)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="ปิด (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Preview Card */}
              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-3.5 border border-white/80 shadow-xs flex items-center gap-4">
                <div className="relative">
                  <img
                    src={tempAvatar}
                    alt="Selected Avatar Preview"
                    className="w-16 h-16 rounded-full object-cover border-3 border-[#8B1D1D] shadow-md bg-white shrink-0"
                  />
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-2xs" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#8B1D1D] font-kanit">ตัวอย่างรูปโปรไฟล์ที่จะแสดง</span>
                    <span className="text-[10px] bg-[#8B1D1D]/10 text-[#8B1D1D] px-2 py-0.2 rounded-full font-semibold">Live Preview</span>
                  </div>
                  <p className="text-[11px] text-[#666] mt-0.5 truncate">
                    {name} ({currentUser.studentId ? maskStudentId(currentUser.studentId) : 'TU Student'})
                  </p>
                </div>
              </div>

              {/* Mode Selector Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-white/50 backdrop-blur-xs rounded-2xl border border-white/80">
                <button
                  type="button"
                  onClick={() => setAvatarTab('presets')}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    avatarTab === 'presets'
                      ? 'bg-[#8B1D1D] text-white shadow-xs'
                      : 'text-[#666] hover:bg-white/60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>รูปพรีเซ็ต</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAvatarTab('upload')}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    avatarTab === 'upload'
                      ? 'bg-[#8B1D1D] text-white shadow-xs'
                      : 'text-[#666] hover:bg-white/60'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>อัปโหลดรูป</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAvatarTab('url')}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    avatarTab === 'url'
                      ? 'bg-[#8B1D1D] text-white shadow-xs'
                      : 'text-[#666] hover:bg-white/60'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>ใส่ลิงก์ URL</span>
                </button>
              </div>

              {/* Tab 1: Presets */}
              {avatarTab === 'presets' && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#555]">
                    เลือกรูปสไตล์นักศึกษาที่ชอบ:
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-60 overflow-y-auto p-1">
                    {PRESET_AVATARS.map((p) => {
                      const isSelected = tempAvatar === p.url;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setTempAvatar(p.url)}
                          className={`relative rounded-2xl p-1.5 transition-all cursor-pointer flex flex-col items-center group ${
                            isSelected
                              ? 'ring-2 ring-[#8B1D1D] bg-[#8B1D1D]/10 shadow-md scale-105'
                              : 'hover:bg-white/80 hover:scale-102 border border-transparent bg-white/40'
                          }`}
                        >
                          <img
                            src={p.url}
                            alt={p.name}
                            className="w-12 h-12 rounded-full object-cover shadow-xs border border-white"
                          />
                          <span className={`text-[10px] mt-1 font-medium ${isSelected ? 'text-[#8B1D1D] font-bold' : 'text-[#666]'}`}>
                            {p.name}
                          </span>
                          {isSelected && (
                            <span className="absolute top-0 right-0 w-4 h-4 bg-[#8B1D1D] rounded-full text-white flex items-center justify-center text-[10px] shadow-xs">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 2: Upload */}
              {avatarTab === 'upload' && (
                <div className="space-y-3">
                  <label className="block group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-[#8B1D1D]/30 group-hover:border-[#8B1D1D] bg-white/50 group-hover:bg-white/80 rounded-2xl p-6 text-center transition-all shadow-xs">
                      <div className="w-12 h-12 rounded-full bg-[#8B1D1D]/10 text-[#8B1D1D] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-[#2D2D2D]">คลิกเพื่อเลือกไฟล์รูปภาพจากอุปกรณ์ของคุณ</p>
                      <p className="text-[11px] text-[#777] mt-1">รองรับ JPG, PNG, WebP, GIF (ขนาดไม่เกิน 5MB)</p>
                    </div>
                  </label>
                  <p className="text-[11px] text-[#666] bg-amber-50/80 border border-amber-200/80 p-2.5 rounded-xl">
                    💡 รูปจะถูกแปลงเป็น Data URL สำหรับใช้งานในโปรไฟล์ของคุณได้ทันที
                  </p>
                </div>
              )}

              {/* Tab 3: URL */}
              {avatarTab === 'url' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#555] mb-1">วางลิงก์รูปภาพ (Direct Image URL)</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={customUrlInput}
                        onChange={(e) => setCustomUrlInput(e.target.value)}
                        placeholder="https://images.unsplash.com/... หรือ https://..."
                        className="flex-1 bg-white/70 border border-white/80 rounded-xl px-3 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCustomUrl}
                        className="px-3.5 py-2 bg-white/80 hover:bg-white text-[#8B1D1D] border border-[#8B1D1D]/30 text-xs font-bold rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer whitespace-nowrap"
                      >
                        นำไปใช้
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#777]">
                    💡 รองรับ URL รูปภาพที่เปิดสาธารณะจาก Unsplash, Imgur, หรือบริการฝากรูปอื่นๆ
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white/40 border-t border-white/70 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#666] hover:bg-white/60 rounded-xl transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmAvatar}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#8B1D1D] to-[#6D0E1C] hover:from-[#6D0E1C] hover:to-[#500812] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>ยืนยันเลือกรูปนี้</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
