import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/authService';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import {
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  Clock,
  RotateCcw,
} from 'lucide-react';

const EXPIRY_DURATION_SECONDS = 10 * 60; // 10 minutes = 600 seconds
const STORAGE_KEY = 'tulonely_reset_password_start_time';
const COMPLETED_KEY = 'tulonely_reset_password_completed';

export const ResetPasswordView: React.FC = () => {
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);

  // 10-minute Timer and Expiry states
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [expireReason, setExpireReason] = useState<'timeout' | 'completed' | null>(null);

  // 1. Manage 10-Minute Expiry Timer & Check Already-Completed Status
  useEffect(() => {
    // Check if this is a fresh arrival from an email recovery link
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const isFreshRecovery = hash.includes('type=recovery') || search.includes('type=recovery');

    if (isFreshRecovery) {
      sessionStorage.removeItem(COMPLETED_KEY);
      sessionStorage.setItem(STORAGE_KEY, Date.now().toString());
      setIsExpired(false);
      setExpireReason(null);
    } else {
      // Check if password reset was already completed in this session
      const isCompleted = sessionStorage.getItem(COMPLETED_KEY);
      if (isCompleted === 'true') {
        setIsExpired(true);
        setExpireReason('completed');
        return;
      }
    }

    // Retrieve or initialize start time
    const storedStartTime = sessionStorage.getItem(STORAGE_KEY);
    let startTime: number;

    if (storedStartTime && !isFreshRecovery) {
      startTime = parseInt(storedStartTime, 10);
    } else {
      startTime = Date.now();
      sessionStorage.setItem(STORAGE_KEY, startTime.toString());
    }

    // Check if already expired on mount
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const initialRemaining = EXPIRY_DURATION_SECONDS - elapsedSeconds;

    if (initialRemaining <= 0) {
      setIsExpired(true);
      setExpireReason('timeout');
      sessionStorage.removeItem(STORAGE_KEY);
      if (isSupabaseConfigured) {
        supabase.auth.signOut().catch(() => {});
      }
      return;
    }

    // Timeout trigger after remaining time expires (10 minutes total)
    const timer = setTimeout(() => {
      setIsExpired(true);
      setExpireReason('timeout');
      sessionStorage.removeItem(STORAGE_KEY);

      // Security: Sign out session when expired
      if (isSupabaseConfigured) {
        supabase.auth.signOut().catch(() => {});
      }
    }, initialRemaining * 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // 2. Check if user came from a valid password recovery link
  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      if (!isSupabaseConfigured) {
        // In local/mock mode, allow setting new password for testing
        if (mounted) setHasValidSession(true);
        return;
      }

      // Check current session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        if (mounted) setHasValidSession(true);
        return;
      }

      // Listen for auth state change event (e.g. PASSWORD_RECOVERY)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;
        if (event === 'PASSWORD_RECOVERY' || session) {
          setHasValidSession(true);
        }
      });

      // Check if hash has access_token or type=recovery
      const hash = window.location.hash;
      if (hash && (hash.includes('type=recovery') || hash.includes('access_token='))) {
        if (mounted) setHasValidSession(true);
      } else {
        // Give a short delay for Supabase client to parse URL token
        setTimeout(async () => {
          if (!mounted) return;
          const {
            data: { session: retrySession },
          } = await supabase.auth.getSession();
          setHasValidSession(Boolean(retrySession));
        }, 1200);
      }

      return () => {
        subscription.unsubscribe();
      };
    }

    checkRecoverySession();

    return () => {
      mounted = false;
    };
  }, []);

  const validate = (): boolean => {
    const errs: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      errs.newPassword = 'กรุณากำหนดรหัสผ่านใหม่';
    } else if (newPassword.length < 6) {
      errs.newPassword = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'กรุณากรอกรหัสผ่านใหม่อีกครั้ง';
    } else if (confirmPassword !== newPassword) {
      errs.confirmPassword = 'รหัสผ่านทั้งสองช่องไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // If expired, reject submission
    if (isExpired) {
      setServerError('เซสชันนี้หมดอายุแล้ว กรุณาขอลิงก์รีเซ็ตรหัสผ่านใหม่');
      return;
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.updatePassword(newPassword);

      // Successfully updated: expire this session and mark as completed
      setIsSuccess(true);
      setIsExpired(true);
      setExpireReason('completed');

      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem(COMPLETED_KEY, 'true');

      // Invalidate recovery session so it cannot be used again
      if (isSupabaseConfigured) {
        await supabase.auth.signOut().catch(() => {});
      }

      showToast('🎉 ตั้งรหัสผ่านใหม่สำเร็จแล้ว! เซสชันการรีเซ็ตนี้ถูกปิดแล้วเพื่อความปลอดภัย');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'เกิดข้อผิดพลาดในการตั้งรหัสผ่านใหม่ กรุณาลองใหม่อีกครั้ง';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestNewLink = () => {
    // Clear storage keys so fresh link can be started later
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(COMPLETED_KEY);
    navigate('/forgot-password');
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto font-prompt">
      {/* Top Banner Header */}
      <div className="text-center max-w-lg mx-auto mb-8">
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/80 shadow-xs mb-3">
          <Sparkles className="w-4 h-4 text-[#8B1D1D] animate-spin-slow" />
          <span className="text-xs font-bold text-[#8B1D1D] tracking-wide font-kanit">
            ระบบความปลอดภัย TUlonely 🛡️
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-kanit tracking-tight text-[#8B1D1D] leading-tight">
          TU<span className="text-[#F27D26]">lonely</span>
          <span className="inline-block ml-2 text-2xl sm:text-3xl">👀</span>
        </h1>

        <h2 className="mt-2 text-lg sm:text-xl font-bold text-[#2D2D2D] font-kanit">
          ตั้งรหัสผ่านใหม่ (Set New Password)
        </h2>

        <p className="mt-1.5 text-xs sm:text-sm text-[#666] leading-relaxed">
          กำหนดรหัสผ่านใหม่สำหรับเข้าสู่ระบบ TUlonely มหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต
        </p>
      </div>

      {/* Main Glass Card Container */}
      <div className="bg-white/50 hover:bg-white/60 backdrop-blur-xl rounded-3xl border border-white/70 shadow-xl overflow-hidden transition-all duration-300">
        {/* State 1: Success Screen (Once Password Has Been Reset) */}
        {isSuccess ? (
          <div className="p-8 sm:p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-600 mx-auto flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black font-kanit text-[#2D2D2D]">
                ตั้งรหัสผ่านใหม่สำเร็จแล้ว! 🎉
              </h3>
              <p className="text-xs sm:text-sm text-[#555] leading-relaxed max-w-sm mx-auto">
                รหัสผ่านบัญชีของคุณได้รับการอัปเดตเรียบร้อยแล้ว เซสชันการรีเซ็ตนี้ถูกปิดลงทันทีเพื่อความปลอดภัย สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้เลย
              </p>
            </div>

            <div className="bg-[#8B1D1D]/5 border border-[#8B1D1D]/15 rounded-2xl p-3.5 text-xs text-[#8B1D1D]">
              🔒 ลิงก์และหน้านี้หมดอายุการใช้งานแล้ว ไม่สามารถนำกลับมาใช้ซ้ำได้
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem(STORAGE_KEY);
                  sessionStorage.removeItem(COMPLETED_KEY);
                  navigate('/login');
                }}
                className="w-full py-3.5 bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white font-bold text-sm font-kanit rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>เข้าสู่ระบบนักศึกษา 🎓</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : isExpired ? (
          /* State 2: Expired Screen (Either 10 Minutes Elapsed OR Already Completed) */
          <div className="p-8 sm:p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border-2 border-rose-500/20 text-rose-600 mx-auto flex items-center justify-center shadow-md">
              {expireReason === 'completed' ? (
                <CheckCircle2 className="w-9 h-9 text-[#8B1D1D]" />
              ) : (
                <Clock className="w-9 h-9 text-rose-500" />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black font-kanit text-[#2D2D2D]">
                {expireReason === 'completed'
                  ? 'เซสชันนี้หมดอายุแล้ว (รีเซ็ตสำเร็จแล้ว) 🔒'
                  : 'หมดเวลาการตั้งรหัสผ่านใหม่ (10 นาที) ⏱️'}
              </h3>
              <p className="text-xs sm:text-sm text-[#555] leading-relaxed max-w-sm mx-auto">
                {expireReason === 'completed'
                  ? 'คุณได้ทำการตั้งรหัสผ่านใหม่ไปแล้ว หน้านี้จึงหมดอายุลงเพื่อความปลอดภัย กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่'
                  : 'เพื่อความปลอดภัยสูงสุดของบัญชีนักศึกษา มธ. ลิงก์และหน้าตั้งรหัสผ่านจะมีอายุการใช้งานเพียง 10 นาทีเท่านั้น ขณะนี้เวลาได้หมดลงแล้ว กรุณาขอลิงก์ใหม่อีกครั้ง'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <button
                type="button"
                onClick={handleRequestNewLink}
                className="flex-1 py-3 px-4 bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white font-bold text-xs font-kanit rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ขอลิงก์รีเซ็ตรหัสผ่านใหม่</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem(STORAGE_KEY);
                  sessionStorage.removeItem(COMPLETED_KEY);
                  navigate('/login');
                }}
                className="py-3 px-4 bg-white/70 hover:bg-white text-[#555] hover:text-[#2D2D2D] font-bold text-xs font-kanit rounded-2xl border border-white/90 shadow-2xs transition-all cursor-pointer"
              >
                กลับไปหน้าเข้าสู่ระบบ
              </button>
            </div>
          </div>
        ) : (
          /* State 3: Active Form View (Within 10 Minutes & Not Yet Completed) */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">

            {/* Session Warning if session not detected */}
            {hasValidSession === false && (
              <div className="p-4 bg-amber-50/90 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-amber-800 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                <div className="text-xs leading-relaxed">
                  <p className="font-bold font-kanit text-amber-900">ไม่พบเซสชันการกู้คืนรหัสผ่าน</p>
                  <p className="mt-0.5 text-amber-700">
                    ลิงก์นี้อาจหมดอายุแล้วหรือไม่ถูกต้อง หากเกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน กรุณากดขอลิงก์รีเซ็ตใหม่อีกครั้ง
                  </p>
                  <Link
                    to="/forgot-password"
                    onClick={handleRequestNewLink}
                    className="inline-block mt-2 font-bold text-[#8B1D1D] underline hover:text-[#6D0E1C]"
                  >
                    ขอลิงก์ตั้งรหัสผ่านใหม่ ➔
                  </Link>
                </div>
              </div>
            )}

            {/* Server Error Alert */}
            {serverError && (
              <div className="p-4 bg-rose-50/90 border border-rose-200/80 rounded-2xl flex items-start gap-2.5 text-rose-700 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
                <div className="text-xs">
                  <p className="font-bold font-kanit text-rose-800">ตั้งรหัสผ่านไม่สำเร็จ</p>
                  <p className="mt-0.5 leading-relaxed text-rose-700">{serverError}</p>
                </div>
              </div>
            )}

            {/* Field 1: New Password */}
            <div>
              <label className="block text-xs font-bold text-[#333] mb-1.5 font-kanit">
                รหัสผ่านใหม่ (New Password) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (validationErrors.newPassword) {
                      setValidationErrors((prev) => ({ ...prev, newPassword: undefined }));
                    }
                  }}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  className={`w-full bg-white/70 backdrop-blur-xs border rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#2D2D2D] placeholder:text-[#999] focus:outline-none focus:bg-white focus:ring-2 shadow-2xs transition-colors ${
                    validationErrors.newPassword
                      ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400'
                      : 'border-white/90 focus:ring-[#8B1D1D]'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#333] p-1 cursor-pointer"
                  title={showNewPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {validationErrors.newPassword && (
                <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{validationErrors.newPassword}</span>
                </p>
              )}
            </div>

            {/* Field 2: Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-[#333] mb-1.5 font-kanit">
                ยืนยันรหัสผ่านใหม่อีกครั้ง (Confirm Password) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (validationErrors.confirmPassword) {
                      setValidationErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }
                  }}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้งให้ตรงกัน"
                  className={`w-full bg-white/70 backdrop-blur-xs border rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#2D2D2D] placeholder:text-[#999] focus:outline-none focus:bg-white focus:ring-2 shadow-2xs transition-colors ${
                    validationErrors.confirmPassword
                      ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400'
                      : 'border-white/90 focus:ring-[#8B1D1D]'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#333] p-1 cursor-pointer"
                  title={showConfirmPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{validationErrors.confirmPassword}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isExpired}
                className="w-full py-3.5 bg-[#8B1D1D] hover:bg-[#6D0E1C] disabled:bg-[#8B1D1D]/70 disabled:cursor-not-allowed text-white font-bold text-sm font-kanit rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>กำลังบันทึกรหัสผ่านใหม่... ⏳</span>
                  </>
                ) : (
                  <>
                    <span>บันทึกรหัสผ่านใหม่ 🔐</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Back to Login Link */}
            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-[#666] hover:text-[#8B1D1D] font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>กลับสู่หน้าเข้าสู่ระบบ</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default ResetPasswordView;
