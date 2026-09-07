import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, X, Loader2 } from 'lucide-react';

export const ReportModal: React.FC = () => {
  const { isReportModalOpen, setIsReportModalOpen, reportTarget, submitReport } = useApp();
  const [reason, setReason] = useState<'spam' | 'harassment' | 'inappropriate' | 'fake' | 'other'>('spam');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      submitReport({
        ...reportTarget,
        reason,
        details,
      });
      setIsReportModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasonOptions: Array<{ id: typeof reason; label: string; desc: string }> = [
    { id: 'spam', label: 'สแปม / โฆษณาพาณิชย์', desc: 'เนื้อหาโฆษณา ขายของ หรือข้อความซ้ำซ้อน' },
    { id: 'harassment', label: 'การคุกคาม / ความรุนแรง', desc: 'การกลั่นแกล้ง ใช้คำหยาบคาย หรือพฤติกรรมไม่เหมาะสม' },
    { id: 'inappropriate', label: 'เนื้อหาไม่เหมาะสม / ลามกอนาจาร', desc: 'ขัดต่อกฎระเบียบของมหาวิทยาลัยธรรมศาสตร์' },
    { id: 'fake', label: 'ข้อมูลเท็จ / ปลอมแปลงตัวตน', desc: 'แอบอ้างเป็นบุคคลอื่น หรือข้อมูลกิจกรรมเท็จ' },
    { id: 'other', label: 'เหตุผลอื่น ๆ', desc: 'ระบุเพิ่มเติมในช่องรายละเอียด' },
  ];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          setIsReportModalOpen(false);
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
    >
      <div className="relative w-full max-w-lg bg-[#FDFBF7]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header - Frosted Gradient */}
        <div className="bg-gradient-to-r from-[#8B1D1D] to-[#6D0E1C] text-white px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-300" />
            <h3 className="font-bold text-base font-kanit">รายงานความไม่เหมาะสม</h3>
          </div>
          <button
            type="button"
            onClick={() => !isSubmitting && setIsReportModalOpen(false)}
            disabled={isSubmitting}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-white/60 backdrop-blur-xs p-3.5 rounded-2xl border border-white/80 text-xs shadow-2xs">
            <p className="text-[#777]">เป้าหมายที่รายงาน:</p>
            <p className="font-bold text-[#2D2D2D] mt-0.5">{reportTarget.targetTitle}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D2D2D] mb-2">
              เลือกเหตุผลในการรายงาน <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-1.5">
              {reasonOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                    reason === opt.id
                      ? 'border-[#8B1D1D] bg-[#8B1D1D]/10 font-semibold text-[#8B1D1D]'
                      : 'border-white/80 bg-white/50 text-[#444] hover:bg-white/80'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={opt.id}
                    disabled={isSubmitting}
                    checked={reason === opt.id}
                    onChange={() => setReason(opt.id)}
                    className="mt-0.5 accent-[#8B1D1D]"
                  />
                  <div className="text-xs">
                    <p className="font-bold">{opt.label}</p>
                    <p className="text-[10px] text-[#666]">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D2D2D] mb-1">
              รายละเอียดเพิ่มเติม (ถ้ามี)
            </label>
            <textarea
              rows={2}
              value={details}
              disabled={isSubmitting}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="ระบุเหตุการณ์หรือหลักฐานเพื่อช่วยให้ทีมงานตรวจสอบได้รวดเร็วขึ้น"
              className="w-full bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl px-3 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsReportModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#555] hover:bg-white/60 rounded-xl cursor-pointer disabled:opacity-50"
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
                <span>ส่งรายงาน (Submit Report)</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
