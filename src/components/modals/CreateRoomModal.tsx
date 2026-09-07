import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryType } from '../../types';
import { CATEGORY_METADATA } from '../../data/mockData';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Building,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface FormErrors {
  title?: string;
  location?: string;
  activityDate?: string;
  activityTime?: string;
  deadline?: string;
  maxParticipants?: string;
}

export const CreateRoomModal: React.FC = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    preselectedCategoryForRoom,
    preselectedActivityForRoom,
    createRoom,
    universityActivities,
  } = useApp();

  // Form states
  const [category, setCategory] = useState<CategoryType>('food');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [activityTime, setActivityTime] = useState('17:00');
  const [location, setLocation] = useState('');
  const [campus, setCampus] = useState<string>('ศูนย์รังสิต');
  const [maxParticipants, setMaxParticipants] = useState<number>(4);
  const [tagsInput, setTagsInput] = useState('');

  // Recruitment deadline configuration
  const [deadlineMode, setDeadlineMode] = useState<'duration' | 'custom'>('duration');
  const [hoursBeforeActivity, setHoursBeforeActivity] = useState<number>(4);
  const [customDeadlineDate, setCustomDeadlineDate] = useState('');
  const [customDeadlineTime, setCustomDeadlineTime] = useState('12:00');

  // University Activity connection
  const [selectedUnivActId, setSelectedUnivActId] = useState<string>('');

  // Validation & Loading states
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Today ISO string for min date
  const todayIso = new Date().toISOString().split('T')[0];

  // Initialize or update form on open
  useEffect(() => {
    if (!isCreateModalOpen) {
      setErrors({});
      setIsSubmitting(false);
      return;
    }

    if (preselectedCategoryForRoom) {
      setCategory(preselectedCategoryForRoom);
    }

    if (preselectedActivityForRoom) {
      setCategory('university');
      setSelectedUnivActId(preselectedActivityForRoom.id);
      setTitle(`หาเพื่อนไปงาน ${preselectedActivityForRoom.title}`);
      setLocation(preselectedActivityForRoom.location);
      setCampus(preselectedActivityForRoom.campus);
      setActivityDate(todayIso);
      setActivityTime('17:00');
    } else {
      // Default to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isoTomorrow = tomorrow.toISOString().split('T')[0];
      setActivityDate(isoTomorrow);
      setCustomDeadlineDate(isoTomorrow);
    }
  }, [preselectedCategoryForRoom, preselectedActivityForRoom, isCreateModalOpen, todayIso]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isCreateModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        setIsCreateModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreateModalOpen, isSubmitting, setIsCreateModalOpen]);

  if (!isCreateModalOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. Title validation
    if (!title.trim()) {
      newErrors.title = 'กรุณากรอกชื่อห้องหรือสิ่งที่ต้องการชวนทำ';
    } else if (title.trim().length < 3) {
      newErrors.title = 'ชื่อห้องควรมีความยาวอย่างน้อย 3 ตัวอักษร';
    }

    // 2. Location validation
    if (!location.trim()) {
      newErrors.location = 'กรุณาระบุสถานที่นัดพบ เช่น โรงอาหาร SC หรือ หอสมุดป๋วย';
    }

    // 3. Max participants validation
    if (!maxParticipants || maxParticipants < 2) {
      newErrors.maxParticipants = 'จำนวนเพื่อนต้องอย่างน้อย 2 คนขึ้นไป';
    } else if (maxParticipants > 50) {
      newErrors.maxParticipants = 'จำนวนเพื่อนต้องไม่เกิน 50 คน';
    }

    // 4. Activity Date & Time validation
    if (!activityDate) {
      newErrors.activityDate = 'กรุณาระบุวันที่ทำกิจกรรม';
    }

    const timeString = activityTime.trim() || '12:00';
    let actDateTime: Date | null = null;
    if (activityDate) {
      const [year, month, day] = activityDate.split('-').map(Number);
      const [hours, minutes] = timeString.split(':').map(Number);
      if (year && month && day) {
        actDateTime = new Date(year, month - 1, day, hours || 0, minutes || 0);
      } else {
        const parsed = new Date(`${activityDate}T${timeString}:00`);
        if (!isNaN(parsed.getTime())) actDateTime = parsed;
      }

      if (actDateTime && actDateTime.getTime() < Date.now() - 5 * 60 * 1000) {
        newErrors.activityDate = 'วันและเวลานัดหมายต้องไม่เป็นเวลาในอดีต';
      }
    }

    // 5. Deadline validation
    if (deadlineMode === 'custom') {
      if (!customDeadlineDate) {
        newErrors.deadline = 'กรุณาระบุวันที่ปิดรับสมัคร';
      } else {
        const dTimeString = customDeadlineTime.trim() || '12:00';
        const [cy, cm, cd] = customDeadlineDate.split('-').map(Number);
        const [ch, cmin] = dTimeString.split(':').map(Number);
        const deadlineDate = (cy && cm && cd)
          ? new Date(cy, cm - 1, cd, ch || 0, cmin || 0)
          : new Date(`${customDeadlineDate}T${dTimeString}:00`);

        if (!isNaN(deadlineDate.getTime())) {
          if (deadlineDate.getTime() < Date.now() - 5 * 60 * 1000) {
            newErrors.deadline = 'เวลาปิดรับสมาชิกต้องไม่อยู่ในอดีต';
          } else if (actDateTime && deadlineDate.getTime() > actDateTime.getTime()) {
            newErrors.deadline = 'เวลาปิดรับสมาชิกต้องอยู่ก่อนเวลาเริ่มกิจกรรม';
          }
        }
      }
    } else {
      // Duration mode: actDateTime minus hours
      if (actDateTime) {
        const deadlineEpoch = actDateTime.getTime() - hoursBeforeActivity * 3600000;
        if (deadlineEpoch < Date.now()) {
          newErrors.deadline = `เวลาปิดรับ (${hoursBeforeActivity} ชม. ก่อนเริ่ม) ผ่านมาแล้ว กรุณาลดชั่วโมงลงหรือกำหนดเวลาเอง`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate recruitment deadline ISO string
      let calculatedDeadlineIso = '';
      if (deadlineMode === 'custom' && customDeadlineDate) {
        const deadlineDateTime = new Date(`${customDeadlineDate}T${customDeadlineTime || '12:00'}:00`);
        calculatedDeadlineIso = deadlineDateTime.toISOString();
      } else {
        const actDateTime = new Date(`${activityDate}T${activityTime || '17:00'}:00`);
        const deadlineEpoch = isNaN(actDateTime.getTime())
          ? Date.now() + hoursBeforeActivity * 3600000
          : actDateTime.getTime() - hoursBeforeActivity * 3600000;

        calculatedDeadlineIso = new Date(Math.max(Date.now() + 1800000, deadlineEpoch)).toISOString();
      }

      // Parse tags
      const tags = tagsInput
        .split(/[\s,]+/)
        .map((t) => (t.startsWith('#') ? t : `#${t}`))
        .filter((t) => t.length > 1);

      const univAct =
        category === 'university'
          ? universityActivities.find((a) => a.id === selectedUnivActId)
          : undefined;

      // Small async feedback delay
      await new Promise((resolve) => setTimeout(resolve, 400));

      createRoom({
        title: title.trim(),
        description: description.trim() || 'มาจอยกันได้เลยทุกคน!',
        category,
        universityActivityId: univAct?.id,
        universityActivityTitle: univAct?.title,
        activityDate,
        activityTime,
        recruitmentDeadline: calculatedDeadlineIso,
        location: location.trim(),
        campus,
        maxParticipants: Math.max(2, maxParticipants),
        tags: tags.length > 0 ? tags : [CATEGORY_METADATA[category]?.popularTags[0] || '#หาเพื่อน'],
      });

      setIsCreateModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          setIsCreateModalOpen(false);
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-[#FDFBF7]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header - Frosted Gradient */}
        <div className="bg-gradient-to-r from-[#8B1D1D] to-[#6D0E1C] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">✨</span>
            <div>
              <h2 className="text-xl font-bold font-kanit">สร้างห้องหาเพื่อนใหม่ (Create Room)</h2>
              <p className="text-xs text-white/80">
                ตั้งห้องเพื่อชวนเพื่อนนักศึกษา มธ. ไปทำกิจกรรมด้วยกัน (กด Esc เพื่อปิด)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !isSubmitting && setIsCreateModalOpen(false)}
            disabled={isSubmitting}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Category Selector Buttons */}
          <div>
            <label className="block text-xs font-bold text-[#2D2D2D] mb-2">
              หมวดหมู่กิจกรรม <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['university', 'food', 'sports', 'study', 'entertainment'] as CategoryType[]).map(
                (catKey) => {
                  const meta = CATEGORY_METADATA[catKey];
                  const isSelected = category === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setCategory(catKey)}
                      className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#8B1D1D] text-white border-[#8B1D1D] shadow-md'
                          : 'bg-white/60 text-[#555] border-white/80 hover:bg-white'
                      }`}
                    >
                      <span className="text-xl">{meta.icon}</span>
                      <span>{meta.name}</span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* If University Category: Pick official activity */}
          {category === 'university' && (
            <div className="bg-white/50 backdrop-blur-sm p-3.5 rounded-2xl border border-white/80 space-y-2">
              <label className="block text-xs font-bold text-[#8B1D1D] flex items-center gap-1">
                <Building className="w-3.5 h-3.5" />
                <span>เลือกกิจกรรม มหาวิทยาลัยธรรมศาสตร์ ที่เกี่ยวข้อง</span>
              </label>
              <select
                value={selectedUnivActId}
                disabled={isSubmitting}
                onChange={(e) => {
                  const actId = e.target.value;
                  setSelectedUnivActId(actId);
                  const act = universityActivities.find((a) => a.id === actId);
                  if (act) {
                    setTitle(`หาเพื่อนไปงาน ${act.title}`);
                    setLocation(act.location);
                    setCampus(act.campus);
                    setActivityDate(todayIso);
                  }
                }}
                className="w-full bg-white/70 border border-white/90 rounded-xl px-3 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D]"
              >
                <option value="">-- ไม่ระบุ / กิจกรรมทั่วไป --</option>
                {universityActivities.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.title} ({act.campus})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Room Title */}
          <div>
            <label className="block text-xs font-bold text-[#2D2D2D] mb-1">
              ชื่อห้อง / สิ่งที่อยากชวนทำ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              disabled={isSubmitting}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="เช่น หาเพื่อนกินตี๋น้อย 4 คนเย็นนี้, ติวแคล 1 ก่อนสอบมิดเทอม"
              className={`w-full bg-white/60 backdrop-blur-sm border rounded-xl px-3.5 py-2 text-xs text-[#2D2D2D] placeholder:text-[#888] focus:outline-none focus:bg-white focus:ring-2 transition-colors ${
                errors.title
                  ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                  : 'border-white/80 focus:ring-[#8B1D1D]'
              }`}
            />
            {errors.title && (
              <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#2D2D2D] mb-1">
              รายละเอียดเพิ่มเติม / นัดหมาย
            </label>
            <textarea
              rows={2}
              value={description}
              disabled={isSubmitting}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="บอกรายละเอียด เช่น นัดเจอกันที่ไหน หารเท่า หรือเตรียมอุปกรณ์อะไรมาบ้าง"
              className="w-full bg-white/60 backdrop-blur-sm border border-white/80 rounded-xl px-3.5 py-2 text-xs text-[#2D2D2D] placeholder:text-[#888] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D]"
            />
          </div>

          {/* Date, Time & Max Participants */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2D2D2D] mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#8B1D1D]" />
                <span>วันที่ทำกิจกรรม <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="date"
                min={todayIso}
                value={activityDate}
                disabled={isSubmitting}
                onChange={(e) => {
                  setActivityDate(e.target.value);
                  if (errors.activityDate) setErrors((prev) => ({ ...prev, activityDate: undefined }));
                }}
                className={`w-full bg-white/60 backdrop-blur-sm border rounded-xl px-3 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 transition-colors ${
                  errors.activityDate
                    ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                    : 'border-white/80 focus:ring-[#8B1D1D]'
                }`}
              />
              {errors.activityDate && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.activityDate}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2D2D] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#8B1D1D]" />
                <span>เวลาเริ่มกิจกรรม</span>
              </label>
              <input
                type="time"
                value={activityTime}
                disabled={isSubmitting}
                onChange={(e) => {
                  setActivityTime(e.target.value);
                  if (errors.activityDate) setErrors((prev) => ({ ...prev, activityDate: undefined }));
                }}
                className="w-full bg-white/60 backdrop-blur-sm border border-white/80 rounded-xl px-3 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2D2D] mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#8B1D1D]" />
                <span>จำนวนเพื่อนที่รับ (คน) <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="number"
                min={2}
                max={50}
                value={maxParticipants}
                disabled={isSubmitting}
                onChange={(e) => {
                  setMaxParticipants(parseInt(e.target.value) || 2);
                  if (errors.maxParticipants) setErrors((prev) => ({ ...prev, maxParticipants: undefined }));
                }}
                className={`w-full bg-white/60 backdrop-blur-sm border rounded-xl px-3 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 transition-colors ${
                  errors.maxParticipants
                    ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                    : 'border-white/80 focus:ring-[#8B1D1D]'
                }`}
              />
              {errors.maxParticipants && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.maxParticipants}</span>
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-[#2D2D2D] mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#8B1D1D]" />
              <span>สถานที่นัดพบ (มธ. ศูนย์รังสิต) <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              value={location}
              disabled={isSubmitting}
              onChange={(e) => {
                setLocation(e.target.value);
                if (errors.location) setErrors((prev) => ({ ...prev, location: undefined }));
              }}
              placeholder="เช่น โรงอาหาร SC, สุกี้ตี๋น้อย เชียงราก, หอสมุดป๋วย, Gym 4, U-Square"
              className={`w-full bg-white/60 backdrop-blur-sm border rounded-xl px-3.5 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 transition-colors ${
                errors.location
                  ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                  : 'border-white/80 focus:ring-[#8B1D1D]'
              }`}
            />
            {errors.location && (
              <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.location}</span>
              </p>
            )}
          </div>

          {/* Recruitment Deadline Settings */}
          <div className="bg-amber-50/70 backdrop-blur-xs p-4 rounded-2xl border border-amber-200/80 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8B1D1D] flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>กำหนดเวลาปิดรับสมาชิก (Recruitment Deadline)</span>
              </span>
              <span className="text-[10px] text-[#666]">แยกจากเวลากิจกรรม</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <label className="flex items-center gap-1 text-xs cursor-pointer">
                <input
                  type="radio"
                  name="deadlineMode"
                  disabled={isSubmitting}
                  checked={deadlineMode === 'duration'}
                  onChange={() => {
                    setDeadlineMode('duration');
                    if (errors.deadline) setErrors((prev) => ({ ...prev, deadline: undefined }));
                  }}
                  className="accent-[#8B1D1D]"
                />
                <span>ปิดรับก่อนเวลากิจกรรม (ชั่วโมง)</span>
              </label>
              <label className="flex items-center gap-1 text-xs cursor-pointer ml-3">
                <input
                  type="radio"
                  name="deadlineMode"
                  disabled={isSubmitting}
                  checked={deadlineMode === 'custom'}
                  onChange={() => {
                    setDeadlineMode('custom');
                    if (errors.deadline) setErrors((prev) => ({ ...prev, deadline: undefined }));
                  }}
                  className="accent-[#8B1D1D]"
                />
                <span>ระบุวันและเวลาปิดรับเอง</span>
              </label>
            </div>

            {deadlineMode === 'duration' ? (
              <div className="flex items-center gap-2">
                {[1, 2, 4, 12, 24].map((h) => (
                  <button
                    key={h}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setHoursBeforeActivity(h);
                      if (errors.deadline) setErrors((prev) => ({ ...prev, deadline: undefined }));
                    }}
                    className={`px-3 py-1 text-xs rounded-xl border font-semibold transition-all cursor-pointer ${
                      hoursBeforeActivity === h
                        ? 'bg-[#8B1D1D] text-white border-[#8B1D1D] shadow-2xs'
                        : 'bg-white text-[#555] border-white/90 hover:bg-stone-50'
                    }`}
                  >
                    ก่อน {h} ชม.
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  min={todayIso}
                  value={customDeadlineDate}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setCustomDeadlineDate(e.target.value);
                    if (errors.deadline) setErrors((prev) => ({ ...prev, deadline: undefined }));
                  }}
                  className="bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs text-[#2D2D2D] focus:ring-2 focus:ring-[#8B1D1D] focus:outline-none"
                />
                <input
                  type="time"
                  value={customDeadlineTime}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setCustomDeadlineTime(e.target.value);
                    if (errors.deadline) setErrors((prev) => ({ ...prev, deadline: undefined }));
                  }}
                  className="bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs text-[#2D2D2D] focus:ring-2 focus:ring-[#8B1D1D] focus:outline-none"
                />
              </div>
            )}

            {errors.deadline && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.deadline}</span>
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-[#2D2D2D] mb-1">
              แฮชแท็ก (#) คั่นด้วยวรรค
            </label>
            <input
              type="text"
              value={tagsInput}
              disabled={isSubmitting}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="เช่น #สุกี้ตี๋น้อย #หารค่ารถ #Freshy"
              className="w-full bg-white/60 backdrop-blur-sm border border-white/80 rounded-xl px-3.5 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/70">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#555] hover:bg-white/60 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#8B1D1D] hover:bg-[#6D0E1C] disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังสร้างห้อง...</span>
                </>
              ) : (
                <span>โพสต์สร้างห้องหาเพื่อน 🚀</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
