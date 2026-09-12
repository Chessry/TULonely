import React, { useState, useRef, useEffect } from 'react';
import { Room, ChatMessage } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Send,
  Smile,
  ShieldAlert,
  MessageCircle,
  Heart,
  CornerDownRight,
  X,
  Crown,
  Sparkles,
  LogIn,
} from 'lucide-react';

interface BoardCommentsProps {
  room: Room;
}

const QUICK_PROMPTS = [
  '👋 สอบถามรายละเอียดหน่อยครับ',
  '📍 นัดเจอกันตรงไหนครับ?',
  '🚗 มีที่จอดรถสะดวกมั้ยครับ?',
  '⏰ เริ่มตรงเวลาเลยมั้ยครับ?',
  '👍 น่าสนใจมากเลยครับ!',
  '✨ เดี๋ยวชวนเพื่อนไปด้วยครับ',
];

export const BoardComments: React.FC<BoardCommentsProps> = ({ room }) => {
  const {
    currentUser,
    isLoggedIn,
    setIsAuthModalOpen,
    sendChatMessage,
    toggleCommentLike,
    setReportTarget,
    setIsReportModalOpen,
    showToast,
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [showQuickPrompts, setShowQuickPrompts] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new comments are added
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room.chatMessages?.length]);

  const handleSendComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentText.trim()) return;

    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      showToast('กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น 💬');
      return;
    }

    sendChatMessage(
      room.id,
      commentText.trim(),
      undefined,
      replyingTo ? { id: replyingTo.id, name: replyingTo.name } : undefined
    );

    setCommentText('');
    setReplyingTo(null);
    setShowQuickPrompts(false);
  };

  const handleSelectQuickPrompt = (prompt: string) => {
    setCommentText(prompt);
    setShowQuickPrompts(false);
    inputRef.current?.focus();
  };

  const handleStartReply = (comment: ChatMessage) => {
    setReplyingTo({ id: comment.id, name: comment.senderName });
    setShowQuickPrompts(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  const commentsList = room.chatMessages || [];
  const hostId = room.creator.id;

  return (
    <div className="bg-white/55 backdrop-blur-xl rounded-3xl border border-white/80 overflow-hidden flex flex-col shadow-xl min-h-[600px]">
      {/* Header - Frosted Glass */}
      <div className="bg-white/70 backdrop-blur-md px-6 py-4 border-b border-white/70 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#8B1D1D]/10 text-[#8B1D1D] flex items-center justify-center border border-[#8B1D1D]/20 shadow-inner">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#2D2D2D] font-kanit">
                ความคิดเห็น & ถาม-ตอบ
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#8B1D1D]/10 text-[#8B1D1D] border border-[#8B1D1D]/20">
                {commentsList.length}
              </span>
            </div>
            <p className="text-[11px] text-[#666]">
              ทุกคนสามารถคอมเมนต์ถาม-ตอบได้ทันที (ไม่จำเป็นต้อง Join ห้อง)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50/90 backdrop-blur-xs px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ถาม-ตอบสด (Realtime)</span>
          </span>
        </div>
      </div>

      {/* Top Comment Composer (Facebook/X style) */}
      <div className="p-4 sm:p-5 bg-white/40 backdrop-blur-md border-b border-white/70 space-y-3">
        {isLoggedIn ? (
          <form onSubmit={handleSendComment} className="space-y-2.5">
            {/* Replying banner indicator if active */}
            {replyingTo && (
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-xs text-amber-900 animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 font-medium">
                  <CornerDownRight className="w-3.5 h-3.5 text-[#8B1D1D]" />
                  <span>
                    กำลังตอบกลับคุณ <strong className="text-[#8B1D1D]">@{replyingTo.name}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="p-1 hover:bg-amber-100 rounded-full text-amber-800 transition-colors cursor-pointer"
                  title="ยกเลิกการตอบกลับ"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-start gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-2xs shrink-0 mt-0.5"
              />

              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder={
                    replyingTo
                      ? `ตอบกลับคุณ @${replyingTo.name}...`
                      : 'เขียนความคิดเห็นหรือถามคำถามเกี่ยวกับบอร์ดนี้... (เช่น เจอกันกี่โมง, มีที่จอดรถมั้ย)'
                  }
                  className="w-full bg-white/80 backdrop-blur-xs border border-white/90 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#2D2D2D] placeholder:text-[#888] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] transition-all resize-none shadow-inner"
                />
              </div>
            </div>

            {/* Composer toolbar */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowQuickPrompts(!showQuickPrompts)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    showQuickPrompts
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-white/70 hover:bg-white text-[#555] border-white/80 shadow-2xs'
                  }`}
                  title="คำถามด่วนที่พบบ่อย"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">คำถามด่วน</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowQuickPrompts(!showQuickPrompts)}
                  className="p-1.5 rounded-xl bg-white/70 hover:bg-white text-[#555] border border-white/80 transition-all cursor-pointer shadow-2xs"
                  title="สติ๊กเกอร์ / อิโมจิ"
                >
                  <Smile className="w-4 h-4 text-amber-500" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#888] hidden sm:inline">กด Enter เพื่อส่ง</span>
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-[#8B1D1D] hover:bg-[#6D0E1C] disabled:bg-stone-300 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>โพสต์</span>
                </button>
              </div>
            </div>

            {/* Quick Prompts Picker */}
            {showQuickPrompts && (
              <div className="p-3 bg-white/85 backdrop-blur-md rounded-2xl border border-white/90 shadow-sm space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <p className="text-[11px] font-bold text-[#8B1D1D]">✨ เลือกคำถามหรือข้อความด่วน:</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectQuickPrompt(prompt)}
                      className="px-3 py-1 rounded-full text-xs bg-white hover:bg-[#8B1D1D] hover:text-white text-[#444] border border-stone-200/80 shadow-2xs transition-all cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        ) : (
          /* Logged out prompt */
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-2xs text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#8B1D1D]/10 text-[#8B1D1D] flex items-center justify-center shrink-0">
                <LogIn className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#2D2D2D]">
                  เข้าสู่ระบบเพื่อพิมพ์ถาม-ตอบหรือแสดงความคิดเห็น
                </p>
                <p className="text-[11px] text-[#666]">
                  นักศึกษา มธ. ทุกคนสามารถร่วมพูดคุยได้ทันทีโดยไม่ต้อง Join ห้อง
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              เข้าสู่ระบบ / ลงทะเบียน ➔
            </button>
          </div>
        )}
      </div>

      {/* Comments List Feed (Facebook / X style) */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-white/20 backdrop-blur-xs">
        {commentsList.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#777] space-y-2">
            <div className="w-14 h-14 rounded-full bg-white/60 flex items-center justify-center text-2xl shadow-inner border border-white/80">
              💬
            </div>
            <h4 className="text-sm font-bold text-[#2D2D2D] font-kanit">
              ยังไม่มีความคิดเห็นในบอร์ดนี้
            </h4>
            <p className="text-xs text-[#666] max-w-sm">
              เป็นคนแรกที่โพสต์ถามคำถาม สอบถามรายละเอียด หรือทักทายผู้สร้างบอร์ดได้เลย!
            </p>
          </div>
        ) : (
          commentsList.map((comment) => {
            const isMine = comment.senderId === currentUser.id;
            const isHost = comment.senderId === hostId;
            const isLiked = comment.likedBy?.includes(currentUser.id) || false;
            const likesCount = comment.likesCount || comment.likedBy?.length || 0;

            return (
              <div
                key={comment.id}
                className={`p-4 rounded-2xl border transition-all duration-150 ${
                  isHost
                    ? 'bg-amber-50/70 border-amber-200/80 shadow-sm'
                    : isMine
                    ? 'bg-white/80 border-[#8B1D1D]/20 shadow-sm'
                    : 'bg-white/65 hover:bg-white/85 border-white/80 shadow-2xs'
                }`}
              >
                {/* Author row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        comment.senderAvatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                      }
                      alt={comment.senderName}
                      className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-2xs"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-[#2D2D2D]">
                          {comment.senderName}
                        </span>

                        {isHost && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-200/90 text-amber-900 border border-amber-300 shadow-2xs">
                            <Crown className="w-3 h-3 text-amber-700" />
                            <span>ผู้สร้างบอร์ด</span>
                          </span>
                        )}

                        {comment.senderFaculty && (
                          <span className="text-[10px] text-[#777] bg-white/70 px-2 py-0.2 rounded-full border border-white/80">
                            {comment.senderFaculty}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-[#888]">{comment.timestamp}</span>
                    </div>
                  </div>

                  {/* Report Button */}
                  <button
                    onClick={() => {
                      setReportTarget({
                        targetType: 'message',
                        targetId: comment.id,
                        targetTitle: `ความคิดเห็นจาก ${comment.senderName}: "${comment.text}"`,
                        reason: 'harassment',
                        details: '',
                      });
                      setIsReportModalOpen(true);
                    }}
                    className="p-1 text-[#999] hover:text-rose-600 transition-colors cursor-pointer rounded-full hover:bg-white/60"
                    title="รายงานความคิดเห็นนี้"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Reply To indicator badge if applicable */}
                {comment.replyToName && (
                  <div className="mt-2 pl-2 border-l-2 border-[#8B1D1D]/40">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B1D1D] bg-[#8B1D1D]/5 px-2 py-0.5 rounded-md">
                      <CornerDownRight className="w-3 h-3" />
                      <span>ตอบกลับ @{comment.replyToName}</span>
                    </span>
                  </div>
                )}

                {/* Comment Text */}
                <div className="mt-2 text-xs sm:text-sm text-[#2D2D2D] leading-relaxed whitespace-pre-line pl-0.5">
                  {comment.text}
                </div>

                {/* Bottom Interactive Actions Bar (Like & Reply) */}
                <div className="mt-3 pt-2 border-t border-white/70 flex items-center gap-4 text-xs font-semibold text-[#666]">
                  {/* Like Button */}
                  <button
                    type="button"
                    onClick={() => toggleCommentLike(room.id, comment.id)}
                    className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/60 ${
                      isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-500'
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`}
                    />
                    <span>{likesCount > 0 ? `${likesCount} ถูกใจ` : 'ถูกใจ'}</span>
                  </button>

                  {/* Reply Button */}
                  <button
                    type="button"
                    onClick={() => handleStartReply(comment)}
                    className="inline-flex items-center gap-1.5 hover:text-[#8B1D1D] transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/60"
                  >
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>ตอบกลับ</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
        <div ref={commentsEndRef} />
      </div>
    </div>
  );
};

export default BoardComments;
