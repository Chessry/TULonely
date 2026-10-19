import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Strip any accidental wrapping quotes and trailing slashes
const sanitizedUrl = rawUrl.replace(/^["']|["']$/g, '').replace(/\/+$/, '');
const sanitizedKey = rawKey.replace(/^["']|["']$/g, '');

const supabaseUrl = sanitizedUrl || 'https://placeholder.supabase.co';
const supabaseAnonKey = sanitizedKey || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  sanitizedUrl &&
    sanitizedKey &&
    !sanitizedUrl.includes('your-project-ref') &&
    sanitizedKey !== 'your-anon-key-here'
);

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase] Warning: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not configured yet in .env. Falling back to local storage.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface SupabaseConnectionStatus {
  configured: boolean;
  connected: boolean;
  message: string;
  error?: string;
}

/**
 * Test Supabase connection and authentication service
 */
export async function testSupabaseConnection(): Promise<SupabaseConnectionStatus> {
  if (!isSupabaseConfigured) {
    return {
      configured: false,
      connected: false,
      message: 'Supabase ยังไม่ได้ตั้งค่า VITE_SUPABASE_ANON_KEY ในไฟล์ .env',
    };
  }

  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      return {
        configured: true,
        connected: false,
        message: `เชื่อมต่อ Supabase ไม่สำเร็จ: ${error.message}`,
        error: error.message,
      };
    }
    return {
      configured: true,
      connected: true,
      message: 'เชื่อมต่อกับ Supabase สำเร็จเรียบร้อย!',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      configured: true,
      connected: false,
      message: `เกิดข้อผิดพลาดในการเชื่อมต่อ Supabase: ${errorMsg}`,
      error: errorMsg,
    };
  }
}

export default supabase;
