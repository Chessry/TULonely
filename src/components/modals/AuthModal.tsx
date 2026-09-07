import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight,
  Mail,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { authService } from '../../services/authService';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

interface AuthErrors {
  studentId?: string;
  fullName?: string;
  email?: string;
  password?: string;
  name?: string;
  loginEmail?: string;
  loginPassword?: string;
}

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, showToast } = useApp();

  const [mode, setMode] = useState<'register' | 'login' | 'forgot'>('register');

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

  // Validation & Loading state
  const [errors, setErrors] = useState<AuthErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
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

  // Close on Escape key
  useEffect(() => {
    if (!isAuthModalOpen) {
      setErrors({});
      setIsSubmitting(false);
      setServerError(null);
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

  const validateRegister = (): boolean => {
    const newErrors: AuthErrors = {};

    // 1. Student ID check (10 digits)
    const cleanedId = regStudentId.trim();
    if (!cleanedId) {
      newErrors.studentId = 'กรุณากรอกรหัสนักศึกษา 10 หลัก';
    } else if (!/^\d{10}$/.test(cleanedId)) {
      newErrors.studentId = 'รหัสนักศึกษาต้องเป็นตัวเลข 10 หลักพอดี (เช่น 6609651234)';
    }

    // 2. Full Name check
    const cleanedFullName = regFullName.trim();
    if (!cleanedFullName) {
      newErrors.fullName = 'กรุณากรอกชื่อจริง นามสกุล';
    } else if (cleanedFullName.length < 4) {
      newErrors.fullName = 'กรุณากรอกชื่อและนามสกุลให้ครบถ้วน';
    }

    // 3. Email check
    const cleanedEmail = regEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanedEmail) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!emailRegex.test(cleanedEmail)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง (เช่น example@email.com)';
    }

    // 4. Password check
    if (!regPassword) {
      newErrors.password = 'กรุณากำหนดรหัสผ่าน';
    } else if (regPassword.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateRegister()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const trimmedFullName = regFullName.trim();
      // If nickname is not provided, use real_name (full name)
      const displayName = regName.trim()
        ? regName.trim()
        : trimmedFullName;

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

      setIsAuthModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลงทะเบียน';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateLogin = (): boolean => {
    const newErrors: AuthErrors = {};
    const input = loginEmail.trim();

    if (!input) {
      newErrors.loginEmail = 'กรุณากรอก Email';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input)) {
        newErrors.loginEmail = 'รูปแบบ Email ไม่ถูกต้อง';
      }
    }

    if (!loginPassword) {
      newErrors.loginPassword = 'กรุณากรอก Password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateLogin()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login({
        email: loginEmail.trim(),
        password: loginPassword,
        name: 'นักศึกษา มธ.',
      });

      setIsAuthModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ';
      setServerError(msg);
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
      <div className="relative w-full max-w-xl bg-[#FDFBF7]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 font-prompt">
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
        {mode === 'forgot' ? (
          <div className="flex items-center justify-between border-b border-white/80 bg-white/40 p-2 px-4">
            <button
              type="button"
              disabled={isSubmitting || isForgotSubmitting}
              onClick={() => {
                setMode('login');
                setServerError(null);
                setForgotError(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B1D1D] hover:text-[#6D0E1C] bg-white/70 hover:bg-white backdrop-blur-md px-3 py-1.5 rounded-full border border-white/90 shadow-2xs transition-all cursor-pointer font-kanit"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ย้อนกลับไปหน้าเข้าสู่ระบบ</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D2D2D] font-kanit">
              <KeyRound className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>รีเซ็ตรหัสผ่าน</span>
            </div>
          </div>
        ) : (
          <div className="flex border-b border-white/80 bg-white/40 p-1.5 gap-1.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setMode('register');
                setErrors({});
                setServerError(null);
                setForgotError(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold font-kanit transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                setServerError(null);
                setForgotError(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold font-kanit transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#8B1D1D] text-white shadow-md'
                  : 'text-[#555] hover:bg-white/60'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบ</span>
            </button>
          </div>
        )}

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          <div className="bg-[#8B1D1D]/5 border border-[#8B1D1D]/15 rounded-2xl p-3.5 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#8B1D1D] shrink-0 mt-0.5" />
            <p className="text-xs text-[#8B1D1D] leading-tight">
              ยืนยันตัวตนด้วยรหัสนักศึกษา 10 หลักผ่านระบบ TUlonely มธ. ศูนย์รังสิต ข้อมูลรหัสผ่านจะถูกจัดเก็บอย่างปลอดภัย
            </p>
          </div>

          {/* Server Error Alert Banner */}
          {serverError && (
            <div className="p-3.5 bg-rose-50/95 border border-rose-200/80 rounded-2xl flex items-start gap-2.5 text-rose-700 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="text-xs">
                <p className="font-bold font-kanit text-rose-800">
                  {mode === 'register' ? 'การลงทะเบียนไม่สำเร็จ' : 'เข้าสู่ระบบไม่สำเร็จ'}
                </p>
                <p className="mt-0.5 leading-relaxed text-rose-700">{serverError}</p>
              </div>
            </div>
          )}

          {/* Mode 1: Register */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Student ID */}
                <div>
                  <label className="block text-xs font-bold text-[#333] mb-1 font-kanit">
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
                  {errors.studentId && (
                    <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.studentId}</span>
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-[#333] mb-1 font-kanit">
                    อีเมล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    disabled={isSubmitting}
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="เช่น example@gmail.com หรือ hotmail"
                    className={`w-full bg-white/70 backdrop-blur-xs border rounded-xl px-3 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 shadow-2xs transition-colors ${
                      errors.email
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                        : 'border-white/90 focus:ring-[#8B1D1D]'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-[#333] mb-1 font-kanit">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    disabled={isSubmitting}
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder="กำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร"
                    className={`w-full bg-white/70 backdrop-blur-xs border rounded-xl pl-3 pr-10 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 shadow-2xs transition-colors ${
                      errors.password
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                        : 'border-white/90 focus:ring-[#8B1D1D]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#333] p-1 cursor-pointer"
                    title={showRegPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#333] mb-1 font-kanit">
                  ชื่อจริง นามสกุล <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  value={regFullName}
                  onChange={(e) => {
                    setRegFullName(e.target.value);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                  }}
                  placeholder="เช่น สมชาย รักธรรมศาสตร์"
                  className={`w-full bg-white/70 backdrop-blur-xs border rounded-xl px-3 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 shadow-2xs transition-colors ${
                    errors.fullName
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                      : 'border-white/90 focus:ring-[#8B1D1D]'
                  }`}
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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#333] font-kanit">
                    ชื่อเล่น / ชื่อที่ต้องการแสดง
                  </label>
                  <span className="text-[11px] text-[#888]">(ไม่บังคับ)</span>
                </div>
                <input
                  type="text"
                  disabled={isSubmitting}
                  value={regName}
                  onChange={(e) => {
                    setRegName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="เช่น ชาย, สมชาย (หากไม่กรอกจะใช้ชื่อจริง)"
                  className="w-full bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl px-3 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 shadow-2xs focus:ring-[#8B1D1D]"
                />
              </div>

              {/* Bio (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#333] font-kanit">
                    คำแนะนำตัวสั้น ๆ (Bio)
                  </label>
                  <span className="text-[11px] text-[#888]">(ไม่บังคับ)</span>
                </div>
                <textarea
                  rows={2}
                  disabled={isSubmitting}
                  value={regBio}
                  onChange={(e) => setRegBio(e.target.value)}
                  placeholder="เช่น หาเพื่อนกินข้าว ติวสอบ หรือเล่นบอร์ดเกมครับ 👋"
                  className="w-full bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl px-3 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] shadow-2xs resize-none"
                />
              </div>

              {/* Submit button with loader */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#8B1D1D] hover:bg-[#6D0E1C] disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold text-xs font-kanit rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังตรวจสอบข้อมูลกับระบบ มธ... ⏳</span>
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
                <label className="block text-xs font-bold text-[#333] mb-1 font-kanit">
                  Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#888] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled={isSubmitting}
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (errors.loginEmail) {
                        setErrors((prev) => ({ ...prev, loginEmail: undefined }));
                      }
                    }}
                    placeholder="เช่น example@gmail.com หรือ student@dome.tu.ac.th"
                    className={`w-full bg-white/70 backdrop-blur-xs border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 shadow-2xs transition-colors ${
                      errors.loginEmail
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                        : 'border-white/90 focus:ring-[#8B1D1D]'
                    }`}
                    required
                  />
                </div>
                {errors.loginEmail && (
                  <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.loginEmail}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333] mb-1 font-kanit">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#888] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    disabled={isSubmitting}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (errors.loginPassword) {
                        setErrors((prev) => ({ ...prev, loginPassword: undefined }));
                      }
                    }}
                    placeholder="กรอกรหัสผ่านของคุณ"
                    className={`w-full bg-white/70 backdrop-blur-xs border rounded-xl pl-9 pr-10 py-2.5 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 shadow-2xs transition-colors ${
                      errors.loginPassword
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                        : 'border-white/90 focus:ring-[#8B1D1D]'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#333] p-1 cursor-pointer"
                    title={showLoginPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.loginPassword && (
                  <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.loginPassword}</span>
                  </p>
                )}

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
                className="w-full py-3 bg-[#8B1D1D] hover:bg-[#6D0E1C] disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold text-xs font-kanit rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
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

          {/* Mode 3: Forgot Password Form */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <div className="bg-[#8B1D1D]/5 border border-[#8B1D1D]/15 rounded-2xl p-3.5 flex items-start gap-2.5">
                <KeyRound className="w-4 h-4 text-[#8B1D1D] shrink-0 mt-0.5" />
                <p className="text-xs text-[#8B1D1D] leading-tight">
                  กรอกอีเมลของคุณเพื่อรับ Magic Link สำหรับกู้คืนและตั้งรหัสผ่านใหม่
                </p>
              </div>

              {forgotSuccess ? (
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-5 border border-white/90 shadow-sm text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold font-kanit text-[#2D2D2D]">
                    ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว! 📨
                  </h3>
                  <p className="text-xs text-[#555] leading-relaxed">
                    ระบบได้ส่งลิงก์ตั้งรหัสผ่านใหม่ไปยัง <span className="font-semibold text-[#8B1D1D]">{forgotSuccessEmail}</span> แล้ว กรุณาตรวจสอบในกล่องจดหมายของคุณ (รวมทั้งโฟลเดอร์ Junk/Spam)
                  </p>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-left text-[11px] text-[#7A4B00]">
                    💡 คลิกที่ลิงก์ในอีเมลเพื่อเข้าสู่หน้าตั้งรหัสผ่านใหม่
                  </div>
                  <div className="pt-2 flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setForgotSuccess(false);
                      }}
                      className="py-2.5 px-4 bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white font-bold text-xs font-kanit rounded-xl shadow-md transition-all active:scale-98 cursor-pointer"
                    >
                      กลับไปหน้าเข้าสู่ระบบ
                    </button>
                    <button
                      type="button"
                      onClick={() => setForgotSuccess(false)}
                      className="py-2.5 px-3 bg-white hover:bg-neutral-50 text-[#555] font-bold text-xs font-kanit rounded-xl border border-neutral-200 transition-all cursor-pointer"
                    >
                      ส่งใหม่อีกครั้ง
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  {forgotError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl p-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-rose-600">{forgotError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#333] mb-1 font-kanit">
                      อีเมลที่ใช้ลงทะเบียน <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#888] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        disabled={isForgotSubmitting}
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          if (forgotError) setForgotError(null);
                        }}
                        placeholder="เช่น student@dome.tu.ac.th หรือ email@gmail.com"
                        className="w-full bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] shadow-2xs"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isForgotSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-[#8B1D1D] to-[#F27D26] hover:from-[#6D0E1C] hover:to-[#d96716] disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold text-xs font-kanit rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isForgotSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>กำลังส่งลิงก์...</span>
                      </>
                    ) : (
                      <>
                        <span>ส่งลิงก์รีเซ็ตรหัสผ่าน 🚀</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <p className="text-xs text-[#666]">
                      จำรหัสผ่านได้แล้ว?{' '}
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
      </div>
    </div>
  );
};
