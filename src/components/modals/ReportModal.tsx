import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, X, Loader2, User, Flag, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReasonOption {
  id: string;
  label: string;
  desc: string;
}

const BOARD_REASONS: ReasonOption[] = [
  { id: 'spam', label: 'สแปม / โฆษณาพาณิชย์', desc: 'ขายของ, โฆษณาเว็บพนัน, หรือชวนทำงานออนไลน์' },
  { id: 'fake_info', label: 'ข้อมูลเท็จ / นัดหมายหลอกลวง', desc: 'กิจกรรมไม่มีอยู่จริง หรือข้อมูลสถานที่/เวลานัดหมายเป็นเท็จ' },
  { id: 'against_rules', label: 'ขัดต่อกฎระเบียบ มธ.', desc: 'ชวนดื่มแอลกอฮอล์ เล่นการพนัน หรือสิ่งผิดกฎหมายในมหาวิทยาลัย' },
  { id: 'inappropriate', label: 'เนื้อหาไม่เหมาะสม / ลามกอนาจาร', desc: 'ใช้คำหยาบคาย ส่อไปในทางเพศ หรือรุนแรง' },
  { id: 'other', label: 'เหตุผลอื่น ๆ', desc: 'ระบุเพิ่มเติมในช่องรายละเอียด' },
];

const USER_REASONS: ReasonOption[] = [
  { id: 'impersonation', label: 'แอบอ้างตัวตน / ข้อมูลนักศึกษาปลอม', desc: 'ไม่ใช่นักศึกษา มธ. ตัวจริง หรือแอบอ้างรูปภาพ/รหัสนักศึกษาของผู้อื่น' },
  { id: 'harassment', label: 'พฤติกรรมคุกคาม / ล่วงละเมิด', desc: 'ส่งข้อความก่อกวน ข่มขู่ คุกคามทางเพศทั้งในแชทและสถานที่จริง' },
  { id: 'scam', label: 'มิจฉาชีพ / หลอกลวงทรัพย์สิน', desc: 'ชวนแชร์ค่าใช้จ่ายแล้วชิ่ง, ขอยืมเงิน หรือหลอกลวงผลประโยชน์' },
  { id: 'no_show', label: 'เบี้ยวนัด / ไม่มาตามนัดหมาย', desc: 'ยืนยันเข้าร่วมกิจกรรมแล้วไม่มาตามที่ตกลงโดยไม่มีเหตุผล' },
  { id: 'other', label: 'เหตุผลอื่น ๆ', desc: 'ระบุพฤติกรรมเพิ่มเติมในช่องรายละเอียด' },
];

const MESSAGE_REASONS: ReasonOption[] = [
  { id: 'harassment', label: 'ข้อความคุกคาม / คำหยาบคาย', desc: 'การกลั่นแกล้ง ใช้คำหยาบ หรือแสดงพฤติกรรมก้าวร้าว' },
  { id: 'spam', label: 'สแปม / โฆษณาซ้ำซ้อน', desc: 'ส่งข้อความขายของ โฆษณา หรือฟลัดข้อความรบกวน' },
  { id: 'inappropriate', label: 'เนื้อหาไม่เหมาะสม / อนาจาร', desc: 'ข้อความลามก หรือขัดต่อศีลธรรมอันดี' },
  { id: 'other', label: 'เหตุผลอื่น ๆ', desc: 'ระบุเพิ่มเติมในช่องรายละเอียด' },
];

export const ReportModal: React.FC = () => {
  const { isReportModalOpen, setIsReportModalOpen, reportTarget, submitReport } = useApp();
  const [reason, setReason] = useState<string>('spam');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isUserReport = reportTarget?.targetType === 'user';
  const isMessageReport = reportTarget?.targetType === 'message';
  const isBoardReport = reportTarget?.targetType === 'room' || reportTarget?.targetType === 'board' || reportTarget?.targetType === 'activity';

  const reasonOptions: ReasonOption[] = isUserReport
    ? USER_REASONS
    : isMessageReport
    ? MESSAGE_REASONS
    : BOARD_REASONS;

  // Reset default reason when target changes
  useEffect(() => {
    if (reportTarget) {
      if (reportTarget.targetType === 'user') {
        setReason(USER_REASONS[0].id);
      } else if (reportTarget.targetType === 'message') {
        setReason(MESSAGE_REASONS[0].id);
      } else {
        setReason(BOARD_REASONS[0].id);
      }
      setDetails('');
      setErrorMsg(null);
    }
  }, [reportTarget]);

  // Close on Escape key
  useEffect(() => {
    if (!isReportModalOpen) {
      setIsSubmitting(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        setIsReportModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReportModalOpen, isSubmitting, setIsReportModalOpen]);

  if (!isReportModalOpen || !reportTarget) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (reason === 'other' && (!details.trim() || details.trim().length < 5)) {
      setErrorMsg('กรุณากรอกรายละเอียดเหตุผลอย่างน้อย 5 ตัวอักษร เพื่อให้ทีมงานตรวจสอบได้');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      submitReport({
        ...reportTarget,
        reason,
        details: details.trim(),
      });
      setIsReportModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          setIsReportModalOpen(false);
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg bg-[#FDFBF7]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header - Frosted Gradient */}
        <div className="bg-gradient-to-r from-[#8B1D1D] to-[#6D0E1C] text-white px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-rose-300 border border-white/20">
              {isUserReport ? (
                <User className="w-4 h-4" />
              ) : isMessageReport ? (
                <MessageSquare className="w-4 h-4" />
              ) : (
                <Flag className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base font-kanit">
                {isUserReport
                  ? 'รายงานผู้ใช้งาน (Report User)'
                  : isMessageReport
                  ? 'รายงานความคิดเห็น (Report Comment)'
                  : 'รายงานบอร์ดหาเพื่อน (Report Board)'}
              </h3>
              <p className="text-[11px] text-white/80 font-normal">
                {isUserReport
                  ? 'ช่วยดูแลความปลอดภัยของเพื่อนนักศึกษา มธ.'
                  : 'แจ้งตรวจสอบเนื้อหาที่ไม่เหมาะสมหรือขัดต่อกฎระเบียบ'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !isSubmitting && setIsReportModalOpen(false)}
            disabled={isSubmitting}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target preview card */}
          <div className="bg-white/60 backdrop-blur-xs p-3.5 rounded-2xl border border-white/80 shadow-2xs flex items-center gap-3">
            {reportTarget.targetAvatar ? (
              <img
                src={reportTarget.targetAvatar}
                alt={reportTarget.targetTitle}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-[#8B1D1D]/10 text-[#8B1D1D] flex items-center justify-center font-bold text-xs shrink-0">
                {isUserReport ? '👤' : isMessageReport ? '💬' : '📌'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-[#8B1D1D] uppercase tracking-wider">
                {isUserReport ? 'ผู้ใช้ที่ถูกรายงาน' : isMessageReport ? 'ข้อความที่ถูกรายงาน' : 'บอร์ดที่ถูกรายงาน'}
              </span>
              <p className="font-bold text-xs text-[#2D2D2D] truncate mt-0.5">
                {reportTarget.targetTitle}
              </p>
              {reportTarget.targetSubtitle && (
                <p className="text-[11px] text-[#666] truncate">{reportTarget.targetSubtitle}</p>
              )}
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-xs font-bold text-[#2D2D2D] mb-2">
              เลือกเหตุผลในการรายงาน <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {reasonOptions.map((opt) => {
                const isSelected = reason === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#8B1D1D] bg-[#8B1D1D]/10 font-semibold text-[#8B1D1D] shadow-2xs'
                        : 'border-white/80 bg-white/50 text-[#444] hover:bg-white/80'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={opt.id}
                      disabled={isSubmitting}
                      checked={isSelected}
                      onChange={() => setReason(opt.id)}
                      className="mt-0.5 accent-[#8B1D1D]"
                    />
                    <div className="text-xs min-w-0 flex-1">
                      <p className="font-bold leading-tight">{opt.label}</p>
                      <p className="text-[10px] text-[#666] mt-0.5 leading-tight">{opt.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Details input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#2D2D2D]">
                คำอธิบายเพิ่มเติม {reason === 'other' ? <span className="text-rose-500">*</span> : <span className="text-[#888] font-normal">(ถ้ามี)</span>}
              </label>
              <span className="text-[10px] text-[#888]">{details.length}/300 ตัวอักษร</span>
            </div>
            <textarea
              rows={2}
              maxLength={300}
              value={details}
              disabled={isSubmitting}
              onChange={(e) => {
                setDetails(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder={
                isUserReport
                  ? 'ระบุพฤติกรรมที่ไม่เหมาะสม วันที่เกิดเหตุ หรือเหตุผลเพื่อให้ทีมงานตรวจสอบ'
                  : 'ระบุเหตุการณ์หรือหลักฐานเพื่อช่วยให้ทีมงานตรวจสอบได้รวดเร็วขึ้น'
              }
              className="w-full bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl px-3 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] placeholder:text-stone-400"
            />
            {errorMsg && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-2.5 text-[10px] text-amber-900 flex items-start gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-tight">
              การรายงานจะถูกส่งไปยังทีมผู้ดูแลระบบอย่างเป็นความลับ ผู้ถูกรายงานจะไม่ทราบว่าใครเป็นผู้รายงาน ข้อมูลทั้งหมดจะใช้เพื่อความปลอดภัยในคอมมูนิตี้ มธ. เท่านั้น
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsReportModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#555] hover:bg-white/60 rounded-xl cursor-pointer disabled:opacity-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#8B1D1D] hover:bg-[#6D0E1C] disabled:opacity-75 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังส่งรายงาน...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ส่งรายงาน (Submit Report)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
