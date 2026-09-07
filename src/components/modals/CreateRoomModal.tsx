import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryType } from '../../types';
import { CATEGORY_METADATA } from '../../data/mockData';
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

export const CreateRoomModal: React.FC = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    preselectedCategoryForRoom,
    preselectedActivityForRoom,
    createRoom,
    universityActivities,
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

  // Supabase items states
  const [supabaseCategoryItems, setSupabaseCategoryItems] = useState<CategoryItemRow[]>([]);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<string>('');

  // Selected University Activity Title (from category_items where category_id == 2)
  const [selectedUnivActivityTitle, setSelectedUnivActivityTitle] = useState<string>('');

  // Validation & Loading states
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Today ISO string for min date
  const todayIso = new Date().toISOString().split('T')[0];

  // Fetch categories & category_items from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    const fetchSupabaseData = async () => {
      if (!isSupabaseConfigured) return;

      setIsLoadingSupabase(true);
      try {
        // 1. Fetch categories table
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('id');

        if (!catError && catData && catData.length > 0 && isMounted) {
          // Merge with predefined icons and Thai labels, sanitizing whitespace
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

          // Sort so activity (id:2) or common order is maintained
          mappedOptions.sort((a, b) => {
            const order = [2, 4, 3, 5, 1];
            return order.indexOf(a.id) - order.indexOf(b.id);
          });

          setCategoryOptions(mappedOptions);
        }

        // 2. Fetch category_items table
        const { data: itemData, error: itemError } = await supabase
          .from('category_items')
          .select('*')
          .order('id');

        if (!itemError && itemData && itemData.length > 0 && isMounted) {
          setSupabaseCategoryItems(itemData);
        }
      } catch (err) {
        console.warn('[CreateRoomModal] Error fetching categories/category_items from Supabase:', err);
      } finally {
        if (isMounted) setIsLoadingSupabase(false);
      }
    };

    fetchSupabaseData();

    return () => {
      isMounted = false;
    };
  }, []);

  // University activities dropdown list: from category_items where category_id == 2
  const univActivityOptions = useMemo(() => {
    const fromSupabase = supabaseCategoryItems.filter((item) => Number(item.category_id) === 2);
    if (fromSupabase.length > 0) return fromSupabase;

    // Fallback if category_items has no items with category_id == 2 yet
    return universityActivities.map((act) => ({
      id: act.id,
      category_id: 2,
      item_name: act.title,
      name: act.title,
    }));
  }, [supabaseCategoryItems, universityActivities]);

  // Compute available tags from category_items (strictly excluding category_id == 2)
  const availableTags = useMemo<string[]>(() => {
    // Exclude category_id == 2 as required
    const nonUnivItems = supabaseCategoryItems.filter(
      (item) => Number(item.category_id) !== 2
    );

    // Filter items matching the current category_id
    const matchingItems = nonUnivItems.filter((item) => {
      if (item.category_id !== undefined && item.category_id !== null) {
        return Number(item.category_id) === selectedCategoryId;
      }
      return false;
    });

    const itemsToUse = matchingItems.length > 0 ? matchingItems : nonUnivItems;
    const extractedTags = itemsToUse
      .map((item) => item.item_name || item.tag || item.name || '')
      .filter((t) => typeof t === 'string' && t.trim().length > 0)
      .map((t) => (t.startsWith('#') ? t.trim() : `#${t.trim()}`));

    // Fallback to preset tags if category_items doesn't have tags for this category
    const catMetaKey =
      category === 'restaurants' ? 'food' : category === 'activity' ? 'university' : category;
    const fallbackTags = CATEGORY_METADATA[catMetaKey]?.popularTags || [
      '#หาเพื่อน',
      '#มธรังสิต',
      '#เด็กหอรังสิต',
      '#ธรรมศาสตร์',
    ];

    const combined = extractedTags.length > 0 ? extractedTags : fallbackTags;
    return Array.from(new Set(combined));
  }, [supabaseCategoryItems, selectedCategoryId, category]);

  // Set initial default tag when category changes
  useEffect(() => {
    if (availableTags.length > 0) {
      if (!selectedTag || !availableTags.includes(selectedTag)) {
        setSelectedTag(availableTags[0]);
      }
    } else {
      setSelectedTag('');
    }
  }, [category, availableTags, selectedTag]);

  // Initialize or update form on open
  useEffect(() => {
    if (!isCreateModalOpen) {
      setErrors({});
      setIsSubmitting(false);
      return;
    }

    if (preselectedCategoryForRoom) {
      const match = categoryOptions.find(
        (c) =>
          c.key === preselectedCategoryForRoom ||
          (preselectedCategoryForRoom === 'food' && c.key === 'restaurants') ||
          (preselectedCategoryForRoom === 'university' && c.key === 'activity')
      );
      if (match) {
        setCategory(match.key);
        setSelectedCategoryId(match.id);
      }
    }

    if (preselectedActivityForRoom) {
      setCategory('activity');
      setSelectedCategoryId(2);
      setSelectedUnivActivityTitle(preselectedActivityForRoom.title);
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
    }
  }, [
    preselectedCategoryForRoom,
    preselectedActivityForRoom,
    isCreateModalOpen,
    todayIso,
    categoryOptions,
  ]);

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

    // 1. Room Title
    if (!title.trim()) {
      newErrors.title = 'กรุณากรอกชื่อห้อง';
    } else if (title.trim().length < 3) {
      newErrors.title = 'ชื่อห้องควรมีความยาวอย่างน้อย 3 ตัวอักษร';
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
    }

    // 4. Activity Date & Time validation (event_date_time)
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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Fixed 12-hour recruitment deadline from the creation time
      const calculatedDeadlineIso = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();

      // Combined date and time for Supabase field 'event_date_time'
      const eventDateTime = `${activityDate}T${activityTime}:00`;

      // Small async feedback delay
      await new Promise((resolve) => setTimeout(resolve, 350));

      const isUnivCategory = selectedCategoryId === 2 || category === 'activity' || category === 'university';
      const tags = isUnivCategory
        ? (selectedUnivActivityTitle ? [`#${selectedUnivActivityTitle}`] : ['#กิจกรรมมหาลัย'])
        : (selectedTag ? [selectedTag] : [availableTags[0] || '#หาเพื่อน']);

      // Calculate category_item_id from Supabase table 'category_items'
      let categoryItemId: number | undefined = undefined;
      if (isUnivCategory) {
        // Look up item in category_items where category_id == 2 matching the selected university activity
        const matchedItem = supabaseCategoryItems.find(
          (item) =>
            Number(item.category_id) === 2 &&
            (item.item_name === selectedUnivActivityTitle || item.name === selectedUnivActivityTitle)
        );
        if (matchedItem) {
          categoryItemId = Number(matchedItem.id);
        } else {
          const firstUnivItem = supabaseCategoryItems.find((item) => Number(item.category_id) === 2);
          if (firstUnivItem) categoryItemId = Number(firstUnivItem.id);
        }
      } else {
        // Look up tag item in category_items matching the selected tag
        const cleanTag = selectedTag.replace(/^#/, '').trim();
        const matchedItem = supabaseCategoryItems.find(
          (item) =>
            Number(item.category_id) === selectedCategoryId &&
            (item.item_name?.trim() === cleanTag || item.tag?.trim() === cleanTag || item.name?.trim() === cleanTag)
        );
        if (matchedItem) {
          categoryItemId = Number(matchedItem.id);
        } else {
          const firstCatItem = supabaseCategoryItems.find(
            (item) => Number(item.category_id) === selectedCategoryId
          );
          if (firstCatItem) categoryItemId = Number(firstCatItem.id);
        }
      }

      await createRoom({
        title: title.trim(),
        description: description.trim() || 'มาจอยกันได้เลยทุกคน!',
        category,
        categoryId: selectedCategoryId,
        categoryItemId,
        universityActivityId: selectedUnivActivityTitle ? `univ-${selectedUnivActivityTitle}` : undefined,
        universityActivityTitle: selectedUnivActivityTitle || undefined,
        eventDateTime,
        activityDate,
        activityTime,
        recruitmentDeadline: calculatedDeadlineIso,
        recruitmentOption: 'hours',
        recruitmentHours: 12,
        location: location.trim(),
        campus,
        maxParticipant: Math.max(2, maxParticipants),
        maxParticipants: Math.max(2, maxParticipants),
        tags,
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto font-prompt">
          {/* Category Selector Buttons (from Supabase table 'categories') */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-[#2D2D2D] font-kanit">
                หมวดหมู่กิจกรรม <span className="text-rose-500">*</span>
              </label>
              {isLoadingSupabase && (
                <span className="text-[11px] text-[#888] flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin text-[#8B1D1D]" />
                  กำลังเชื่อมต่อ Supabase...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {categoryOptions.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setCategory(cat.key);
                    }}
                    className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${isSelected
                        ? 'bg-[#8B1D1D] text-white border-[#8B1D1D] shadow-md'
                        : 'bg-white/60 text-[#555] border-white/80 hover:bg-white'
                      }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="font-kanit text-[13px]">{cat.nameTh}</span>
                    <span className="text-[10px] font-normal opacity-80 font-prompt">({cat.nameEn})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* If University Category (category_id === 2 / activity): Pick official activity from category_items where category_id == 2 */}
          {(selectedCategoryId === 2 || category === 'activity' || category === 'university') && (
            <div className="bg-white/50 backdrop-blur-sm p-3.5 rounded-2xl border border-white/80 space-y-2">
              <label className="block text-xs font-bold text-[#8B1D1D] flex items-center gap-1 font-kanit">
                <Building className="w-3.5 h-3.5" />
                <span>เลือกกิจกรรม มหาวิทยาลัยธรรมศาสตร์ ที่เกี่ยวข้อง</span>
              </label>
              <select
                value={selectedUnivActivityTitle}
                disabled={isSubmitting}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedUnivActivityTitle(val);
                  if (val) {
                    setTitle(`หาเพื่อนไปงาน ${val}`);
                    setActivityDate(todayIso);
                  }
                }}
                className="w-full bg-white/70 border border-white/90 rounded-xl px-3 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D]"
              >
                <option value="">-- ไม่ระบุ / กิจกรรมทั่วไป --</option>
                {univActivityOptions.map((item) => (
                  <option key={item.id} value={item.item_name || item.name}>
                    {item.item_name || item.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Room Title ("ชื่อห้อง" connects to title) */}
          <div>
            <label className="block text-xs font-bold text-[#2D2D2D] mb-1 font-kanit">
              ชื่อห้อง <span className="text-rose-500">*</span>
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
              className={`w-full bg-white/60 backdrop-blur-sm border rounded-xl px-3.5 py-2 text-xs text-[#2D2D2D] placeholder:text-[#888] focus:outline-none focus:bg-white focus:ring-2 transition-colors ${errors.title
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

          {/* Description ("รายละเอียดเพิ่มเติม" connects to description) */}
          <div>
            <label className="block text-xs font-bold text-[#2D2D2D] mb-1 font-kanit">
              รายละเอียดเพิ่มเติม
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

          {/* Date, Time (connects to event_date_time) & Max Participants (connects to max_participant) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* วันที่ทำกิจกรรม */}
            <div>
              <label className="block text-xs font-bold text-[#2D2D2D] mb-1 flex items-center gap-1 font-kanit">
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
                className={`w-full bg-white/60 backdrop-blur-sm border rounded-xl px-3 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 transition-colors ${errors.activityDate
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

            {/* เวลาเริ่มกิจกรรม (ดอกจันแดง) */}
            <div>
              <label className="block text-xs font-bold text-[#2D2D2D] mb-1 flex items-center gap-1 font-kanit">
                <Clock className="w-3.5 h-3.5 text-[#8B1D1D]" />
                <span>เวลาเริ่มกิจกรรม <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="time"
                value={activityTime}
                disabled={isSubmitting}
                onChange={(e) => {
                  setActivityTime(e.target.value);
                  if (errors.activityTime) setErrors((prev) => ({ ...prev, activityTime: undefined }));
                }}
                className={`w-full bg-white/60 backdrop-blur-sm border rounded-xl px-3 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 transition-colors ${errors.activityTime
                    ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                    : 'border-white/80 focus:ring-[#8B1D1D]'
                  }`}
              />
              {errors.activityTime && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.activityTime}</span>
                </p>
              )}
            </div>

            {/* จำนวนเพื่อนที่รับ (คน) (connects to max_participant) */}
            <div>
              <label className="block text-xs font-bold text-[#2D2D2D] mb-1 flex items-center gap-1 font-kanit">
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
                className={`w-full bg-white/60 backdrop-blur-sm border rounded-xl px-3 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 transition-colors ${errors.maxParticipants
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

          {/* Location ("สถานที่นัดพบ (มธ. ศูนย์รังสิต)" connects to location) */}
          <div>
            <label className="block text-xs font-bold text-[#2D2D2D] mb-1 flex items-center gap-1 font-kanit">
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
              className={`w-full bg-white/60 backdrop-blur-sm border rounded-xl px-3.5 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 transition-colors ${errors.location
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

          {/* Automatic 12-Hour Deadline Notice (Fixed 12 hrs) */}
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#8B1D1D]">
            <Clock className="w-4 h-4 shrink-0 text-[#8B1D1D]" />
            <div className="text-xs">
              <span className="font-bold">ระยะเวลาเปิดรับสมาชิก: </span>
              <span className="text-[#555]">
                ระบบกำหนดเวลาปิดรับสมาชิกอัตโนมัติ <strong>12 ชั่วโมง</strong> สำหรับทุกการสร้างห้อง
              </span>
            </div>
          </div>

          {/* Tags Dropdown ("แท็กกิจกรรม" from category_items excluding category_id == 2) */}
          {selectedCategoryId !== 2 && category !== 'activity' && category !== 'university' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#2D2D2D] flex items-center gap-1.5 font-kanit">
                  <Tag className="w-3.5 h-3.5 text-[#8B1D1D]" />
                  <span>แท็กกิจกรรม <span className="text-rose-500">*</span></span>
                </label>
                {isLoadingSupabase && (
                  <span className="text-[11px] text-[#888] flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-[#8B1D1D]" />
                    กำลังโหลดแท็กจาก Supabase...
                  </span>
                )}
              </div>

              {/* Single Tag Dropdown Selector */}
              <div className="relative">
                <select
                  value={selectedTag}
                  disabled={isSubmitting || isLoadingSupabase}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full bg-white/70 backdrop-blur-sm border border-white/90 rounded-xl px-3.5 py-2.5 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] cursor-pointer shadow-2xs font-medium"
                >
                  {availableTags.length === 0 && (
                    <option value="">-- ไม่พบแท็กในหมวดหมู่นี้ --</option>
                  )}
                  {availableTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-[#888] mt-1">
                เชื่อมโยงข้อมูลแท็กจากตาราง category_items ตามหมวดหมู่ที่เลือก
              </p>
            </div>
          )}

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
                <>
                  <span>สร้างห้องหาเพื่อน ✨</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateRoomModal;
