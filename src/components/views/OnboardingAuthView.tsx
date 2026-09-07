import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { TU_FACULTIES } from '../../data/mockData';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  User,
  Mail,
  GraduationCap,
  BookOpen,
  HeartHandshake,
  Users,
  Compass,
  CheckCircle2,
  Lock,
  Flame,
  Check,
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
  '#ชาบูหม่าล่า',
  '#Calculus',
  '#ดนตรีสด',
];

export const OnboardingAuthView: React.FC = () => {
  const { login, register, showToast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'register' | 'login' | 'demo'>(() => {
    if (location.pathname === '/login') return 'login';
    return 'register';
  });

  useEffect(() => {
    if (location.pathname === '/login') {
      setMode('login');
    } else if (location.pathname === '/register') {
      setMode('register');
    }
  }, [location.pathname]);

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
    '#อ่านหนังสือป๋วย',
  ]);

  // Login Form State
  const [loginStudentId, setLoginStudentId] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const toggleInterestTag = (tag: string) => {
    if (selectedInterests.includes(tag)) {
      setSelectedInterests((prev) => prev.filter((t) => t !== tag));
    } else {
      setSelectedInterests((prev) => [...prev, tag]);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!regStudentId.trim() || !/^\d{10}$/.test(regStudentId.trim())) {
      showToast('กรุณากรอกรหัสนักศึกษา 10 หลักให้ถูกต้อง (เช่น 6609651234)');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regEmail.trim() || !emailRegex.test(regEmail.trim())) {
      showToast('กรุณากรอกอีเมลให้ถูกต้อง (เช่น example@email.com)');
      return;
    }

    if (!regName.trim()) {
      showToast('กรุณากรอกชื่อเล่นหรือชื่อที่ต้องการให้เพื่อนเรียก');
      return;
    }

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
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginStudentId.trim() && !loginEmail.trim()) {
      showToast('กรุณากรอกรหัสนักศึกษา (10 หลัก) หรือ อีเมล');
      return;
    }

    login({
      studentId: loginStudentId.trim() || '650965xxxx',
      email: loginEmail.trim() || `${loginStudentId || 'student'}@dome.tu.ac.th`,
      name: 'นักศึกษา มธ.',
    });
  };

  const handleQuickDemoSelect = (
    demoName: string,
    demoId: string,
    demoFaculty: string,
    demoYear: string,
    demoBio: string,
    demoAvatar: string,
    demoInterests: string[]
  ) => {
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
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Hero Welcome Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/80 shadow-xs mb-4">
          <Sparkles className="w-4 h-4 text-[#8B1D1D] animate-spin-slow" />
          <span className="text-xs font-bold text-[#8B1D1D] tracking-wide">
            คอมมูนิตี้หาเพื่อน มหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-kanit tracking-tight text-[#8B1D1D] leading-tight">
          TU<span className="text-[#F27D26]">lonely</span>
          <span className="inline-block ml-2 text-2xl sm:text-4xl animate-bounce">👀</span>
        </h1>

        <p className="mt-2 text-lg sm:text-xl font-bold text-[#2D2D2D] font-kanit">
          “ไม่ต้องเหงาอีกต่อไป”
        </p>

        <p className="mt-2 text-xs sm:text-sm text-[#666] leading-relaxed">
          ยินดีต้อนรับนักศึกษา มธ. เข้าสู่แพลตฟอร์มรวมกิจกรรมและหาเพื่อนทำกิจกรรมด้วยกัน
          ไม่ว่าจะหาเพื่อนกินข้าว เล่นกีฬา ติวหนังสือ หรือไปงานมหาลัย
        </p>
      </div>

      {/* Main Glass Card Container */}
      <div className="bg-white/50 backdrop-blur-xl rounded-3xl border border-white/70 shadow-xl overflow-hidden">
        {/* Navigation Mode Switcher Tabs */}
        <div className="flex border-b border-white/60 bg-white/30 backdrop-blur-sm p-1.5 sm:p-2 gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-3 px-3 sm:px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'register'
                ? 'bg-[#8B1D1D] text-white shadow-md'
                : 'text-[#555] hover:bg-white/60 hover:text-[#2D2D2D]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>ลงทะเบียนเข้าใช้ครั้งแรก</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-3 px-3 sm:px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'login'
                ? 'bg-[#8B1D1D] text-white shadow-md'
                : 'text-[#555] hover:bg-white/60 hover:text-[#2D2D2D]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>เข้าสู่ระบบนักศึกษา</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('demo')}
            className={`hidden sm:flex py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'demo'
                ? 'bg-[#8B1D1D] text-white shadow-md'
                : 'text-[#F27D26] bg-amber-500/10 hover:bg-amber-500/20'
            }`}
          >
            <Flame className="w-4 h-4 text-[#F27D26]" />
            <span>บัญชีทดสอบด่วน</span>
          </button>
        </div>

        {/* Mode 1: First-time Registration Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="bg-[#8B1D1D]/5 border border-[#8B1D1D]/15 rounded-2xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#8B1D1D] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#8B1D1D]">
                  สร้างโปรไฟล์นักศึกษาธรรมศาสตร์ (ใช้ครั้งแรก)
                </h4>
                <p className="text-[11px] text-[#666] mt-0.5">
                  กรอกข้อมูลเพื่อเชื่อมต่อกับเพื่อนๆ ใน มธ. ศูนย์รังสิต รหัสนักศึกษาของคุณจะถูกซ่อน 4 ตัวท้ายเพื่อความเป็นส่วนตัว
                </p>
              </div>
            </div>

            {/* Section 1: TU Academic Credentials */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#2D2D2D] font-kanit flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#8B1D1D]" />
                <span>1. ข้อมูลนักศึกษา มธ.</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#333] mb-1.5">
                    รหัสนักศึกษา (10 หลัก) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={10}
                      value={regStudentId}
                      onChange={(e) => setRegStudentId(e.target.value.replace(/\D/g, ''))}
                      placeholder="เช่น 6609651234"
                      className="w-full bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl px-3.5 py-2.5 text-xs text-[#2D2D2D] placeholder:text-[#999] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] shadow-2xs font-mono"
                      required
                    />
                    {regStudentId.length >= 2 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-[#8B1D1D]/10 text-[#8B1D1D] px-2 py-0.5 rounded-full">
                        รุ่น {regStudentId.substring(0, 2)}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#333] mb-1.5">
                    อีเมล (ใช้อีเมลใดก็ได้) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="เช่น yourname@gmail.com หรือ hotmail, outlook"
                      className="w-full bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl px-3.5 py-2.5 text-xs text-[#2D2D2D] placeholder:text-[#999] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] shadow-2xs"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-[#777] mt-1">
                    รองรับทุกผู้ให้บริการ (Gmail, Hotmail, Outlook ฯลฯ)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#333] mb-1.5">
                    คณะ <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={regFaculty}
                    onChange={(e) => setRegFaculty(e.target.value)}
                    className="w-full bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl px-3.5 py-2.5 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] shadow-2xs"
                  >
                    {TU_FACULTIES.map((fac) => (
                      <option key={fac} value={fac}>
                        {fac}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#333] mb-1.5">
                    ชั้นปี
                  </label>
                  <select
                    value={regYear}
                    onChange={(e) => setRegYear(e.target.value)}
                    className="w-full bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl px-3.5 py-2.5 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] shadow-2xs"
                  >
                    <option value="ปี 1 (Freshy)">ปี 1 (Freshy น้องใหม่)</option>
                    <option value="ปี 2">ปี 2</option>
                    <option value="ปี 3">ปี 3</option>
                    <option value="ปี 4">ปี 4</option>
                    <option value="ปริญญาโท / เอก">ปริญญาโท / เอก</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Personal Profile */}
            <div className="space-y-4 pt-4 border-t border-white/60">
              <h3 className="text-sm font-bold text-[#2D2D2D] font-kanit flex items-center gap-2">
                <User className="w-4 h-4 text-[#8B1D1D]" />
                <span>2. ข้อมูลโปรไฟล์และชื่อที่ใช้เรียก</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-[#333] mb-1.5">
                  ชื่อเล่น / ชื่อที่ต้องการแสดง <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="เช่น ฟ้าใส, นวมินทร์, Noah"
                  className="w-full bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl px-3.5 py-2.5 text-xs text-[#2D2D2D] placeholder:text-[#999] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] shadow-2xs"
                  required
                />
              </div>

              {/* Avatar Preset Selector */}
              <div>
                <label className="block text-xs font-bold text-[#333] mb-2">
                  เลือกรูปโปรไฟล์ (Avatar สไตล์นักศึกษา มธ.)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {PRESET_AVATARS.map((av) => {
                    const isSelected = regAvatar === av.url;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setRegAvatar(av.url)}
                        className={`relative rounded-2xl p-1 border-2 transition-all cursor-pointer group ${
                          isSelected
                            ? 'border-[#8B1D1D] bg-white scale-105 shadow-md ring-2 ring-[#8B1D1D]/30'
                            : 'border-white/80 bg-white/40 hover:border-white'
                        }`}
                      >
                        <img
                          src={av.url}
                          alt={av.name}
                          className="w-full h-14 sm:h-16 rounded-xl object-cover"
                        />
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#8B1D1D] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333] mb-1.5">
                  คำแนะนำตัวสั้นๆ (Bio)
                </label>
                <textarea
                  rows={2}
                  value={regBio}
                  onChange={(e) => setRegBio(e.target.value)}
                  placeholder="เช่น เด็กหอนอกเชียงราก หาเพื่อนกินตี๋น้อย เล่นบอร์ดเกม หรืออ่านหนังสือที่หอสมุดป๋วยครับ 👋"
                  className="w-full bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl px-3.5 py-2.5 text-xs text-[#2D2D2D] placeholder:text-[#999] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] shadow-2xs resize-none"
                />
              </div>

              {/* Interest Tags */}
              <div>
                <label className="block text-xs font-bold text-[#333] mb-1.5">
                  สิ่งที่คุณสนใจ / กิจกรรมที่ชอบ (เลือกได้หลายข้อ)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_INTEREST_TAGS.map((tag) => {
                    const isSelected = selectedInterests.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleInterestTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#8B1D1D] text-white shadow-xs scale-102'
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
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white font-bold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>สร้างโปรไฟล์และเริ่มต้นหาเพื่อนเลย 🚀</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Mode 2: Returning Student Login */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 sm:p-8 space-y-5">
            <div className="bg-white/60 backdrop-blur-xs p-4 rounded-2xl border border-white/80 text-xs text-[#555] flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#8B1D1D] shrink-0" />
              <span>
                เข้าสู่ระบบด้วยรหัสนักศึกษา (10 หลัก) หรือ อีเมลของคุณ
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#333] mb-1.5">
                รหัสนักศึกษา (10 หลัก) หรือ อีเมล
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={loginStudentId}
                  onChange={(e) => setLoginStudentId(e.target.value)}
                  placeholder="เช่น 6609651234 หรือ yourname@gmail.com"
                  className="w-full bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2D2D2D] placeholder:text-[#999] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] shadow-2xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#333] mb-1.5">
                รหัสผ่าน / PIN (สำหรับการจำลองระบบ)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2D2D2D] placeholder:text-[#999] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white font-bold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>เข้าสู่ระบบนักศึกษา 🎓</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-[#666]">
                ยังไม่เคยใช้งานใช่ไหม?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-[#8B1D1D] font-bold hover:underline cursor-pointer"
                >
                  ลงทะเบียนเข้าใช้ครั้งแรกที่นี่
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Mode 3: Quick Demo Accounts */}
        <div className={`p-6 sm:p-8 bg-white/30 border-t border-white/60 ${mode === 'demo' ? 'block' : 'block'}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-[#555] uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#F27D26]" />
              <span>หรือทดลองเข้าใช้งานทันทีด้วยบัญชีตัวอย่าง (1-Click Demo)</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Demo 1: Freshy TBS */}
            <button
              type="button"
              onClick={() =>
                handleQuickDemoSelect(
                  'น้องนวมินทร์ (Freshy)',
                  '670265xxxx',
                  'พาณิชย์และการบัญชี (TBS)',
                  'ปี 1 (Freshy)',
                  'น้องใหม่ TBS หาเพื่อนติวบัญชีและไปกินสุกี้ตี๋น้อยครับ ✨',
                  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
                  ['#Freshy', '#TBS', '#สุกี้ตี๋น้อย', '#อ่านหนังสือป๋วย']
                )
              }
              className="p-3.5 bg-white/70 hover:bg-white backdrop-blur-md rounded-2xl border border-white/90 text-left shadow-2xs hover:shadow-md transition-all hover:scale-102 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
                  alt="Nawamin"
                  className="w-10 h-10 rounded-full object-cover border border-white shadow-2xs"
                />
                <div>
                  <p className="text-xs font-bold text-[#2D2D2D] group-hover:text-[#8B1D1D]">
                    น้องนวมินทร์ 🎓
                  </p>
                  <p className="text-[10px] text-[#777]">ปี 1 • บริหาร TBS</p>
                </div>
              </div>
              <p className="text-[10px] text-[#666] mt-2 line-clamp-1">
                หาเพื่อนเด็ก 67 ไปงาน Freshy Day
              </p>
            </button>

            {/* Demo 2: Noah TSE */}
            <button
              type="button"
              onClick={() =>
                handleQuickDemoSelect(
                  'Noah',
                  '650965xxxx',
                  'วิศวกรรมศาสตร์ (TSE)',
                  'ปี 3',
                  'หาเพื่อนกินข้าว เล่นบอร์ดเกม และไปวิ่งที่สระว่ายน้ำ 50 เมตรครับ 👋',
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                  ['#บอร์ดเกม', '#อาหารตามสั่ง', '#วิ่งออกกำลัง', '#Calculus']
                )
              }
              className="p-3.5 bg-white/70 hover:bg-white backdrop-blur-md rounded-2xl border border-white/90 text-left shadow-2xs hover:shadow-md transition-all hover:scale-102 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                  alt="Noah"
                  className="w-10 h-10 rounded-full object-cover border border-white shadow-2xs"
                />
                <div>
                  <p className="text-xs font-bold text-[#2D2D2D] group-hover:text-[#8B1D1D]">
                    Noah 🛠️
                  </p>
                  <p className="text-[10px] text-[#777]">ปี 3 • วิศวะ TSE</p>
                </div>
              </div>
              <p className="text-[10px] text-[#666] mt-2 line-clamp-1">
                ชอบเล่นบอร์ดเกมและวิ่ง Gym 4
              </p>
            </button>

            {/* Demo 3: Fah LArts */}
            <button
              type="button"
              onClick={() =>
                handleQuickDemoSelect(
                  'ฟ้าใส (Fah)',
                  '660465xxxx',
                  'ศิลปศาสตร์ (LArts)',
                  'ปี 2',
                  'เด็กศิลปศาสตร์ชอบดูหนัง นั่งคาเฟ่ และไปกินชาบู ☕',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                  ['#ศิลปศาสตร์', '#ชาบูหม่าล่า', '#ดูหนังZpell', '#คาเฟ่']
                )
              }
              className="p-3.5 bg-white/70 hover:bg-white backdrop-blur-md rounded-2xl border border-white/90 text-left shadow-2xs hover:shadow-md transition-all hover:scale-102 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                  alt="Fah"
                  className="w-10 h-10 rounded-full object-cover border border-white shadow-2xs"
                />
                <div>
                  <p className="text-xs font-bold text-[#2D2D2D] group-hover:text-[#8B1D1D]">
                    ฟ้าใส ☕
                  </p>
                  <p className="text-[10px] text-[#777]">ปี 2 • ศิลปศาสตร์</p>
                </div>
              </div>
              <p className="text-[10px] text-[#666] mt-2 line-clamp-1">
                ชอบดูหนังและไปคาเฟ่รอบ มธ.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Guest Mode Skip Option */}
      <div className="text-center mt-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#555] hover:text-[#8B1D1D] bg-white/50 hover:bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/70 shadow-2xs transition-all cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 text-[#8B1D1D]" />
          <span>ข้ามไปก่อน — สำรวจกิจกรรมและห้องหาเพื่อนในโหมดผู้เยี่ยมชม (Guest Mode) ➔</span>
        </button>
      </div>

      {/* Feature Value Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 sm:mt-10 text-center">
        <div className="bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/70 shadow-2xs">
          <div className="text-2xl mb-1.5">🍜</div>
          <h4 className="text-xs font-bold text-[#2D2D2D]">หาเพื่อนกินข้าว</h4>
          <p className="text-[11px] text-[#666] mt-0.5">
            แชร์โต๊ะกินข้าว ตี๋น้อย เชียงราก หรือโรงอาหาร SC
          </p>
        </div>

        <div className="bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/70 shadow-2xs">
          <div className="text-2xl mb-1.5">📚</div>
          <h4 className="text-xs font-bold text-[#2D2D2D]">ติวหนังสือ & อ่านสอบ</h4>
          <p className="text-[11px] text-[#666] mt-0.5">
            สร้างกลุ่มติววิชาต่าง ๆ ที่หอสมุดป๋วย อึ๊งภากรณ์
          </p>
        </div>

        <div className="bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/70 shadow-2xs">
          <div className="text-2xl mb-1.5">🎉</div>
          <h4 className="text-xs font-bold text-[#2D2D2D]">กิจกรรม มธ. ศูนย์รังสิต</h4>
          <p className="text-[11px] text-[#666] mt-0.5">
            หาเพื่อนไปงาน Freshy Day, คอนเสิร์ต และ TU Games
          </p>
        </div>
      </div>
    </div>
  );
};
