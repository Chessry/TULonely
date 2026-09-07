import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TU_FACULTIES } from '../../data/mockData';
import {
  X,
  ShieldCheck,
  Sparkles,
  Lock,
  Flame,
  ArrowRight,
  Mail,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const PRESET_AVATARS = [
  {
    id: 'av-1',
    name: 'สไตล์ 1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-2',
    name: 'สไตล์ 2',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-3',
    name: 'สไตล์ 3',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-4',
    name: 'สไตล์ 4',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-5',
    name: 'สไตล์ 5',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'av-6',
    name: 'สไตล์ 6',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
  },
];

const POPULAR_INTEREST_TAGS = [
  '#สุกี้ตี๋น้อย',
  '#บอร์ดเกม',
  '#วิ่งGym4',
  '#อ่านหนังสือป๋วย',
  '#Freshy',
  '#หารค่าส่ง',
  '#ดูหนังZpell',
  '#แบดมินตัน',
  '#โรงอาหารSC',
  '#Calculus',
];

interface AuthErrors {
  studentId?: string;
  email?: string;
  name?: string;
  loginIdentifier?: string;
}

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register } = useApp();

  const [mode, setMode] = useState<'register' | 'login' | 'demo'>('register');

  // Register Form State
  const [regStudentId, setRegStudentId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regName, setRegName] = useState('');
  const [regFaculty, setRegFaculty] = useState(TU_FACULTIES[0]);
  const [regYear, setRegYear] = useState('ปี 1 (Freshy)');
  const [regBio, setRegBio] = useState('');
  const [regAvatar, setRegAvatar] = useState(PRESET_AVATARS[0].url);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    '#Freshy',
    '#สุกี้ตี๋น้อย',
  ]);

  // Login Form State
  const [loginStudentId, setLoginStudentId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Validation & Loading state
  const [errors, setErrors] = useState<AuthErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    if (!isAuthModalOpen) {
      setErrors({});
      setIsSubmitting(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        setIsAuthModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, isSubmitting, setIsAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const toggleInterestTag = (tag: string) => {
    if (selectedInterests.includes(tag)) {
      setSelectedInterests((prev) => prev.filter((t) => t !== tag));
    } else {
      setSelectedInterests((prev) => [...prev, tag]);
    }
  };

  const validateRegister = (): boolean => {
    const newErrors: AuthErrors = {};

    // 1. Student ID check (10 digits)
    const cleanedId = regStudentId.trim();
    if (!cleanedId) {
      newErrors.studentId = 'กรุณากรอกรหัสนักศึกษา 10 หลัก';
    } else if (!/^\d{10}$/.test(cleanedId)) {
      newErrors.studentId = 'รหัสนักศึกษาต้องเป็นตัวเลข 10 หลักพอดี (เช่น 6609651234)';
    }

    // 2. Email check
    const cleanedEmail = regEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanedEmail) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!emailRegex.test(cleanedEmail)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง (เช่น example@email.com)';
    }

    // 3. Name check
    const cleanedName = regName.trim();
    if (!cleanedName) {
      newErrors.name = 'กรุณากรอกชื่อเล่นหรือชื่อที่ต้องการให้เพื่อนเรียก';
    } else if (cleanedName.length < 2) {
      newErrors.name = 'ชื่อควรมีความยาวอย่างน้อย 2 ตัวอักษร';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRegister()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      register({
        name: regName.trim(),
        studentId: regStudentId.trim(),
        email: regEmail.trim(),
        faculty: regFaculty,
        year: regYear,
        campus: 'ศูนย์รังสิต',
        bio: regBio.trim() || 'เด็ก มธ. ศูนย์รังสิต ยินดีที่ได้รู้จักทุกคนครับ/ค่ะ 👋',
        avatar: regAvatar,
        interests: selectedInterests.length > 0 ? selectedInterests : ['#Freshy', '#ศูนย์รังสิต'],
      });

      setIsAuthModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateLogin = (): boolean => {
    const newErrors: AuthErrors = {};
    const input = loginStudentId.trim();

    if (!input) {
      newErrors.loginIdentifier = 'กรุณากรอกรหัสนักศึกษา (10 หลัก) หรือ อีเมล';
    } else if (input.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input)) {
        newErrors.loginIdentifier = 'รูปแบบอีเมลไม่ถูกต้อง';
      }
    } else if (!/^\d{10}$/.test(input)) {
      newErrors.loginIdentifier = 'รหัสนักศึกษาต้องเป็นตัวเลข 10 หลัก (เช่น 6609651234)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateLogin()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const input = loginStudentId.trim();
      const isEmail = input.includes('@');

      login({
        studentId: isEmail ? '650965xxxx' : input,
        email: isEmail ? input : `${input}@dome.tu.ac.th`,
        name: 'นักศึกษา มธ.',
      });

      setIsAuthModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoSelect = async (
    demoName: string,
    demoId: string,
    demoFaculty: string,
    demoYear: string,
    demoBio: string,
    demoAvatar: string,
    demoInterests: string[]
  ) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      register({
        name: demoName,
        studentId: demoId,
        email: `${demoName.toLowerCase()}@dome.tu.ac.th`,
        faculty: demoFaculty,
        year: demoYear,
        campus: 'ศูนย์รังสิต',
        bio: demoBio,
        avatar: demoAvatar,
        interests: demoInterests,
      });
      setIsAuthModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          setIsAuthModalOpen(false);
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-xl bg-[#FDFBF7]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8B1D1D] to-[#6D0E1C] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-xl border border-white/30">
              🎓
            </div>
            <div>
              <h3 className="font-bold text-lg font-kanit">
                ลงทะเบียน / เข้าสู่ระบบ TU<span className="text-[#F27D26]">lonely</span>
              </h3>
              <p className="text-xs text-white/80">
                ยืนยันตัวตนนศ. มธ. เพื่อเข้าร่วมหรือสร้างห้องหาเพื่อน (กด Esc เพื่อปิด)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !isSubmitting && setIsAuthModalOpen(false)}
            disabled={isSubmitting}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Mode Switcher Tabs */}
        <div className="flex border-b border-white/80 bg-white/40 p-1.5 gap-1.5">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              setMode('register');
              setErrors({});
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'register'
                ? 'bg-[#8B1D1D] text-white shadow-md'
                : 'text-[#555] hover:bg-white/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ลงทะเบียนเข้าใช้</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              setMode('login');
              setErrors({});
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login'
                ? 'bg-[#8B1D1D] text-white shadow-md'
                : 'text-[#555] hover:bg-white/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>เข้าสู่ระบบ</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              setMode('demo');
              setErrors({});
            }}
            className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'demo'
                ? 'bg-[#8B1D1D] text-white shadow-md'
                : 'text-[#F27D26] bg-amber-500/10 hover:bg-amber-500/20'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#F27D26]" />
            <span>บัญชีทดสอบด่วน</span>
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          <div className="bg-[#8B1D1D]/5 border border-[#8B1D1D]/15 rounded-2xl p-3.5 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#8B1D1D] shrink-0 mt-0.5" />
            <p className="text-xs text-[#8B1D1D] leading-tight">
              ยืนยันตัวตนด้วยรหัสนักศึกษา 10 หลักผ่านฐานข้อมูลมหาวิทยาลัย โดยสามารถใช้อีเมลใดก็ได้ในการลงทะเบียน
            </p>
          </div>

          {/* Mode 1: Register */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Student ID */}
                <div>
                  <label className="block text-xs font-bold text-[#333] mb-1">
                    รหัสนักศึกษา (10 หลัก) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    disabled={isSubmitting}
                    value={regStudentId}
                    onChange={(e) => {
                      setRegStudentId(e.target.value.replace(/\D/g, '').slice(0, 10));
                      if (errors.studentId) setErrors((prev) => ({ ...prev, studentId: undefined }));
                    }}
                    placeholder="เช่น 6609651234"
                    className={`w-full bg-white/70 backdrop-blur-xs border rounded-xl px-3 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 font-mono shadow-2xs transition-colors ${
                      errors.studentId
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                        : 'border-white/90 focus:ring-[#8B1D1D]'
                    }`}
                  />
                  {errors.studentId ? (
                    <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.studentId}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-[#777] mt-0.5">
                      {regStudentId.length}/10 หลัก (ตรวจกับฐานข้อมูลนักศึกษา)
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#333]">
                      อีเมล <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <input
                    type="email"
                    disabled={isSubmitting}
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="เช่น example@gmail.com หรือ hotmail, outlook"
                    className={`w-full bg-white/70 backdrop-blur-xs border rounded-xl px-3 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 shadow-2xs transition-colors ${
                      errors.email
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                        : 'border-white/90 focus:ring-[#8B1D1D]'
                    }`}
                  />
                  {errors.email ? (
                    <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-[#777] mt-0.5">
                      รองรับทุกผู้ให้บริการอีเมล (Gmail, Hotmail, Outlook ฯลฯ)
                    </p>
                  )}
                </div>
              </div>

              {/* Name & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#333] mb-1">
                    ชื่อเล่น / ชื่อที่ต้องการแสดง <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={isSubmitting}
                    value={regName}
                    onChange={(e) => {
                      setRegName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="เช่น ฟ้าใส, นวมินทร์, Noah"
                    className={`w-full bg-white/70 backdrop-blur-xs border rounded-xl px-3 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 shadow-2xs transition-colors ${
                      errors.name
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                        : 'border-white/90 focus:ring-[#8B1D1D]'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#333] mb-1">ชั้นปี</label>
                  <select
                    value={regYear}
                    disabled={isSubmitting}
                    onChange={(e) => setRegYear(e.target.value)}
                    className="w-full bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl px-3 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] shadow-2xs"
                  >
                    <option value="ปี 1 (Freshy)">ปี 1 (Freshy น้องใหม่)</option>
                    <option value="ปี 2">ปี 2</option>
                    <option value="ปี 3">ปี 3</option>
                    <option value="ปี 4">ปี 4</option>
                    <option value="ปริญญาโท / เอก">ปริญญาโท / เอก</option>
                  </select>
                </div>
              </div>

              {/* Faculty */}
              <div>
                <label className="block text-xs font-bold text-[#333] mb-1">คณะ</label>
                <select
                  value={regFaculty}
                  disabled={isSubmitting}
                  onChange={(e) => setRegFaculty(e.target.value)}
                  className="w-full bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl px-3 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] shadow-2xs"
                >
                  {TU_FACULTIES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-[#333] mb-1">คำแนะนำตัวสั้น ๆ</label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  value={regBio}
                  onChange={(e) => setRegBio(e.target.value)}
                  placeholder="เช่น หาเพื่อนกินข้าว ติวสอบ หรือเล่นบอร์ดเกม ทักได้เลย"
                  className="w-full bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl px-3 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] shadow-2xs"
                />
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-[#333] mb-1.5">
                  เลือกรูปโปรไฟล์ (Avatar)
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((av) => {
                    const isSelected = regAvatar === av.url;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setRegAvatar(av.url)}
                        className={`relative rounded-xl p-0.5 border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#8B1D1D] bg-white scale-105 shadow-md ring-2 ring-[#8B1D1D]/30'
                            : 'border-white/80 bg-white/40 hover:border-white'
                        }`}
                      >
                        <img
                          src={av.url}
                          alt={av.name}
                          className="w-full h-11 rounded-lg object-cover"
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#8B1D1D] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-[#333] mb-1">
                  กิจกรรมที่ชอบ (เลือกได้หลายข้อ)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_INTEREST_TAGS.map((tag) => {
                    const isSelected = selectedInterests.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => toggleInterestTag(tag)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#8B1D1D] text-white shadow-xs'
                            : 'bg-white/60 text-[#555] hover:bg-white border border-white/80'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit button with loader */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#8B1D1D] hover:bg-[#6D0E1C] disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังบันทึกข้อมูลและเข้าสู่ระบบ...</span>
                  </>
                ) : (
                  <>
                    <span>ลงทะเบียนและเริ่มใช้งานทันที 🚀</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Mode 2: Login */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#333] mb-1">
                  รหัสนักศึกษา (10 หลัก) หรือ อีเมล <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#888] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    disabled={isSubmitting}
                    value={loginStudentId}
                    onChange={(e) => {
                      setLoginStudentId(e.target.value);
                      if (errors.loginIdentifier) {
                        setErrors((prev) => ({ ...prev, loginIdentifier: undefined }));
                      }
                    }}
                    placeholder="เช่น 6609651234 หรือ example@gmail.com"
                    className={`w-full bg-white/70 backdrop-blur-xs border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 shadow-2xs transition-colors ${
                      errors.loginIdentifier
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                        : 'border-white/90 focus:ring-[#8B1D1D]'
                    }`}
                  />
                </div>
                {errors.loginIdentifier && (
                  <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.loginIdentifier}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333] mb-1">
                  รหัสผ่าน / PIN (ไม่บังคับในโหมดทดสอบ)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#888] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    disabled={isSubmitting}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] shadow-2xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#8B1D1D] hover:bg-[#6D0E1C] disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังเข้าสู่ระบบ...</span>
                  </>
                ) : (
                  <>
                    <span>เข้าสู่ระบบนักศึกษา 🎓</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Mode 3 / Demo Switcher */}
          {mode === 'demo' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-[#555]">
                เลือกบัญชีนักศึกษาตัวอย่าง เพื่อทดลองเข้าร่วมห้องและแชทได้ทันที 1-Click:
              </p>

              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() =>
                    handleQuickDemoSelect(
                      'น้องนวมินทร์ (Freshy)',
                      '6702651234',
                      'พาณิชย์และการบัญชี (TBS)',
                      'ปี 1 (Freshy)',
                      'น้องใหม่ TBS หาเพื่อนติวบัญชีและไปกินสุกี้ตี๋น้อยครับ ✨',
                      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
                      ['#Freshy', '#TBS', '#สุกี้ตี๋น้อย']
                    )
                  }
                  className="w-full p-3 bg-white/80 hover:bg-white disabled:opacity-60 rounded-2xl border border-white/90 text-left shadow-2xs hover:shadow-md transition-all flex items-center gap-3 cursor-pointer group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
                    alt="Nawamin"
                    className="w-10 h-10 rounded-full object-cover border border-white shadow-2xs"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#2D2D2D] group-hover:text-[#8B1D1D]">
                      น้องนวมินทร์ (Freshy) 🎓
                    </p>
                    <p className="text-[11px] text-[#666]">รหัส 6702651234 • บริหาร TBS มธ. ศูนย์รังสิต</p>
                  </div>
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#8B1D1D]" />
                  ) : (
                    <span className="text-xs font-bold text-[#8B1D1D]">เลือก ➔</span>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() =>
                    handleQuickDemoSelect(
                      'Noah',
                      '6509654321',
                      'วิศวกรรมศาสตร์ (TSE)',
                      'ปี 3',
                      'หาเพื่อนกินข้าว เล่นบอร์ดเกม และไปวิ่งที่สระว่ายน้ำครับ 👋',
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                      ['#บอร์ดเกม', '#อาหารตามสั่ง', '#วิ่งออกกำลัง']
                    )
                  }
                  className="w-full p-3 bg-white/80 hover:bg-white disabled:opacity-60 rounded-2xl border border-white/90 text-left shadow-2xs hover:shadow-md transition-all flex items-center gap-3 cursor-pointer group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                    alt="Noah"
                    className="w-10 h-10 rounded-full object-cover border border-white shadow-2xs"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#2D2D2D] group-hover:text-[#8B1D1D]">
                      Noah 🛠️
                    </p>
                    <p className="text-[11px] text-[#666]">รหัส 6509654321 • วิศวะ TSE มธ. ศูนย์รังสิต</p>
                  </div>
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#8B1D1D]" />
                  ) : (
                    <span className="text-xs font-bold text-[#8B1D1D]">เลือก ➔</span>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() =>
                    handleQuickDemoSelect(
                      'ฟ้าใส (Fah)',
                      '6604659876',
                      'ศิลปศาสตร์ (LArts)',
                      'ปี 2',
                      'เด็กศิลปศาสตร์ชอบดูหนัง นั่งคาเฟ่ และไปกินชาบู ☕',
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                      ['#ศิลปศาสตร์', '#ชาบูหม่าล่า', '#ดูหนังZpell']
                    )
                  }
                  className="w-full p-3 bg-white/80 hover:bg-white disabled:opacity-60 rounded-2xl border border-white/90 text-left shadow-2xs hover:shadow-md transition-all flex items-center gap-3 cursor-pointer group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                    alt="Fah"
                    className="w-10 h-10 rounded-full object-cover border border-white shadow-2xs"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#2D2D2D] group-hover:text-[#8B1D1D]">
                      ฟ้าใส ☕
                    </p>
                    <p className="text-[11px] text-[#666]">รหัส 6604659876 • ศิลปศาสตร์ มธ. ศูนย์รังสิต</p>
                  </div>
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#8B1D1D]" />
                  ) : (
                    <span className="text-xs font-bold text-[#8B1D1D]">เลือก ➔</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
