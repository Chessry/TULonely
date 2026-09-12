import React, { useState, useRef } from 'react';
import { Room, ChatMessage } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Send,
  ShieldAlert,
  MessageCircle,
  CornerDownRight,
  X,
  Crown,
  LogIn,
  Trash2,
  Edit3,
  Check,
} from 'lucide-react';

interface BoardCommentsProps {
  room: Room;
}

export const BoardComments: React.FC<BoardCommentsProps> = ({ room }) => {
  const {
    currentUser,
    isLoggedIn,
    setIsAuthModalOpen,
    sendChatMessage,
    deleteChatMessage,
    editChatMessage,
    setReportTarget,
    setIsReportModalOpen,
    showToast,
    realtimeStatus,
  } = useApp();

  const [commentText, setCommentText] = useState('');
  // State remembering reply target: numeric commentId for parent_id in Supabase, messageId for UI key, name for mention display
  const [replyingTo, setReplyingTo] = useState<{
    commentId: number | null;
    messageId: string;
    name: string;
  } | null>(null);

  // Edit state (author only)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('คุณต้องการลบความคิดเห็นนี้ใช่หรือไม่?')) {
      deleteChatMessage(room.id, commentId);
    }
  };

  /**
   * Helper to extract numeric commentId (int8) from ChatMessage
   */
  const getNumericCommentId = (msg: ChatMessage): number | null => {
    // 1. Direct commentId
    if (typeof msg.commentId === 'number' && msg.commentId > 0) {
      return msg.commentId;
    }
    // 2. Parse from 'comment-11' or '11'
    const match = msg.id.replace(/^comment-/, '');
    const parsed = Number(match);
    if (!isNaN(parsed) && parsed > 0 && !msg.id.startsWith('msg-')) {
      return parsed;
    }
    // 3. Fallback: match by content and sender from allComments that have real IDs
    const matched = allComments.find(
      (c) =>
        (typeof c.commentId === 'number' || (!c.id.startsWith('msg-') && !isNaN(Number(c.id.replace(/^comment-/, ''))))) &&
        c.text.trim() === msg.text.trim() &&
        c.senderId === msg.senderId
    );
    if (matched) {
      if (typeof matched.commentId === 'number' && matched.commentId > 0) {
        return matched.commentId;
      }
      const p = Number(matched.id.replace(/^comment-/, ''));
      if (!isNaN(p) && p > 0) return p;
    }
    return null;
  };

  /**
   * Start replying to any comment (top-level comment or nested reply)
   * Stores the ID of the exact comment being replied to in parent_id
   */
  const handleStartReply = (target: ChatMessage) => {
    const parentIdNum = getNumericCommentId(target);

    setReplyingTo({
      commentId: parentIdNum,
      messageId: target.id,
      name: target.senderName,
    });
    inputRef.current?.focus();
  };

  /**
   * Submit comment or reply
   * Reliably sends parent_id (null for root comment, int8 id for reply)
   * Clears replyingTo state immediately after submit
   */
  const handleSendComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentText.trim()) return;

    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      showToast('กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น 💬');
      return;
    }

    const currentReply = replyingTo;
    const textToSend = commentText.trim();

    // 1. Clear input and reply state immediately
    setCommentText('');
    setReplyingTo(null);

    // 2. Submit to Supabase & local state
    try {
      await sendChatMessage(
        room.id,
        textToSend,
        undefined,
        currentReply
          ? {
              id: currentReply.messageId,
              name: currentReply.name,
              parentId: currentReply.commentId,
            }
          : undefined
      );
    } catch (err) {
      console.error('[BoardComments] sendComment error:', err);
      showToast('เกิดข้อผิดพลาดในการส่งความคิดเห็น');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  // Edit actions
  const handleStartEdit = (comment: ChatMessage) => {
    setEditingCommentId(comment.id);
    setEditText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText('');
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editText.trim()) return;
    setIsSavingEdit(true);
    try {
      await editChatMessage(room.id, commentId, editText.trim());
      setEditingCommentId(null);
      setEditText('');
      showToast('แก้ไขความคิดเห็นเรียบร้อยแล้ว ✨');
    } catch (err) {
      console.error('[BoardComments] Save edit error:', err);
      showToast('เกิดข้อผิดพลาดในการบันทึกการแก้ไข');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const allComments = room.chatMessages || [];
  const hostId = room.creator.id;

  // Helper to extract timestamp for ordering
  const getCommentTime = (c: ChatMessage): number => {
    const match = c.id.match(/\d+/);
    return match ? Number(match[0]) : 0;
  };

  // Helper to find the root top-level comment for any comment or nested reply
  const findRootParentKey = (c: ChatMessage): string | null => {
    const visited = new Set<string>();
    let curr: ChatMessage = c;

    while (curr) {
      const parentNum = curr.parentId;
      const replyId = curr.replyToId;

      if (!parentNum && !replyId) {
        return curr !== c ? curr.id : null;
      }

      const parent = allComments.find((p) => {
        if (p.id === curr.id) return false;
        if (parentNum && (p.commentId === parentNum || p.id === `comment-${parentNum}` || p.id === String(parentNum))) {
          return true;
        }
        if (replyId && (p.id === replyId || (p.commentId && `comment-${p.commentId}` === replyId))) {
          return true;
        }
        return false;
      });

      if (!parent) {
        return curr !== c ? curr.id : null;
      }

      if (visited.has(parent.id)) {
        return parent.id;
      }
      visited.add(parent.id);
      curr = parent;
    }

    return null;
  };

  // Group replies under their parent comments
  const repliesMap = new Map<string, ChatMessage[]>();
  const topLevelComments: ChatMessage[] = [];

  allComments.forEach((c) => {
    const rootKey = findRootParentKey(c);
    if (rootKey) {
      const existing = repliesMap.get(rootKey) || [];
      existing.push(c);
      repliesMap.set(rootKey, existing);
    } else {
      topLevelComments.push(c);
    }
  });

  // Sort top-level comments: Newest on top, Oldest on bottom
  topLevelComments.sort((a, b) => getCommentTime(b) - getCommentTime(a));

  return (
    <div className="bg-white/55 backdrop-blur-xl rounded-3xl border border-white/80 overflow-hidden flex flex-col shadow-xl min-h-[600px]">
      {/* Header - Cleaned with 'Talky' title */}
      <div className="bg-white/70 backdrop-blur-md px-6 py-4 border-b border-white/70 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#8B1D1D]/10 text-[#8B1D1D] flex items-center justify-center border border-[#8B1D1D]/20 shadow-inner">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-[#2D2D2D] font-kanit">
              Talky
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#8B1D1D]/10 text-[#8B1D1D] border border-[#8B1D1D]/20">
              {allComments.length}
            </span>
          </div>
        </div>

        {/* Live Realtime Online Status Indicator */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold shadow-2xs transition-colors ${
            realtimeStatus === 'CONNECTED'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700'
              : realtimeStatus === 'CONNECTING'
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-700'
              : 'bg-stone-500/10 border-stone-500/20 text-stone-600'
          }`}
          title={
            realtimeStatus === 'CONNECTED'
              ? 'เชื่อมต่อระบบ Realtime สมบูรณ์พร้อมสนทนา'
              : realtimeStatus === 'CONNECTING'
              ? 'กำลังเชื่อมต่อ Realtime...'
              : 'ออฟไลน์ (ใช้งานระบบซิงค์ภายในเครื่อง)'
          }
        >
          <span
            className={`w-2 h-2 rounded-full ${
              realtimeStatus === 'CONNECTED'
                ? 'bg-emerald-500 animate-pulse'
                : realtimeStatus === 'CONNECTING'
                ? 'bg-amber-500 animate-ping'
                : 'bg-stone-400'
            }`}
          />
          <span>
            {realtimeStatus === 'CONNECTED'
              ? 'ออนไลน์แบบ Realtime'
              : realtimeStatus === 'CONNECTING'
              ? 'กำลังเชื่อมต่อ...'
              : 'ออฟไลน์ (Local)'}
          </span>
        </div>
      </div>

      {/* Top Comment Composer */}
      <div className="p-4 sm:p-5 bg-white/40 backdrop-blur-md border-b border-white/70 space-y-3">
        {isLoggedIn ? (
          <form onSubmit={handleSendComment} className="space-y-2.5">
            {/* Replying indicator banner */}
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
                      : 'เขียนความคิดเห็นหรือถามคำถามเกี่ยวกับบอร์ดนี้...'
                  }
                  className="w-full bg-white/80 backdrop-blur-xs border border-white/90 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#2D2D2D] placeholder:text-[#888] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] transition-all resize-none shadow-inner"
                />
              </div>
            </div>

            {/* Composer toolbar */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-[#8B1D1D] hover:bg-[#6D0E1C] disabled:bg-stone-300 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                <span>โพสต์</span>
              </button>
            </div>
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
                  นักศึกษา มธ. ทุกคนสามารถร่วมพูดคุยได้ทันที
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

      {/* Comments List Feed - Newest Top-Level on Top, Oldest on Bottom */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-white/20 backdrop-blur-xs">
        {topLevelComments.length === 0 ? (
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
          topLevelComments.map((comment) => {
            const isMine = isLoggedIn && currentUser && comment.senderId === currentUser.id;
            const isHost = comment.senderId === hostId;
            const replies = (repliesMap.get(comment.id) || []).sort(
              (a, b) => getCommentTime(a) - getCommentTime(b)
            );

            return (
              <div
                key={comment.id}
                className={`p-4 rounded-2xl border transition-all duration-150 space-y-3 ${
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

                  {/* Top Right Actions: Edit & Delete (author only) or Report (others) */}
                  <div className="flex items-center gap-1">
                    {isMine ? (
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(comment)}
                          className="p-1 text-stone-400 hover:text-amber-700 transition-colors cursor-pointer rounded-lg hover:bg-amber-50"
                          title="แก้ไขความคิดเห็นของคุณ"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer rounded-lg hover:bg-rose-50"
                          title="ลบความคิดเห็นของคุณ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
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
                    )}
                  </div>
                </div>

                {/* Comment Text / Inline Edit Mode */}
                {editingCommentId === comment.id ? (
                  <div className="space-y-2 mt-1 animate-in fade-in duration-150">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-[#8B1D1D]/30 focus:border-[#8B1D1D] rounded-xl p-2.5 text-xs sm:text-sm text-[#2D2D2D] focus:outline-none focus:ring-1 focus:ring-[#8B1D1D] resize-none shadow-inner"
                      placeholder="แก้ไขความคิดเห็นของคุณ..."
                      autoFocus
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isSavingEdit}
                        className="px-3 py-1 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(comment.id)}
                        disabled={!editText.trim() || isSavingEdit}
                        className="px-4 py-1 rounded-xl text-xs font-bold bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>{isSavingEdit ? 'กำลังบันทึก...' : 'บันทึก'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm text-[#2D2D2D] leading-relaxed whitespace-pre-line pl-0.5">
                    {comment.text}
                    {comment.isUpdated && (
                      <span className="text-[10px] text-stone-400 font-normal ml-1.5 inline-block">
                        (แก้ไขแล้ว)
                      </span>
                    )}
                  </div>
                )}

                {/* Actions Row (Removed Like button, Edit & Reply only) */}
                <div className="pt-1 flex items-center gap-3 text-xs font-semibold text-[#666]">
                  {isMine && editingCommentId !== comment.id && (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(comment)}
                      className="inline-flex items-center gap-1 text-stone-500 hover:text-amber-700 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/60"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>แก้ไข</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleStartReply(comment)}
                    className="inline-flex items-center gap-1.5 hover:text-[#8B1D1D] text-stone-600 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/60"
                  >
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>ตอบกลับ</span>
                  </button>
                </div>

                {/* Nested Replies Section: Rendered directly INSIDE the parent comment */}
                {replies.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/60 pl-3 sm:pl-4 border-l-2 border-[#8B1D1D]/30 space-y-3">
                    {replies.map((reply) => {
                      const isReplyMine = isLoggedIn && currentUser && reply.senderId === currentUser.id;
                      const isReplyHost = reply.senderId === hostId;

                      return (
                        <div
                          key={reply.id}
                          className="p-3 rounded-xl bg-white/75 backdrop-blur-xs border border-white/90 shadow-2xs space-y-2"
                        >
                          {/* Reply Author */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <img
                                src={
                                  reply.senderAvatar ||
                                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                                }
                                alt={reply.senderName}
                                className="w-6 h-6 rounded-full object-cover border border-white shadow-2xs"
                              />
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-bold text-[#2D2D2D]">
                                    {reply.senderName}
                                  </span>

                                  {isReplyHost && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-200/90 text-amber-900 border border-amber-300">
                                      <Crown className="w-2.5 h-2.5 text-amber-700" />
                                      <span>ผู้สร้างบอร์ด</span>
                                    </span>
                                  )}

                                  {reply.senderFaculty && (
                                    <span className="text-[9px] text-[#777] bg-white/80 px-1.5 py-0.2 rounded-full border border-white/80">
                                      {reply.senderFaculty}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[9px] text-[#888]">{reply.timestamp}</span>
                              </div>
                            </div>

                            {/* Top Right of Reply: Edit & Delete (if mine) or Report (if others) */}
                            <div className="flex items-center gap-1">
                              {isReplyMine ? (
                                <div className="flex items-center gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(reply)}
                                    className="p-1 text-stone-400 hover:text-amber-700 transition-colors cursor-pointer rounded-lg hover:bg-amber-50"
                                    title="แก้ไขการตอบกลับของคุณ"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(reply.id)}
                                    className="p-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer rounded-lg hover:bg-rose-50"
                                    title="ลบการตอบกลับของคุณ"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setReportTarget({
                                      targetType: 'message',
                                      targetId: reply.id,
                                      targetTitle: `การตอบกลับจาก ${reply.senderName}: "${reply.text}"`,
                                      reason: 'harassment',
                                      details: '',
                                    });
                                    setIsReportModalOpen(true);
                                  }}
                                  className="p-1 text-[#999] hover:text-rose-600 transition-colors cursor-pointer rounded-full hover:bg-white/60"
                                  title="รายงานข้อความนี้"
                                >
                                  <ShieldAlert className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Tagged recipient */}
                          {reply.replyToName && (
                            <div className="pl-1">
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#8B1D1D] bg-[#8B1D1D]/5 px-2 py-0.5 rounded-md">
                                <CornerDownRight className="w-2.5 h-2.5" />
                                <span>ตอบกลับ @{reply.replyToName}</span>
                              </span>
                            </div>
                          )}

                          {/* Reply Text / Inline Edit Mode */}
                          {editingCommentId === reply.id ? (
                            <div className="space-y-2 mt-1 animate-in fade-in duration-150">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={2}
                                className="w-full bg-white border border-[#8B1D1D]/30 focus:border-[#8B1D1D] rounded-xl p-2 text-xs text-[#2D2D2D] focus:outline-none focus:ring-1 focus:ring-[#8B1D1D] resize-none shadow-inner"
                                placeholder="แก้ไขข้อความ..."
                                autoFocus
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  disabled={isSavingEdit}
                                  className="px-2.5 py-0.5 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                                >
                                  ยกเลิก
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(reply.id)}
                                  disabled={!editText.trim() || isSavingEdit}
                                  className="px-3 py-0.5 rounded-lg text-xs font-bold bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                                >
                                  <Check className="w-2.5 h-2.5" />
                                  <span>{isSavingEdit ? 'บันทึก...' : 'บันทึก'}</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-[#2D2D2D] leading-relaxed whitespace-pre-line pl-1">
                              {reply.text}
                              {reply.isUpdated && (
                                <span className="text-[10px] text-stone-400 font-normal ml-1 inline-block">
                                  (แก้ไขแล้ว)
                                </span>
                              )}
                            </div>
                          )}

                          {/* Reply Actions (Removed Like button, Edit & Reply only) */}
                          <div className="pt-1 flex items-center gap-2 text-[11px] font-semibold text-[#666]">
                            {isReplyMine && editingCommentId !== reply.id && (
                              <button
                                type="button"
                                onClick={() => handleStartEdit(reply)}
                                className="inline-flex items-center gap-0.5 text-stone-500 hover:text-amber-700 transition-colors cursor-pointer py-0.5 px-1.5 rounded hover:bg-white/60"
                              >
                                <Edit3 className="w-2.5 h-2.5" />
                                <span>แก้ไข</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleStartReply(reply)}
                              className="inline-flex items-center gap-1 hover:text-[#8B1D1D] text-stone-600 transition-colors cursor-pointer py-0.5 px-1.5 rounded hover:bg-white/60"
                            >
                              <CornerDownRight className="w-3 h-3" />
                              <span>ตอบกลับ</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BoardComments;
