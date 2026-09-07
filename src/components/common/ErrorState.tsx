import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
  message = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์หรือดึงข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
  onRetry,
  isRetrying = false,
  className = '',
}) => {
  return (
    <div
      className={`bg-white/55 backdrop-blur-xl rounded-3xl p-8 sm:p-12 text-center border border-rose-200/80 shadow-lg space-y-4 max-w-xl mx-auto my-6 ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg sm:text-xl font-bold text-[#2D2D2D] font-kanit">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[#666] leading-relaxed max-w-md mx-auto">
          {message}
        </p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#8B1D1D] hover:bg-[#6D0E1C] active:scale-95 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'กำลังโหลดใหม่...' : 'ลองใหม่อีกครั้ง (Retry)'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
