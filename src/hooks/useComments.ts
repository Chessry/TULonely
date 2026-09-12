import { useState, useEffect, useCallback } from 'react';
import { commentService, CommentItem, InsertCommentParams } from '../services/commentService';
import { supabase } from '../services/supabaseClient';

export interface UseCommentsOptions {
  boardId: number | string;
  newestFirst?: boolean;
  autoSubscribeRealtime?: boolean;
}

/**
 * Custom Hook สำหรับระบบคอมเมนต์บนกระดาน (Board Comments)
 * จัดการทั้ง Fetch, Grouping, Insert/Reply, และ Realtime Subscription
 */
export const useComments = ({
  boardId,
  newestFirst = true,
  autoSubscribeRealtime = true,
}: UseCommentsOptions) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch & Render: ฟังก์ชันดึงคอมเมนต์ทั้งหมดตาม board_id และจัดกลุ่ม
  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await commentService.getCommentsByBoardId(boardId, { newestFirst });
      setComments(items);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดคอมเมนต์';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [boardId, newestFirst]);

  // โหลดคอมเมนต์เมื่อ boardId เปลี่ยน
  useEffect(() => {
    if (boardId) {
      fetchComments();
    }
  }, [boardId, fetchComments]);

  // 2. Realtime Subscription: ฟังการเพิ่ม/ลบข้อความบน Supabase แบบอัตโนมัติ
  useEffect(() => {
    if (!autoSubscribeRealtime || !boardId) return;

    const channelName = `comments_board_${boardId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
        },
        () => {
          // ดึงข้อมูลและจัดกลุ่มใหม่อัตโนมัติเมื่อมี comment ใหม่หรือการเปลี่ยนแปลง
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId, autoSubscribeRealtime, fetchComments]);

  // 3. Insert / Save: ฟังก์ชันส่งข้อความใหม่ (รองรับทั้งสร้างใหม่ และ Reply)
  const addComment = async (content: string, parentId?: number | null) => {
    if (!content.trim()) return null;

    setIsSubmitting(true);
    try {
      const params: InsertCommentParams = {
        boardId,
        content: content.trim(),
        parentId: parentId ?? null,
      };

      const newRow = await commentService.createComment(params);

      // รีเฟรชรายการคอมเมนต์เพื่อให้ได้โครงสร้างจัดกลุ่ม Tree ที่สมบูรณ์
      await fetchComments();
      return newRow;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถส่งคอมเมนต์ได้';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Delete: ลบคอมเมนต์
  const removeComment = async (commentId: number) => {
    try {
      const success = await commentService.deleteComment(commentId);
      if (success) {
        await fetchComments();
      }
      return success;
    } catch (err) {
      console.error('[useComments] removeComment error:', err);
      return false;
    }
  };

  return {
    comments,
    isLoading,
    isSubmitting,
    error,
    addComment,
    removeComment,
    refreshComments: fetchComments,
  };
};

export default useComments;
