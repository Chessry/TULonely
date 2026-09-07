import React, { useState, useRef, useEffect } from 'react';
import { Room } from '../../types';
import { useApp } from '../../context/AppContext';
import { Send, Smile, ShieldAlert, MessageCircle } from 'lucide-react';

interface GroupChatProps {
  room: Room;
}

const QUICK_STICKERS = ['🎉 Let\'s go!', '👋 สวัสดีครับ', '🍽️ หิวแล้ววว', '👍 โอเคครับ', '🚗 กำลังไป', '✨ เจอกันครับ!'];

export const GroupChat: React.FC<GroupChatProps> = ({ room }) => {
  const { currentUser, isLoggedIn, setIsAuthModalOpen, sendChatMessage, setReportTarget, setIsReportModalOpen } = useApp();
  const [inputText, setInputText] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isMember = room.participants.some((p) => p.id === currentUser.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [room.chatMessages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    sendChatMessage(room.id, inputText);
    setInputText('');
  };

  const handleSendSticker = (stickerText: string) => {
    sendChatMessage(room.id, stickerText);
    setShowStickers(false);
  };

  return (
    <div className="bg-white/55 backdrop-blur-xl rounded-3xl border border-white/80 overflow-hidden flex flex-col h-[520px] shadow-xl">
      {/* Chat Header - Frosted */}
      <div className="bg-white/60 backdrop-blur-md px-5 py-3.5 border-b border-white/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#8B1D1D]/10 text-[#8B1D1D] flex items-center justify-center border border-[#8B1D1D]/20">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#2D2D2D] font-kanit">
              ห้องแชทกลุ่ม ({room.participants.length} คน)
            </h4>
            <p className="text-[10px] text-[#666]">
              {isMember ? 'คุณเป็นสมาชิกในห้องนี้ พูดคุยได้เลย' : 'ต้องเข้าร่วมห้องก่อนเพื่อส่งข้อความ'}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50/80 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          ออนไลน์
        </span>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-white/30 backdrop-blur-xs">
        {room.chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#777]">
            <span className="text-3xl mb-2">💬</span>
            <p className="text-xs font-bold text-[#333]">ยังไม่มีข้อความในห้องนี้</p>
            <p className="text-[11px]">พิมพ์ทักทายเพื่อนๆ เป็นคนแรกได้เลย!</p>
          </div>
        ) : (
          room.chatMessages.map((msg) => {
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-medium bg-white/70 text-[#555] border border-white/80 shadow-2xs">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isMine = msg.senderId === currentUser.id;

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 group ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                {!isMine && (
                  <img
                    src={msg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={msg.senderName}
                    className="w-7 h-7 rounded-full object-cover border border-white shadow-2xs"
                  />
                )}

                <div className={`max-w-[78%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  {!isMine && (
                    <span className="text-[10px] font-bold text-[#666] mb-0.5 pl-1">
                      {msg.senderName}
                    </span>
                  )}

                  <div className="relative group/bubble flex items-center gap-1">
                    {!isMine && (
                      <button
                        onClick={() => {
                          setReportTarget({
                            targetType: 'message',
                            targetId: msg.id,
                            targetTitle: `ข้อความจาก ${msg.senderName}: "${msg.text}"`,
                            reason: 'harassment',
                            details: '',
                          });
                          setIsReportModalOpen(true);
                        }}
                        className="opacity-0 group-hover/bubble:opacity-100 p-1 text-[#888] hover:text-rose-500 transition-opacity cursor-pointer"
                        title="รายงานข้อความนี้"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div
                      className={`px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                        isMine
                          ? 'bg-[#8B1D1D] text-white rounded-br-xs shadow-md'
                          : 'bg-white/80 backdrop-blur-xs text-[#2D2D2D] rounded-bl-xs border border-white/90 shadow-sm'
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                  </div>

                  <span className="text-[9px] text-[#888] mt-0.5 px-1">{msg.timestamp}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Stickers Popup */}
      {showStickers && isMember && (
        <div className="p-2.5 bg-white/70 backdrop-blur-md border-t border-white/60 flex items-center gap-1.5 flex-wrap">
          {QUICK_STICKERS.map((stk, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendSticker(stk)}
              className="text-xs px-3 py-1 rounded-full bg-white/80 hover:bg-[#8B1D1D] hover:text-white text-[#444] border border-white/90 shadow-2xs transition-all cursor-pointer"
            >
              {stk}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="p-3 bg-white/60 backdrop-blur-md border-t border-white/60">
        {isMember ? (
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowStickers(!showStickers)}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                showStickers ? 'bg-amber-100 text-amber-800' : 'text-[#666] hover:bg-white/60'
              }`}
              title="สติ๊กเกอร์ & ข้อความด่วน"
            >
              <Smile className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="พูดคุยกับเพื่อนในห้อง..."
              className="flex-1 bg-white/70 backdrop-blur-sm border border-white/90 rounded-full px-4 py-2 text-xs text-[#2D2D2D] placeholder:text-[#888] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B1D1D]"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-full bg-[#8B1D1D] disabled:bg-stone-300 text-white shadow-md transition-transform active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              title="ส่งข้อความ"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : !isLoggedIn ? (
          <div className="flex items-center justify-between gap-3 py-1">
            <p className="text-xs text-[#666]">
              🔒 ต้องลงทะเบียนหรือ Login ก่อนเพื่อแชท
            </p>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1 bg-[#8B1D1D] hover:bg-[#6D0E1C] text-white text-xs font-bold rounded-full shadow-xs cursor-pointer"
            >
              ลงทะเบียน / Login ➔
            </button>
          </div>
        ) : (
          <div className="text-center py-1">
            <p className="text-xs text-[#666]">
              💡 กดปุ่ม <span className="font-bold text-[#8B1D1D]">"เข้าร่วมห้องนี้"</span> ด้านบนเพื่อร่วมแชทกับเพื่อน
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
