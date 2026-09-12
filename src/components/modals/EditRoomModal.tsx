import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryType } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Building,
  AlertCircle,
  Loader2,
  Tag,
  Edit3,
  Check,
  Plus,
} from 'lucide-react';

interface FormErrors {
  title?: string;
  location?: string;
  activityDate?: string;
  activityTime?: string;
  maxParticipants?: string;
}

interface CategoryItemRow {
  id: number | string;
  category_id?: number;
  category?: string;
  name?: string;
  tag?: string;
  item_name?: string;
  title?: string;
}

interface CategoryOption {
  id: number;
  key: CategoryType;
  nameTh: string;
  nameEn: string;
  icon: string;
}

const DEFAULT_CATEGORY_OPTIONS: CategoryOption[] = [
  { id: 2, key: 'activity', nameTh: 'กิจกรรมมหาลัย', nameEn: 'activity', icon: '🏛️' },
  { id: 4, key: 'restaurants', nameTh: 'กินข้าว', nameEn: 'restaurants', icon: '🍜' },
  { id: 3, key: 'sports', nameTh: 'กีฬา', nameEn: 'sports', icon: '⚽' },
  { id: 5, key: 'study', nameTh: 'อ่านหนังสือ', nameEn: 'study', icon: '📚' },
  { id: 1, key: 'entertainment', nameTh: 'บันเทิง', nameEn: 'entertainment', icon: '🎮' },
];

const CAMPUS_OPTIONS = ['ศูนย์รังสิต', 'ท่าพระจันทร์', 'ศูนย์ลำปาง', 'ศูนย์พัทยา'];

export const EditRoomModal: React.FC = () => {
  const {
    isEditModalOpen,
    closeEditRoomModal,
    editingRoom,
    updateRoom,
    showToast,
  } = useApp();

  // Category selection states
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(2);
  const [category, setCategory] = useState<CategoryType>('activity');
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>(DEFAULT_CATEGORY_OPTIONS);

  // Form input states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [activityTime, setActivityTime] = useState('17:00');
  const [location, setLocation] = useState('');
  const [campus, setCampus] = useState<string>('ศูนย์รังสิต');
  const [maxParticipants, setMaxParticipants] = useState<number>(4);

  // Tags state
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState<string>('');

  // Supabase items states
  const [supabaseCategoryItems, setSupabaseCategoryItems] = useState<CategoryItemRow[]>([]);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState<boolean>(false);

  // Selected University Activity Title (from category_items where category_id == 2)
  const [selectedUnivActivityTitle, setSelectedUnivActivityTitle] = useState<string>('');

  // Validation & Loading states
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Minimum allowed date (today)
  const todayIso = new Date().toISOString().split('T')[0];

  // Fetch categories & category_items from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    const fetchSupabaseData = async () => {
      if (!isSupabaseConfigured) return;

      setIsLoadingSupabase(true);
      try {
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('id');

        if (!catError && catData && catData.length > 0 && isMounted) {
          const mappedOptions: CategoryOption[] = catData.map((row: { id: number; category_name: string }) => {
            const rawName = String(row.category_name || '').trim().toLowerCase();
            let key: CategoryType = 'other' as CategoryType;
            let nameTh = rawName;
            let icon = '📌';

            if (rawName === 'activity' || row.id === 2) {
              key = 'activity';
              nameTh = 'กิจกรรมมหาลัย';
              icon = '🏛️';
            } else if (rawName === 'restaurants' || rawName === 'food' || row.id === 4) {
              key = 'restaurants';
              nameTh = 'กินข้าว';
              icon = '🍜';
            } else if (rawName.includes('sports') || row.id === 3) {
              key = 'sports';
              nameTh = 'กีฬา';
              icon = '⚽';
            } else if (rawName.includes('study') || row.id === 5) {
              key = 'study';
              nameTh = 'อ่านหนังสือ';
              icon = '📚';
            } else if (rawName === 'entertainment' || row.id === 1) {
              key = 'entertainment';
              nameTh = 'บันเทิง';
              icon = '🎮';
            }

            return {
              id: Number(row.id),
              key,
              nameTh,
              nameEn: rawName,
              icon,
            };
          });

          mappedOptions.sort((a, b) => {
            const order = [2, 4, 3, 5, 1];
            return order.indexOf(a.id) - order.indexOf(b.id);
          });

          setCategoryOptions(mappedOptions);
        }

        const { data: itemData, error: itemError } = await supabase
          .from('category_items')
          .select('*')
          .order('id');

        if (!itemError && itemData && itemData.length > 0 && isMounted) {
          setSupabaseCategoryItems(itemData);
        }
      } catch (err) {
        console.warn('[EditRoomModal] Error fetching categories/items:', err);
      } finally {
        if (isMounted) setIsLoadingSupabase(false);
      }
    };

    fetchSupabaseData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync modal state when editingRoom changes or modal opens
  useEffect(() => {
    if (!editingRoom || !isEditModalOpen) return;

    setTitle(editingRoom.title || '');
    setDescription(editingRoom.description || '');
    setActivityDate(editingRoom.activityDate || todayIso);
    setActivityTime(editingRoom.activityTime || '17:00');
    setLocation(editingRoom.location || '');
    setCampus(editingRoom.campus || 'ศูนย์รังสิต');
    setMaxParticipants(editingRoom.maxParticipants || editingRoom.maxParticipant || 4);
    setTags(editingRoom.tags ? [...editingRoom.tags] : []);
    setSelectedUnivActivityTitle(editingRoom.universityActivityTitle || '');
    setErrors({});
    setCustomTagInput('');

    // Set category & categoryId
    const cat = editingRoom.category;
    setCategory(cat);
    if (editingRoom.categoryId) {
      setSelectedCategoryId(editingRoom.categoryId);
    } else {
      const match = categoryOptions.find((c) => c.key === cat);
      if (match) {
        setSelectedCategoryId(match.id);
      } else if (cat === 'activity' || cat === 'university') {
        setSelectedCategoryId(2);
      } else if (cat === 'restaurants' || cat === 'food') {
        setSelectedCategoryId(4);
      } else if (cat === 'sports') {
        setSelectedCategoryId(3);
      } else if (cat === 'study') {
        setSelectedCategoryId(5);
      } else {
        setSelectedCategoryId(1);
      }
    }
  }, [editingRoom, isEditModalOpen, todayIso, categoryOptions]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isEditModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        closeEditRoomModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditModalOpen, isSubmitting, closeEditRoomModal]);

  // Available tag recommendations based on current category
  const availableTags = useMemo(() => {
    const fromSupabase = supabaseCategoryItems
      .filter((item) => Number(item.category_id) === selectedCategoryId)
      .map((item) => {
        const raw = item.item_name || item.tag || item.name || '';
        return raw.startsWith('#') ? raw : `#${raw}`;
      })
      .filter((t) => t.length > 1);

    if (fromSupabase.length > 0) return fromSupabase;

    // Fallbacks
    switch (category) {
      case 'restaurants':
      case 'food':
        return ['#สุกี้ตี๋น้อย', '#โรงอาหารทิวสน', '#ชาบูหมูกระทะ', '#ยูสแควร์', '#คาเฟ่'];
      case 'sports':
        return ['#แบดมินตัน', '#วิ่งGym4', '#ฟุตบอล', '#ฟิตเนสTU', '#บาสเกตบอล'];
      case 'study':
        return ['#อ่านหนังสือหอสมุด', '#ติวแคลคูลัส', '#อ่านหนังสือSC', '#อ่านสอบกลางภาค', '#ทำโปรเจกต์'];
      case 'entertainment':
        return ['#บอร์ดเกม', '#ดูหนังฟิวเจอร์', '#คาราโอเกะ', '#ตีป้อมRoV', '#คอนเสิร์ต'];
      case 'activity':
      case 'university':
      default:
        return ['#เปิดโลกกิจกรรม', '#รับน้องTU', '#FreshyNight', '#ThammasatConcert', '#วันป๋วย'];
    }
  }, [supabaseCategoryItems, selectedCategoryId, category]);

  // Toggle or add a tag
  const handleToggleTag = (tagText: string) => {
    setTags((prev) => {
      if (prev.includes(tagText)) {
        return prev.filter((t) => t !== tagText);
      } else {
        return [...prev, tagText];
      }
    });
  };

  // Add custom tag
  const handleAddCustomTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = customTagInput.trim();
    if (!clean) return;

    const formatted = clean.startsWith('#') ? clean : `#${clean}`;
    if (!tags.includes(formatted)) {
      setTags((prev) => [...prev, formatted]);
    }
    setCustomTagInput('');
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Category switch handler
  const handleCategorySelect = (opt: CategoryOption) => {
    setSelectedCategoryId(opt.id);
    setCategory(opt.key);
  };

  const currentParticipantsCount = editingRoom?.participants?.length || 1;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. Room Title
    if (!title.trim()) {
      newErrors.title = 'กรุณากรอกชื่อกิจกรรม / ชื่อห้อง';
    } else if (title.trim().length < 3) {
      newErrors.title = 'ชื่อกิจกรรมควรมีความยาวอย่างน้อย 3 ตัวอักษร';
    }

    // 2. Location
    if (!location.trim()) {
      newErrors.location = 'กรุณาระบุสถานที่นัดพบใน มธ.';
    }

    // 3. Max Participants
    if (!maxParticipants || isNaN(maxParticipants) || maxParticipants < 2) {
      newErrors.maxParticipants = 'จำนวนเพื่อนต้องอย่างน้อย 2 คน';
    } else if (maxParticipants > 50) {
      newErrors.maxParticipants = 'จำนวนเพื่อนต้องไม่เกิน 50 คน';
    } else if (maxParticipants < currentParticipantsCount) {
      newErrors.maxParticipants = `มีสมาชิกเข้าร่วมแล้ว ${currentParticipantsCount} คน ไม่สามารถตั้งค่าน้อยกว่า ${currentParticipantsCount} ได้`;
    }

    // 4. Activity Date & Time
    if (!activityDate) {
      newErrors.activityDate = 'กรุณาระบุวันที่ทำกิจกรรม';
    }
    if (!activityTime) {
      newErrors.activityTime = 'กรุณาระบุเวลาเริ่มกิจกรรม';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingRoom) return;

    if (!validateForm()) {
      showToast('กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้อง ⚠️');
      return;
    }

    setIsSubmitting(true);

    try {
      const eventDateTime = `${activityDate}T${activityTime}:00`;

      // Calculate categoryItemId
      let categoryItemId: number | undefined = editingRoom.categoryItemId;
      const isUnivCategory = selectedCategoryId === 2 || category === 'activity' || category === 'university';

      if (isUnivCategory) {
        const matchedItem = supabaseCategoryItems.find(
          (item) =>
            Number(item.category_id) === 2 &&
            (item.item_name === selectedUnivActivityTitle || item.name === selectedUnivActivityTitle)
        );
        if (matchedItem) categoryItemId = Number(matchedItem.id);
      } else {
        const firstTag = tags[0]?.replace(/^#/, '').trim();
        if (firstTag) {
          const matchedItem = supabaseCategoryItems.find(
            (item) =>
              Number(item.category_id) === selectedCategoryId &&
              (item.item_name?.trim() === firstTag || item.tag?.trim() === firstTag || item.name?.trim() === firstTag)
          );
          if (matchedItem) categoryItemId = Number(matchedItem.id);
        }
      }

      const finalTags = tags.length > 0 ? tags : (isUnivCategory ? ['#กิจกรรมมหาลัย'] : ['#หาเพื่อน']);

      await updateRoom(editingRoom.id, {
        title: title.trim(),
        description: description.trim() || 'มาจอยกันได้เลยทุกคน!',
        category,
        categoryId: selectedCategoryId,
        categoryItemId,
        universityActivityTitle: isUnivCategory ? (selectedUnivActivityTitle || editingRoom.universityActivityTitle) : undefined,
        activityDate,
        activityTime,
        eventDateTime,
        location: location.trim(),
        campus,
        tags: finalTags,
        maxParticipants: Number(maxParticipants),
        maxParticipant: Number(maxParticipants),
      });
    } catch (err) {
      console.error('[EditRoomModal] update error:', err);
      showToast('เกิดข้อผิดพลาดในการบันทึกการแก้ไข');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEditModalOpen || !editingRoom) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          closeEditRoomModal();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-[#FDFBF7]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden my-6 animate-in zoom-in-95 duration-150">
        {/* Modal Header - Frosted Glass Gradient */}
        <div className="bg-gradient-to-r from-[#8B1D1D] to-[#6D0E1C] text-white px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/30 text-amber-300 shadow-inner">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg font-kanit">แก้ไขข้อมูลบอร์ด</h2>
              <p className="text-[11px] text-white/80">ปรับปรุงรายละเอียดกิจกรรม เวลา สถานที่ หรือจำนวนคน</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeEditRoomModal}
            disabled={isSubmitting}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            title="ปิด (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Current Participant Status Note */}
          <div className="bg-amber-50/80 backdrop-blur-xs p-3.5 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900">
              <Users className="w-4 h-4 text-[#8B1D1D] shrink-0" />
              <span>
                สมาชิกปัจจุบันในห้อง: <strong className="text-[#8B1D1D]">{currentParticipantsCount}</strong> คน
              </span>
            </div>
            <span className="text-[11px] text-[#777]">
              สถานะ: <span className="font-bold text-[#2D2D2D]">{editingRoom.status === 'open' ? '🟢 กำลังเปิดรับ' : editingRoom.status}</span>
            </span>
          </div>

          {/* 1. Category Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#2D2D2D] font-kanit">
              หมวดหมู่กิจกรรม <span className="text-[#8B1D1D]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {categoryOptions.map((opt) => {
                const isSelected = selectedCategoryId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleCategorySelect(opt)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#8B1D1D] text-white border-[#8B1D1D] shadow-md scale-[1.02]'
                        : 'bg-white/60 hover:bg-white text-[#444] border-white/80 hover:border-white shadow-2xs'
                    }`}
                  >
                    <span className="text-xl mb-1">{opt.icon}</span>
                    <span className="text-[11px] font-semibold truncate max-w-[80px]">{opt.nameTh}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Room Title */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#2D2D2D] font-kanit">
              ชื่อกิจกรรม / หัวข้อบอร์ด <span className="text-[#8B1D1D]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="เช่น หาเพื่อนวิ่งออกกำลังกาย Gym 4 ตอนเย็น"
              className={`w-full bg-white/70 backdrop-blur-xs border rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#2D2D2D] font-medium placeholder-[#999] focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                errors.title
                  ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30'
                  : 'border-white/80 focus:ring-[#8B1D1D]'
              }`}
            />
            {errors.title && (
              <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3 h-3" /> {errors.title}
              </p>
            )}
          </div>

          {/* 3. Description */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#2D2D2D] font-kanit">
              รายละเอียดกิจกรรม
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="บอกรายละเอียดเพิ่มเติม เช่น นัดเจอกันตรงไหน สไตล์การเล่น หรือข้อกำหนด..."
              className="w-full bg-white/70 backdrop-blur-xs border border-white/80 rounded-2xl p-3.5 text-xs sm:text-sm text-[#2D2D2D] placeholder-[#999] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] transition-all leading-relaxed"
            />
          </div>

          {/* 4. Tags Matrix */}
          <div className="space-y-2 bg-white/40 backdrop-blur-xs p-3.5 rounded-2xl border border-white/70 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#8B1D1D] font-kanit flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> แท็กกิจกรรม (Tags)
              </label>
              <span className="text-[10px] text-[#777]">เลือกหรือพิมพ์แท็กเพิ่มได้</span>
            </div>

            {/* Currently chosen tags */}
            <div className="flex items-center gap-1.5 flex-wrap min-h-[30px]">
              {tags.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#8B1D1D]/10 text-[#8B1D1D] border border-[#8B1D1D]/20 shadow-2xs"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-700 cursor-pointer p-0.5"
                    title="ลบแท็ก"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {tags.length === 0 && (
                <span className="text-xs text-[#888] italic">ยังไม่มีแท็กที่เลือก</span>
              )}
            </div>

            {/* Recommendations & Quick Pick */}
            <div>
              <p className="text-[11px] font-semibold text-[#555] mb-1.5">แนะนำสำหรับหมวดนี้:</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {availableTags.map((tagText, idx) => {
                  const isSelected = tags.includes(tagText);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleTag(tagText)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#8B1D1D] text-white border-[#8B1D1D] shadow-2xs'
                          : 'bg-white/70 hover:bg-white text-[#555] border-white/80 hover:border-stone-300'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 inline mr-1" />}
                      {tagText}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Tag Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
                placeholder="เพิ่มแท็กเอง เช่น #หอพักTU #เด็ก67"
                className="flex-1 bg-white/70 border border-white/80 rounded-xl px-3 py-1.5 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#8B1D1D]"
              />
              <button
                type="button"
                onClick={() => handleAddCustomTag()}
                className="px-3 py-1.5 bg-white/80 hover:bg-white border border-white/90 text-xs font-bold text-[#8B1D1D] rounded-xl shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่ม</span>
              </button>
            </div>
          </div>

          {/* 5. Date & Time Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Activity Date */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#2D2D2D] font-kanit flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#8B1D1D]" />
                <span>วันทำกิจกรรม</span>
                <span className="text-[#8B1D1D]">*</span>
              </label>
              <input
                type="date"
                min={todayIso}
                value={activityDate}
                onChange={(e) => {
                  setActivityDate(e.target.value);
                  if (errors.activityDate) setErrors((prev) => ({ ...prev, activityDate: undefined }));
                }}
                className={`w-full bg-white/70 backdrop-blur-xs border rounded-2xl px-3.5 py-2 text-xs text-[#2D2D2D] font-medium focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                  errors.activityDate
                    ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30'
                    : 'border-white/80 focus:ring-[#8B1D1D]'
                }`}
              />
              {errors.activityDate && (
                <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" /> {errors.activityDate}
                </p>
              )}
            </div>

            {/* Activity Time */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#2D2D2D] font-kanit flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#8B1D1D]" />
                <span>เวลาเริ่มกิจกรรม</span>
                <span className="text-[#8B1D1D]">*</span>
              </label>
              <input
                type="time"
                value={activityTime}
                onChange={(e) => {
                  setActivityTime(e.target.value);
                  if (errors.activityTime) setErrors((prev) => ({ ...prev, activityTime: undefined }));
                }}
                className={`w-full bg-white/70 backdrop-blur-xs border rounded-2xl px-3.5 py-2 text-xs text-[#2D2D2D] font-medium focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                  errors.activityTime
                    ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30'
                    : 'border-white/80 focus:ring-[#8B1D1D]'
                }`}
              />
              {errors.activityTime && (
                <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" /> {errors.activityTime}
                </p>
              )}
            </div>
          </div>

          {/* 6. Location & Campus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Campus Selector */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#2D2D2D] font-kanit flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-[#8B1D1D]" />
                <span>ศูนย์การศึกษา</span>
              </label>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full bg-white/70 backdrop-blur-xs border border-white/80 rounded-2xl px-3.5 py-2 text-xs text-[#2D2D2D] font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] transition-all cursor-pointer"
              >
                {CAMPUS_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Location input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#2D2D2D] font-kanit flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#8B1D1D]" />
                <span>สถานที่นัดพบ</span>
                <span className="text-[#8B1D1D]">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (errors.location) setErrors((prev) => ({ ...prev, location: undefined }));
                }}
                placeholder="เช่น โรงยิม 4, หอสมุดป๋วย, ยูสแควร์"
                className={`w-full bg-white/70 backdrop-blur-xs border rounded-2xl px-3.5 py-2 text-xs text-[#2D2D2D] font-medium focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                  errors.location
                    ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30'
                    : 'border-white/80 focus:ring-[#8B1D1D]'
                }`}
              />
              {errors.location && (
                <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" /> {errors.location}
                </p>
              )}
            </div>
          </div>

          {/* 7. Max Participants */}
          <div className="space-y-1 bg-white/40 backdrop-blur-xs p-3.5 rounded-2xl border border-white/70 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#2D2D2D] font-kanit flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#8B1D1D]" />
                <span>จำนวนคนที่เปิดรับรวม (Max Participants)</span>
                <span className="text-[#8B1D1D]">*</span>
              </label>
              <span className="text-xs font-bold text-[#8B1D1D]">{maxParticipants} คน</span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input
                type="range"
                min={Math.max(2, currentParticipantsCount)}
                max={30}
                value={maxParticipants}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMaxParticipants(val);
                  if (errors.maxParticipants) setErrors((prev) => ({ ...prev, maxParticipants: undefined }));
                }}
                className="flex-1 accent-[#8B1D1D] cursor-pointer"
              />
              <input
                type="number"
                min={Math.max(2, currentParticipantsCount)}
                max={50}
                value={maxParticipants}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMaxParticipants(val);
                  if (errors.maxParticipants) setErrors((prev) => ({ ...prev, maxParticipants: undefined }));
                }}
                className="w-16 bg-white/80 border border-white/90 rounded-xl px-2 py-1 text-xs text-center font-bold text-[#2D2D2D] focus:outline-none focus:ring-1 focus:ring-[#8B1D1D]"
              />
            </div>
            <p className="text-[11px] text-[#777]">
              ปัจจุบันมีผู้เข้าร่วม {currentParticipantsCount} คน (รวมผู้สร้าง) • สามารถเปิดรับได้สูงสุด 50 คน
            </p>
            {errors.maxParticipants && (
              <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium pt-1">
                <AlertCircle className="w-3 h-3" /> {errors.maxParticipants}
              </p>
            )}
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/70">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={closeEditRoomModal}
              className="px-5 py-2.5 rounded-2xl bg-white/60 hover:bg-white text-xs font-bold text-[#555] border border-white/80 transition-all cursor-pointer disabled:opacity-50"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>บันทึกการแก้ไข</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
