import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  User,
  Mail,
  GraduationCap,
  Compass,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { authService } from '../../services/authService';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

interface OnboardingAuthViewProps {
  defaultMode?: 'register' | 'login' | 'forgot';
}

export const OnboardingAuthView: React.FC<OnboardingAuthViewProps> = ({ defaultMode }) => {
  const { login, register, showToast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'register' | 'login' | 'forgot'>(() => {
    if (defaultMode) return defaultMode;
    if (location.pathname === '/login') return 'login';
    if (location.pathname === '/forgot-password') return 'forgot';
    return 'register';
  });

  useEffect(() => {
    if (location.pathname === '/login') {
      setMode('login');
    } else if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/forgot-password') {
      setMode('forgot');
    }
  }, [location.pathname]);

  // Register Form State
  const [regStudentId, setRegStudentId] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regBio, setRegBio] = useState('');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotSuccessEmail, setForgotSuccessEmail] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Errors and Submitting state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    const email = forgotEmail.trim();
    if (!email) {
      setForgotError('กรุณากรอกอีเมลของคุณ');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setForgotError('รูปแบบอีเมลไม่ถูกต้อง กรุณากรอกอีเมลที่ถูกต้อง');
      return;
    }

    setIsForgotSubmitting(true);
    try {
      await authService.sendPasswordResetEmail(email);
      setForgotSuccess(true);
      setForgotSuccessEmail(email);
      showToast('ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลเรียบร้อยแล้ว');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถส่งลิงก์รีเซ็ตรหัสผ่านได้';
      setForgotError(msg);
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const validateRegister = (): boolean => {
    const errs: Record<string, string> = {};

    if (!regStudentId.trim()) {
      errs.studentId = 'กรุณากรอกรหัสนักศึกษา 10 หลัก';
    } else if (!/^\d{10}$/.test(regStudentId.trim())) {
      errs.studentId = 'รหัสนักศึกษาต้องเป็นตัวเลข 10 หลัก (เช่น 6609651234)';
    }

    if (!regFullName.trim()) {
      errs.fullName = 'กรุณากรอกชื่อจริง นามสกุล';
    } else if (regFullName.trim().length < 4) {
      errs.fullName = 'กรุณากรอกชื่อและนามสกุลให้ครบถ้วน';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regEmail.trim()) {
      errs.email = 'กรุณากรอกอีเมล';
    } else if (!emailRegex.test(regEmail.trim())) {
      errs.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!regPassword) {
      errs.password = 'กรุณากำหนดรหัสผ่าน';
    } else if (regPassword.length < 6) {
      errs.password = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateRegister()) {
      return;
    }

    const trimmedFullName = regFullName.trim();
    // If nickname is not provided, use real_name (full name)
    const displayName = regName.trim()
      ? regName.trim()
      : trimmedFullName;

    setIsSubmitting(true);
    try {
      await register({
        fullName: trimmedFullName,
        name: displayName,
        studentId: regStudentId.trim(),
        email: regEmail.trim(),
        password: regPassword,
        faculty: 'มหาวิทยาลัยธรรมศาสตร์',
        year: `ปี ${Math.max(1, new Date().getFullYear() + 543 - (2500 + parseInt(regStudentId.slice(0, 2), 10)))}`,
        campus: 'ศูนย์รังสิต',
        bio: regBio.trim() ? regBio.trim() : null,
        avatar: DEFAULT_AVATAR,
        interests: ['#หาเพื่อน', '#เด็กหอรังสิต', '#ธรรมศาสตร์'],
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลงทะเบียน';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const trimmedEmail = loginEmail.trim();
    if (!trimmedEmail) {
      showToast('กรุณากรอก Email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      showToast('รูปแบบ Email ไม่ถูกต้อง');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({
        email: trimmedEmail,
        password: loginPassword,
        name: 'นักศึกษา มธ.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto font-prompt">
      {/* Hero Welcome Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/80 shadow-xs mb-4">
          <Sparkles className="w-4 h-4 text-[#8B1D1D] animate-spin-slow" />
          <span className="text-xs font-bold text-[#8B1D1D] tracking-wide font-kanit">
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
        {mode === 'forgot' ? (
          <div className="flex items-center justify-between border-b border-white/60 bg-white/30 backdrop-blur-sm p-2 sm:p-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setServerError(null);
                setForgotError(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B1D1D] hover:text-[#6D0E1C] bg-white/60 hover:bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/80 shadow-2xs transition-all cursor-pointer font-kanit"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ย้อนกลับไปหน้าเข้าสู่ระบบ</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D2D2D] font-kanit">
              <KeyRound className="w-4 h-4 text-[#F27D26]" />
              <span>รีเซ็ตรหัสผ่าน</span>
            </div>
          </div>
        ) : (
          <div className="flex border-b border-white/60 bg-white/30 backdrop-blur-sm p-1.5 sm:p-2 gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrors({});
                setServerError(null);
                setForgotError(null);
              }}
              className={`flex-1 py-3 px-3 sm:px-4 rounded-2xl text-xs sm:text-sm font-bold font-kanit transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
              onClick={() => {
                setMode('login');
                setErrors({});
                setServerError(null);
                setForgotError(null);
              }}
              className={`flex-1 py-3 px-3 sm:px-4 rounded-2xl text-xs sm:text-sm font-bold font-kanit transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#8B1D1D] text-white shadow-md'
                  : 'text-[#555] hover:bg-white/60 hover:text-[#2D2D2D]'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>เข้าสู่ระบบนักศึกษา</span>
            </button>
          </div>
        )}

        {/* Mode 1: First-time Registration Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="bg-[#8B1D1D]/5 border border-[#8B1D1D]/15 rounded-2xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#8B1D1D] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#8B1D1D] font-kanit">
                  สร้างโปรไฟล์นักศึกษาธรรมศาสตร์ (ใช้ครั้งแรก)
                </h4>
                <p className="text-[11px] text-[#666] mt-0.5">
                  กรอกข้อมูลเพื่อเชื่อมต่อกับเพื่อนๆ ใน มธ. ศูนย์รังสิต รหัสนักศึกษาของคุณจะถูกซ่อน 4 ตัวท้ายเพื่อความเป็นส่วนตัว
                </p>
              </div>
            </div>

            {/* Section 1: TU Academic Credentials & Security */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#2D2D2D] font-kanit flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#8B1D1D]" />
                <span>1. ข้อมูลนักศึกษาและความปลอดภัย</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Student ID */}
                <div>
                  <label className="block text-xs font-bold text-[#333] mb-1.5 font-kanit">
                    รหัสนักศึกษา (10 หลัก) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={10}
                      value={regStudentId}
                      onChange={(e) => {
                        setRegStudentId(e.target.value.replace(/\D/g, ''));
                        if (errors.studentId) setErrors((prev) => ({ ...prev, studentId: '' }));
                      }}
                      placeholder="เช่น 6609651234"
                      className={`w-full bg-white/70 backdrop-blur-xs border rounded-xl px-3.5 py-2.5 text-xs text-[#2D2D2D] placeholder:text-[#999] focus:outline-none focus:bg-white focus:ring-2 font-mono shadow-2xs transition-colors ${
                        errors.studentId
                          ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                          : 'border-white/90 focus:ring-[#8B1D1D]'
                      }`}
                      required
                    />
                    {regStudentId.length >= 2 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-[#8B1D1D]/10 text-[#8B1D1D] px-2 py-0.5 rounded-full">
                        รุ่น {regStudentId.substring(0, 2)}
                      </span>
                    )}
                  </div>
                  {errors.studentId && (
                    <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.studentId}</span>
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-[#333] mb-1.5 font-kanit">
                    อีเมล <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      placeholder="เช่น yourname@gmail.com หรือ hotmail, outlook"
                      className={`w-full bg-white/70 backdrop-blur-xs border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#2D2D2D] placeholder:text-[#999] focus:outline-none focus:bg-white focus:ring-2 shadow-2xs transition-colors ${
                        errors.email
                          ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                          : 'border-white/90 focus:ring-[#8B1D1D]'
                      }`}
                      required
                    />
                  </div>
                  {errors.email ? (
                    <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-[#777] mt-1">
                      รองรับทุกผู้ให้บริการ (Gmail, Hotmail, Outlook ฯลฯ)
                    </p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-[#333] mb-1.5 font-kanit">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    placeholder="กำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร"
                    className={`w-full bg-white/70 backdrop-blur-xs border rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#2D2D2D] placeholder:text-[#999] focus:outline-none focus:bg-white focus:ring-2 shadow-2xs transition-colors ${
                      errors.password
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                        : 'border-white/90 focus:ring-[#8B1D1D]'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#333] p-1 cursor-pointer"
                    title={showRegPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showRegPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Section 2: Personal Profile */}
            <div className="space-y-4 pt-4 border-t border-white/60">
              <h3 className="text-sm font-bold text-[#2D2D2D] font-kanit flex items-center gap-2">
                <User className="w-4 h-4 text-[#8B1D1D]" />
                <span>2. ข้อมูลโปรไฟล์</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-[#333] mb-1.5 font-kanit">
                    ชื่อจริง นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => {
                      setRegFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                    }}
                    placeholder="เช่น สมชาย รักธรรมศาสตร์"
                    className={`w-full bg-white/70 backdrop-blur-xs border rounded-xl px-3.5 py-2.5 text-xs text-[#2D2D2D] placeholder:text-[#999] focus:outline-none focus:bg-white focus:ring-2 shadow-2xs transition-colors ${
                      errors.fullName
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                        : 'border-white/90 focus:ring-[#8B1D1D]'
                    }`}
                    required
                  />
                  {errors.fullName && (
                    <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

                {/* Nickname / Display Name (Optional) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#333] font-kanit">
                      ชื่อเล่น / ชื่อที่ต้องการแสดง
                    </label>
                    <span className="text-[11px] text-[#888]">(ไม่บังคับ)</span>
                  </div>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="เช่น ชาย, สมชาย (หากไม่กรอกจะใช้ชื่อจริง)"
                    className="w-full bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl px-3.5 py-2.5 text-xs text-[#2D2D2D] placeholder:text-[#999] focus:outline-none focus:bg-white focus:ring-2 shadow-2xs"
                  />
                </div>
              </div>

              {/* Bio (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#333] font-kanit">
                    คำแนะนำตัวสั้นๆ (Bio)
                  </label>
                  <span className="text-[11px] text-[#888]">(ไม่บังคับ)</span>
                </div>
                <textarea
                  rows={2}
                  value={regBio}
                  onChange={(e) => setRegBio(e.target.value)}
                  placeholder="เช่น เด็กหอนอกเชียงราก หาเพื่อนกินตี๋น้อย เล่นบอร์ดเกม หรืออ่านหนังสือที่หอสมุดป๋วยครับ 👋"
                  className="w-full bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl px-3.5 py-2.5 text-xs text-[#2D2D2D] placeholder:text-[#999] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] shadow-2xs resize-none"
                />
              </div>
            </div>

            {/* Server Error Alert Banner */}
            {serverError && mode === 'register' && (
              <div className="p-3.5 bg-rose-50/90 border border-rose-200/80 rounded-2xl flex items-start gap-2.5 text-rose-700 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
                <div className="text-xs">
                  <p className="font-bold font-kanit text-rose-800">การลงทะเบียนไม่สำเร็จ</p>
                  <p className="mt-0.5 leading-relaxed text-rose-700">{serverError}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#8B1D1D] hover:bg-[#6D0E1C] disabled:bg-[#8B1D1D]/70 disabled:cursor-not-allowed text-white font-bold text-sm font-kanit rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>กำลังตรวจสอบข้อมูลกับระบบ มธ... ⏳</span>
                  </>
                ) : (
                  <>
                    <span>สร้างโปรไฟล์และเริ่มต้นหาเพื่อนเลย 🚀</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
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
                เข้าสู่ระบบด้วย Email และ Password ของคุณ
              </span>
            </div>

            {/* Server Error Alert Banner */}
            {serverError && mode === 'login' && (
              <div className="p-3.5 bg-rose-50/90 border border-rose-200/80 rounded-2xl flex items-start gap-2.5 text-rose-700 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
                <div className="text-xs">
                  <p className="font-bold font-kanit text-rose-800">เข้าสู่ระบบไม่สำเร็จ</p>
                  <p className="mt-0.5 leading-relaxed text-rose-700">{serverError}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#333] mb-1.5 font-kanit">
                Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="เช่น yourname@gmail.com หรือ student@dome.tu.ac.th"
                  className="w-full bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2D2D2D] placeholder:text-[#999] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] shadow-2xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#333] mb-1.5 font-kanit">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  className="w-full bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#2D2D2D] placeholder:text-[#999] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] shadow-2xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#333] p-1 cursor-pointer"
                  title={showLoginPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showLoginPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Forgot Password Button */}
              <div className="flex justify-end pt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrors({});
                    setServerError(null);
                    setForgotError(null);
                    setForgotSuccess(false);
                    if (loginEmail.trim()) {
                      setForgotEmail(loginEmail.trim());
                    }
                  }}
                  className="text-xs font-semibold text-[#8B1D1D] hover:text-[#6D0E1C] hover:underline transition-colors cursor-pointer"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#8B1D1D] hover:bg-[#6D0E1C] disabled:bg-[#8B1D1D]/70 disabled:cursor-not-allowed text-white font-bold text-sm font-kanit rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังเข้าสู่ระบบ... ⏳</span>
                </>
              ) : (
                <>
                  <span>เข้าสู่ระบบนักศึกษา 🎓</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-[#666]">
                ยังไม่เคยใช้งานใช่ไหม?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrors({});
                    setServerError(null);
                  }}
                  className="text-[#8B1D1D] font-bold hover:underline cursor-pointer"
                >
                  ลงทะเบียนเข้าใช้ครั้งแรกที่นี่
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Mode 3: Forgot Password Form */}
        {mode === 'forgot' && (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Header info banner */}
            <div className="bg-[#8B1D1D]/5 border border-[#8B1D1D]/15 rounded-2xl p-4 flex items-start gap-3">
              <KeyRound className="w-5 h-5 text-[#8B1D1D] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#8B1D1D] font-kanit">
                  ลืมรหัสผ่านสำหรับเข้าใช้งาน TUlonely
                </h4>
                <p className="text-[11px] text-[#666] mt-0.5 leading-relaxed">
                  กรอกอีเมลที่คุณใช้ลงทะเบียน เราจะส่งลิงก์ Magic Link สำหรับกู้คืนและตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณ
                </p>
              </div>
            </div>

            {forgotSuccess ? (
              /* Success confirmation state */
              <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/80 shadow-md text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-inner">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold font-kanit text-[#2D2D2D]">
                    ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว! 📨
                  </h3>
                  <p className="text-xs text-[#555] max-w-md mx-auto leading-relaxed">
                    ระบบได้ส่งลิงก์ตั้งรหัสผ่านใหม่ไปยัง{' '}
                    <span className="font-semibold text-[#8B1D1D] underline">{forgotSuccessEmail}</span>{' '}
                    เรียบร้อยแล้ว กรุณาตรวจสอบในกล่องจดหมายของคุณ (รวมถึงโฟลเดอร์ Junk/Spam)
                  </p>
                </div>

                {/* Helpful instructions box */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 text-left max-w-md mx-auto">
                  <p className="text-[11px] text-[#7A4B00] leading-relaxed">
                    💡 <span className="font-bold">ขั้นตอนถัดไป:</span> เปิดอีเมลและกดปุ่มหรือลิงก์ยืนยัน จากนั้นระบบจะพาคุณกลับมาที่หน้า <b>"ตั้งรหัสผ่านใหม่"</b> เพื่อกำหนดรหัสผ่านทันที (ลิงก์มีอายุจำกัด)
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setForgotSuccess(false);
                      setForgotError(null);
                    }}
                    className="flex-1 py-2.5 px-4 bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white font-bold text-xs font-kanit rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
                  >
                    กลับไปหน้าเข้าสู่ระบบ 🎓
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotSuccess(false);
                    }}
                    className="py-2.5 px-4 bg-white/70 hover:bg-white text-[#555] hover:text-[#2D2D2D] font-bold text-xs font-kanit rounded-2xl border border-white/90 shadow-2xs transition-all cursor-pointer"
                  >
                    ส่งใหม่อีกครั้ง
                  </button>
                </div>
              </div>
            ) : (
              /* Forgot email input form */
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                {forgotError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl p-3.5 flex items-start gap-2.5 animate-in fade-in duration-150">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold font-kanit">ขออภัย เกิดข้อผิดพลาด</p>
                      <p className="text-[11px] text-rose-600 mt-0.5">{forgotError}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#333] mb-1.5 font-kanit">
                    อีเมลที่ใช้ลงทะเบียน <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        if (forgotError) setForgotError(null);
                      }}
                      placeholder="เช่น student@dome.tu.ac.th หรือ email@gmail.com"
                      className="w-full bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2D2D2D] placeholder:text-[#999] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] shadow-2xs"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-[#777] mt-1.5">
                    ระบบจะส่ง Magic Link สำหรับยืนยันตัวตนและตั้งรหัสผ่านใหม่ไปยังอีเมลนี้
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isForgotSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-[#8B1D1D] to-[#F27D26] hover:from-[#6D0E1C] hover:to-[#d96716] disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold text-sm font-kanit rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isForgotSubmitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>กำลังส่งลิงก์... ⏳</span>
                    </>
                  ) : (
                    <>
                      <span>ส่งลิงก์รีเซ็ตรหัสผ่าน 🚀</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-[#666]">
                    จำรหัสผ่านได้แล้วใช่ไหม?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setForgotError(null);
                      }}
                      className="text-[#8B1D1D] font-bold hover:underline cursor-pointer"
                    >
                      เข้าสู่ระบบที่นี่
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Guest Mode Skip Option */}
      <div className="text-center mt-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#555] hover:text-[#8B1D1D] bg-white/50 hover:bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/70 shadow-2xs transition-all cursor-pointer font-kanit"
        >
          <Compass className="w-3.5 h-3.5 text-[#8B1D1D]" />
          <span>ข้ามไปก่อน — สำรวจกิจกรรมและห้องหาเพื่อนในโหมดผู้เยี่ยมชม (Guest Mode) ➔</span>
        </button>
      </div>

      {/* Feature Value Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 sm:mt-10 text-center">
        <div className="bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/70 shadow-2xs">
          <div className="text-2xl mb-1.5">🍜</div>
          <h4 className="text-xs font-bold text-[#2D2D2D] font-kanit">หาเพื่อนกินข้าว</h4>
          <p className="text-[11px] text-[#666] mt-0.5">
            แชร์โต๊ะกินข้าว ตี๋น้อย เชียงราก หรือโรงอาหาร SC
          </p>
        </div>

        <div className="bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/70 shadow-2xs">
          <div className="text-2xl mb-1.5">📚</div>
          <h4 className="text-xs font-bold text-[#2D2D2D] font-kanit">ติวหนังสือ & อ่านสอบ</h4>
          <p className="text-[11px] text-[#666] mt-0.5">
            สร้างกลุ่มติววิชาต่าง ๆ ที่หอสมุดป๋วย อึ๊งภากรณ์
          </p>
        </div>

        <div className="bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/70 shadow-2xs">
          <div className="text-2xl mb-1.5">🎉</div>
          <h4 className="text-xs font-bold text-[#2D2D2D] font-kanit">กิจกรรม มธ. ศูนย์รังสิต</h4>
          <p className="text-[11px] text-[#666] mt-0.5">
            หาเพื่อนไปงาน Freshy Day, คอนเสิร์ต และ TU Games
          </p>
        </div>
      </div>
    </div>
  );
};
