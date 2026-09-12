import { supabase } from './supabaseClient';

/**
 * โครงสร้างข้อมูลตาราง profiles ที่ JOIN มาจาก Supabase
 */
export interface ProfileData {
  id?: string;
  user_id?: string;
  user_name?: string;
  real_name?: string;
  student_id?: string;
  faculty_id?: number;
  bio?: string;
  avatar?: string;
}

/**
 * แถวข้อมูลจากตาราง comments ใน Supabase
 */
export interface CommentRow {
  id: number;
  board_id: number;
  user_id: string;
  parent_id: number | null;
  content: string;
  is_updated: boolean;
  create_at?: string;
  created_at?: string;
  profile?: ProfileData | null;
  profiles?: ProfileData | null;
}

/**
 * โครงสร้างคอมเมนต์พร้อมจัดกลุ่ม replies สำหรับ Render บน Frontend
 */
export interface CommentItem extends CommentRow {
  userName: string;
  displayName: string;
  userAvatar: string;
  formattedTime: string;
  replies: CommentItem[];
}

/**
 * พารามิเตอร์สำหรับฟังก์ชันสร้าง/ตอบกลับคอมเมนต์
 */
export interface InsertCommentParams {
  boardId: number | string;
  userId?: string;
  content: string;
  parentId?: number | null; // null = คอมเมนต์หลัก, มีค่า int8 = คอมเมนต์ตอบกลับ
}

/**
 * Helper แปลง board_id ให้เป็นตัวเลข int8 เสมอ (เช่น 'board-7' -> 7, 7 -> 7)
 */
export const parseBoardId = (boardId: number | string): number => {
  if (typeof boardId === 'number') return boardId;
  const cleaned = boardId.replace(/^board-/, '');
  const parsed = Number(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Helper จัดกลุ่ม Flat Comments ให้เป็นลำดับชั้น Tree (Parent Comments + Nested Replies)
 * - คอมเมนต์หลัก (parent_id = null)
 * - คอมเมนต์ตอบกลับ (parent_id = id ของคอมเมนต์หลัก) อยู่ใน replies[]
 */
export const groupCommentsWithReplies = (
  flatComments: CommentRow[],
  options?: { newestFirst?: boolean }
): CommentItem[] => {
  const commentMap = new Map<number, CommentItem>();
  const topLevelComments: CommentItem[] = [];

  // 1. แปลงแต่ละ row เป็น CommentItem เบื้องต้น
  flatComments.forEach((row) => {
    const prof = row.profile || row.profiles;
    const userName = prof?.user_name || prof?.real_name || 'เพื่อนร่วมมธ.';
    const displayName = prof?.real_name || prof?.user_name || 'นักศึกษา มธ.';
    const timeStr = row.create_at || row.created_at;

    const item: CommentItem = {
      ...row,
      userName,
      displayName,
      userAvatar:
        prof?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      formattedTime: timeStr
        ? new Date(timeStr).toLocaleString('th-TH', {
            dateStyle: 'short',
            timeStyle: 'short',
          })
        : 'เมื่อสักครู่',
      replies: [],
    };

    commentMap.set(row.id, item);
  });

  // 2. จับคู่ parent_id -> replies
  flatComments.forEach((row) => {
    const currentItem = commentMap.get(row.id);
    if (!currentItem) return;

    if (row.parent_id !== null && commentMap.has(row.parent_id)) {
      // จัดเข้ากลุ่มตอบกลับของ parent
      const parentItem = commentMap.get(row.parent_id)!;
      parentItem.replies.push(currentItem);
    } else {
      // คอมเมนต์หลัก
      topLevelComments.push(currentItem);
    }
  });

  // 3. เรียงลำดับตามตัวเลือก (default: บนสุด = ใหม่สุด)
  const newestFirst = options?.newestFirst ?? true;
  topLevelComments.sort((a, b) => {
    const timeA = new Date(a.create_at || a.created_at || 0).getTime() || a.id;
    const timeB = new Date(b.create_at || b.created_at || 0).getTime() || b.id;
    return newestFirst ? timeB - timeA : timeA - timeB;
  });

  // สำหรับการตอบกลับภายในคอมเมนต์หลัก เรียงตามลำดับเวลาเก่าไปใหม่ (บทสนทนาไหลลงตามเวลา)
  topLevelComments.forEach((top) => {
    top.replies.sort((a, b) => {
      const timeA = new Date(a.create_at || a.created_at || 0).getTime() || a.id;
      const timeB = new Date(b.create_at || b.created_at || 0).getTime() || b.id;
      return timeA - timeB;
    });
  });

  return topLevelComments;
};

/**
 * Comment Service สำหรับจัดการระบบคอมเมนต์บน Supabase
 */
export const commentService = {
  /**
   * 1. ดึงคอมเมนต์ทั้งหมดของ Board โดย JOIN ตาราง profile/profiles
   * และจัดกลุ่ม replies พร้อมส่งกลับไปให้หน้า Frontend นำไป Render
   *
   * @param boardId รหัสบอร์ด (รองรับทั้งตัวเลข int8 เช่น 7 หรือสตริง 'board-7')
   * @param options ตัวเลือกการเรียงลำดับ เช่น newestFirst = true
   */
  async getCommentsByBoardId(
    boardId: number | string,
    options?: { newestFirst?: boolean }
  ): Promise<CommentItem[]> {
    const targetBoardId = parseBoardId(boardId);
    if (!targetBoardId) {
      console.warn('[commentService] Invalid boardId provided:', boardId);
      return [];
    }

    try {
      // ดึงข้อมูลคอมเมนต์ทั้งหมดของบอร์ด พร้อม JOIN เอาข้อมูลโปรไฟล์ (user_name, real_name, student_id)
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          board_id,
          user_id,
          parent_id,
          content,
          is_updated,
          created_at,
          profile (
            id,
            user_name,
            real_name,
            student_id,
            faculty_id,
            bio
          )
        `)
        .eq('board_id', targetBoardId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[commentService] Error fetching comments:', error.message);
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      // นำรายการคอมเมนต์ทั้งหมดมาจัดกลุ่ม replies ให้อยู่ใต้ parent_id
      return groupCommentsWithReplies(data as unknown as CommentRow[], options);
    } catch (err) {
      console.error('[commentService] Fetch & Render exception:', err);
      return [];
    }
  },

  /**
   * 2. บันทึกคอมเมนต์ใหม่ หรือ คอมเมนต์ตอบกลับ (Reply) ลงตาราง comments ใน Supabase
   *
   * @param params ข้อมูลคอมเมนต์:
   *   - boardId: รหัสบอร์ด int8 (เช่น 7)
   *   - content: ข้อความคอมเมนต์
   *   - parentId: null สำหรับคอมเมนต์หลัก, หรือ int8 id สำหรับการ Reply
   *   - userId: (Optional) UUID ผู้ใช้ หากไม่ส่งจะดึงจาก Supabase Auth session อัตโนมัติ
   */
  async createComment(params: InsertCommentParams): Promise<CommentRow> {
    const targetBoardId = parseBoardId(params.boardId);
    if (!targetBoardId) {
      throw new Error('ไม่พบรหัสบอร์ดที่ถูกต้องสำหรับสร้างคอมเมนต์');
    }

    if (!params.content || !params.content.trim()) {
      throw new Error('กรุณาระบุข้อความคอมเมนต์');
    }

    // ตรวจสอบ UUID ของผู้ใช้ (ดึงจาก session ถ้าไม่ได้ส่งมา)
    let authUserId = params.userId;
    if (!authUserId) {
      const {
        data: { user: sbUser },
      } = await supabase.auth.getUser();
      if (sbUser?.id) {
        authUserId = sbUser.id;
      }
    }

    if (!authUserId) {
      throw new Error('กรุณาเข้าสู่ระบบก่อนส่งความคิดเห็น');
    }

    // เตรียม Payload สำหรับ INSERT ลงตาราง comments
    let parentIdNum: number | null = null;
    if (params.parentId !== undefined && params.parentId !== null) {
      const parsed = Number(params.parentId);
      if (!isNaN(parsed) && parsed > 0) {
        parentIdNum = parsed;
      }
    }

    const payload = {
      board_id: targetBoardId,
      user_id: authUserId,
      content: params.content.trim(),
      parent_id: parentIdNum,
      is_updated: false,
    };

    const { data, error } = await supabase
      .from('comments')
      .insert(payload)
      .select(`
        id,
        board_id,
        user_id,
        parent_id,
        content,
        is_updated,
        created_at,
        profile (
          id,
          user_name,
          real_name,
          student_id,
          faculty_id,
          bio
        )
      `)
      .single();

    if (error) {
      console.error('[commentService] Error inserting comment:', error.message);
      throw error;
    }

    return data as unknown as CommentRow;
  },

  /**
   * 3. ลบคอมเมนต์และคอมเมนต์ตอบกลับที่อยู่ภายใต้
   */
  async deleteComment(commentId: number): Promise<boolean> {
    try {
      // ลบคอมเมนต์ตอบกลับย่อย (ถ้ามี)
      await supabase.from('comments').delete().eq('parent_id', commentId);

      // ลบคอมเมนต์หลัก
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) {
        console.error('[commentService] Error deleting comment:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[commentService] Delete exception:', err);
      return false;
    }
  },

  /**
   * 4. แก้ไขความคิดเห็น (เฉพาะเจ้าของคอมเมนต์)
   */
  async updateComment(commentId: number, content: string): Promise<boolean> {
    try {
      if (!content.trim()) return false;
      const { error } = await supabase
        .from('comments')
        .update({
          content: content.trim(),
          is_updated: true,
        })
        .eq('id', commentId);

      if (error) {
        console.error('[commentService] Error updating comment:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[commentService] Update exception:', err);
      return false;
    }
  },
};

export default commentService;
