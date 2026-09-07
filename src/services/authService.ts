import { UserProfile } from '../types';
import { INITIAL_USER } from '../data/mockData';
import { apiClient, setAuthToken, clearAuthToken } from './apiClient';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const USER_STORAGE_KEY = 'tulonely_user';
const LOGGED_IN_STORAGE_KEY = 'tulonely_is_logged_in';
const DEFAULT_PASSWORD = 'TUlonelyPassword@2026';

export interface LoginCredentials {
  studentId?: string;
  email?: string;
  password?: string;
  name?: string;
}

export interface RegisterPayload extends Partial<UserProfile> {
  password?: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
}

/**
 * Helper to get local user from localStorage or fallback to default
 */
export const getLocalUser = (): UserProfile => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as UserProfile;
    }
  } catch (err) {
    console.warn('[authService] Error parsing local user:', err);
  }
  return INITIAL_USER;
};

/**
 * Helper to save local user
 */
export const saveLocalUser = (user: UserProfile): void => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.warn('[authService] Error saving local user:', err);
  }
};

/**
 * Format Edge Function failure reasons into user-friendly Thai messages
 */
export function formatRegisterError(reason: string): string {
  if (!reason) return 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง';

  const lower = reason.toLowerCase();

  if (reason.includes('Name does not match TU records') || lower.includes('name does not match')) {
    return 'ชื่อจริงและนามสกุลไม่ตรงกับข้อมูลในระบบมหาวิทยาลัยธรรมศาสตร์ กรุณาตรวจสอบการสะกดชื่อ-นามสกุล';
  }
  if (reason.includes('Student record not found in TU system') || lower.includes('student record not found')) {
    return 'ไม่พบข้อมูลรหัสนักศึกษานี้ในระบบ มธ. กรุณาตรวจสอบรหัสนักศึกษา 10 หลักอีกครั้ง';
  }
  if (reason.includes('Invalid or incomplete inputs') || lower.includes('incomplete inputs')) {
    return 'ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง กรุณากรอกรหัสนักศึกษา 10 หลัก, ชื่อจริง-นามสกุล, อีเมล และรหัสผ่าน';
  }
  if (reason.includes('TU API Error Status')) {
    return `ระบบตรวจสอบนักศึกษาของ มธ. ขัดข้องชั่วคราว (${reason})`;
  }
  if (lower.includes('already registered') || lower.includes('user already exists') || lower.includes('duplicate key')) {
    return 'อีเมลหรือรหัสนักศึกษานี้ถูกลงทะเบียนไว้ในระบบแล้ว กรุณาเข้าสู่ระบบ';
  }
  if (lower.includes('password') && lower.includes('least 6')) {
    return 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
  }
  if (lower.includes('invalid api key') || lower.includes('anon-key') || lower.includes('apikey')) {
    return 'กรุณาระบุ VITE_SUPABASE_ANON_KEY ที่ถูกต้องในไฟล์ .env ก่อนทำการทดสอบ';
  }
  if (lower.includes('failed to send a request to the edge function') || lower.includes('relay error') || lower.includes('functionshttperror')) {
    return `ไม่สามารถเรียกใช้งาน Supabase Edge Function ได้ (${reason}) กรุณาตรวจสอบว่าได้ Deploy Function ชื่อ register หรือกำหนด VITE_SUPABASE_REGISTER_FUNCTION ใน .env แล้วหรือไม่`;
  }

  return reason;
}

/**
 * Helper to build UserProfile from Supabase user data
 */
const buildProfileFromSupabaseUser = (sbUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): UserProfile => {
  const meta = sbUser.user_metadata || {};
  const local = getLocalUser();
  const realName = (meta.real_name as string) || (meta.fullName as string) || (meta.full_name as string) || local.fullName;
  const userName = (meta.user_name as string) || (meta.name as string) || realName || local.name || 'นักศึกษา มธ.';

  return {
    id: sbUser.id,
    name: userName,
    fullName: realName,
    studentId: (meta.studentId as string) || (meta.student_id as string) || local.studentId || '660965xxxx',
    email: sbUser.email || local.email,
    faculty: (meta.faculty as string) || local.faculty || 'วิศวกรรมศาสตร์ (TSE)',
    year: (meta.year as string) || local.year || 'ปี 2',
    campus: (meta.campus as string) || local.campus || 'ศูนย์รังสิต',
    bio: (meta.bio as string) ?? null,
    avatar: (meta.avatar as string) || (meta.avatar_url as string) || local.avatar,
    interests: Array.isArray(meta.interests) ? (meta.interests as string[]) : local.interests || ['#หาเพื่อน'],
    favoriteRooms: Array.isArray(meta.favoriteRooms) ? (meta.favoriteRooms as string[]) : local.favoriteRooms || [],
    favoriteActivities: Array.isArray(meta.favoriteActivities) ? (meta.favoriteActivities as string[]) : local.favoriteActivities || [],
  };
};

/**
 * Authentication Service with Supabase Auth & Local Fallback
 */
export const authService = {
  /**
   * Get current authenticated user profile
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    if (isSupabaseConfigured) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          const isLoggedIn = localStorage.getItem(LOGGED_IN_STORAGE_KEY) === 'true';
          return isLoggedIn ? getLocalUser() : null;
        }

        // Try getting profile from 'profile' table first (used by Edge Function)
        try {
          let profileRow: any = null;
          try {
            const res = await supabase
              .from('profile')
              .select('*, faculties(faculty_name)')
              .eq('id', user.id)
              .maybeSingle();
            profileRow = res.data;
          } catch {
            const res = await supabase
              .from('profile')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();
            profileRow = res.data;
          }

          if (profileRow) {
            let facultyName = profileRow.faculties?.faculty_name || 'มหาวิทยาลัยธรรมศาสตร์';
            if (!profileRow.faculties?.faculty_name && profileRow.faculty_id) {
              try {
                const { data: fData } = await supabase
                  .from('faculties')
                  .select('faculty_name')
                  .eq('id', profileRow.faculty_id)
                  .maybeSingle();
                if (fData?.faculty_name) facultyName = fData.faculty_name;
              } catch {
                // ignore
              }
            }

            const merged: UserProfile = {
              ...buildProfileFromSupabaseUser(user),
              name: profileRow.user_name || profileRow.real_name || 'นักศึกษา มธ.',
              fullName: profileRow.real_name,
              studentId: profileRow.student_id,
              faculty: facultyName,
              bio: profileRow.bio ?? null,
            };
            saveLocalUser(merged);
            localStorage.setItem(LOGGED_IN_STORAGE_KEY, 'true');
            return merged;
          }
        } catch (profileErr) {
          console.warn('[authService] Could not read from profile table:', profileErr);
        }

        // Fallback: Try 'profiles' table if it exists
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (profileData) {
            const merged: UserProfile = {
              ...buildProfileFromSupabaseUser(user),
              ...profileData,
            };
            saveLocalUser(merged);
            localStorage.setItem(LOGGED_IN_STORAGE_KEY, 'true');
            return merged;
          }
        } catch {
          // Table might not exist yet; proceed with metadata
        }

        const profile = buildProfileFromSupabaseUser(user);
        saveLocalUser(profile);
        localStorage.setItem(LOGGED_IN_STORAGE_KEY, 'true');
        return profile;
      } catch (err) {
        console.warn('[authService] Supabase getUser error, using local fallback:', err);
      }
    }

    return apiClient.get<UserProfile | null>(
      '/auth/me',
      () => {
        const isLoggedIn = localStorage.getItem(LOGGED_IN_STORAGE_KEY) === 'true';
        if (!isLoggedIn) {
          return null;
        }
        return getLocalUser();
      }
    );
  },

  /**
   * Login with student credentials or email
   */
  async login(credentials?: LoginCredentials): Promise<AuthResponse> {
    const rawEmail = credentials?.email?.trim() || '';
    const studentId = credentials?.studentId?.trim() || '';
    const email = rawEmail || (studentId ? `${studentId}@dome.tu.ac.th` : 'student@dome.tu.ac.th');
    const password = credentials?.password || DEFAULT_PASSWORD;

    if (isSupabaseConfigured) {
      try {
        // Attempt sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          let userProfile = buildProfileFromSupabaseUser(data.user);

          // Try fetching profile from 'profile' table
          try {
            let profileRow: any = null;
            try {
              const res = await supabase
                .from('profile')
                .select('*, faculties(faculty_name)')
                .eq('id', data.user.id)
                .maybeSingle();
              profileRow = res.data;
            } catch {
              const res = await supabase
                .from('profile')
                .select('*')
                .eq('id', data.user.id)
                .maybeSingle();
              profileRow = res.data;
            }

            if (profileRow) {
              let facultyName = profileRow.faculties?.faculty_name || userProfile.faculty;
              if (!profileRow.faculties?.faculty_name && profileRow.faculty_id) {
                try {
                  const { data: fData } = await supabase
                    .from('faculties')
                    .select('faculty_name')
                    .eq('id', profileRow.faculty_id)
                    .maybeSingle();
                  if (fData?.faculty_name) facultyName = fData.faculty_name;
                } catch {
                  // ignore
                }
              }

              userProfile = {
                ...userProfile,
                name: profileRow.user_name || profileRow.real_name || userProfile.name,
                fullName: profileRow.real_name || userProfile.fullName,
                studentId: profileRow.student_id || userProfile.studentId,
                faculty: facultyName,
                bio: profileRow.bio ?? null,
              };
            }
          } catch {
            // ignore
          }

          if (credentials?.name) userProfile.name = credentials.name;
          if (studentId) userProfile.studentId = studentId;

          saveLocalUser(userProfile);
          localStorage.setItem(LOGGED_IN_STORAGE_KEY, 'true');
          const token = data.session?.access_token || `sb-${Date.now()}`;
          setAuthToken(token);
          return { user: userProfile, token };
        }
      } catch (sbErr: any) {
        console.warn('[authService] Supabase login error:', sbErr);
        if (import.meta.env.VITE_USE_MOCK !== 'true') {
          const msg = sbErr?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
          if (msg.includes('Invalid login credentials')) {
            throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
          }
          throw new Error(msg);
        }
      }
    }

    // Local / Backend API fallback
    return apiClient.post<AuthResponse>(
      '/auth/login',
      credentials,
      () => {
        const current = getLocalUser();
        const updated: UserProfile = {
          ...current,
          name: credentials?.name || current.name,
          studentId: credentials?.studentId || current.studentId,
          email: credentials?.email || current.email,
        };
        saveLocalUser(updated);
        localStorage.setItem(LOGGED_IN_STORAGE_KEY, 'true');
        const mockToken = `mock-token-${Date.now()}`;
        setAuthToken(mockToken);
        return { user: updated, token: mockToken };
      }
    );
  },

  /**
   * Register a new student profile by sending data to Supabase Edge Function
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const student_id = payload.studentId?.trim() || '';
    const real_name = (payload.fullName || payload.name)?.trim() || '';
    const email = payload.email?.trim() || (student_id ? `${student_id}@dome.tu.ac.th` : '');
    const password = payload.password || DEFAULT_PASSWORD;
    const user_name = payload.name?.trim() ? payload.name.trim() : real_name;
    const bio = payload.bio?.trim() ? payload.bio.trim() : null;

    const functionName = import.meta.env.VITE_SUPABASE_REGISTER_FUNCTION || 'register';

    if (isSupabaseConfigured) {
      console.log(`[authService] Invoking Supabase Edge Function "${functionName}" for student:`, student_id);

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          student_id,
          real_name,
          email,
          password,
          user_name,
          bio,
        },
      });

      if (error) {
        let errReason = error.message;
        if ('context' in error && (error as any).context && typeof (error as any).context.json === 'function') {
          try {
            const errJson = await (error as any).context.json();
            if (errJson && (errJson.reason || errJson.error)) {
              errReason = errJson.reason || errJson.error;
            }
          } catch {
            // ignore
          }
        }
        console.error('[authService] Edge Function error:', errReason);
        throw new Error(formatRegisterError(errReason));
      }

      if (data && data.status === 'failed') {
        const failureReason = data.reason || data.error || 'เกิดข้อผิดพลาดในการลงทะเบียน';
        console.warn('[authService] Edge Function verification failed:', failureReason);
        throw new Error(formatRegisterError(failureReason));
      }

      console.log('[authService] Edge Function succeeded! Auto-signing in with Supabase Auth...');

      // Edge Function created the user with email_confirm: true and inserted into 'profile' table
      let authUser: any = null;
      let token = `sb-${Date.now()}`;

      try {
        const signInRes = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInRes.data?.user) {
          authUser = signInRes.data.user;
          token = signInRes.data.session?.access_token || token;
        } else if (signInRes.error) {
          console.warn('[authService] Auto sign-in notice:', signInRes.error.message);
        }
      } catch (signInErr) {
        console.warn('[authService] Auto sign-in error:', signInErr);
      }

      const userId = authUser?.id || `sb-user-${Date.now()}`;

      // Query from 'profile' table (singular, as populated by Edge Function)
      let profileRow: any = null;
      try {
        const res = await supabase
          .from('profile')
          .select('*, faculties(faculty_name)')
          .eq('id', userId)
          .maybeSingle();
        profileRow = res.data;
      } catch {
        try {
          const res = await supabase
            .from('profile')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          profileRow = res.data;
        } catch {
          // ignore
        }
      }

      let facultyName = profileRow?.faculties?.faculty_name || payload.faculty || 'มหาวิทยาลัยธรรมศาสตร์';
      if (!profileRow?.faculties?.faculty_name && profileRow?.faculty_id) {
        try {
          const { data: fData } = await supabase
            .from('faculties')
            .select('faculty_name')
            .eq('id', profileRow.faculty_id)
            .maybeSingle();
          if (fData?.faculty_name) facultyName = fData.faculty_name;
        } catch {
          // ignore
        }
      }

      const finalProfile: UserProfile = {
        id: userId,
        name: profileRow?.user_name || payload.name || profileRow?.real_name || 'นักศึกษา มธ.',
        fullName: profileRow?.real_name || payload.fullName || real_name,
        studentId: profileRow?.student_id || student_id,
        email,
        faculty: facultyName,
        year: payload.year || `ปี ${Math.max(1, new Date().getFullYear() + 543 - (2500 + parseInt((profileRow?.student_id || student_id || '66').slice(0, 2), 10)))}`,
        campus: payload.campus || 'ศูนย์รังสิต',
        bio: profileRow?.bio !== undefined ? profileRow.bio : (payload.bio?.trim() ? payload.bio.trim() : null),
        avatar: payload.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        interests: payload.interests || ['#หาเพื่อน', '#ธรรมศาสตร์'],
        favoriteRooms: [],
        favoriteActivities: [],
      };

      saveLocalUser(finalProfile);
      localStorage.setItem(LOGGED_IN_STORAGE_KEY, 'true');
      setAuthToken(token);
      return { user: finalProfile, token };
    }

    // If Supabase is not configured and not in mock mode:
    if (import.meta.env.VITE_USE_MOCK !== 'true') {
      throw new Error('กรุณานำ anon key จาก Supabase Dashboard (Project Settings > API) มาใส่ที่ VITE_SUPABASE_ANON_KEY ในไฟล์ .env ก่อนทดสอบ Edge Function');
    }

    // Local / Backend API fallback
    return apiClient.post<AuthResponse>(
      '/auth/register',
      payload,
      () => {
        const current = getLocalUser();
        const fallbackRealName = payload.fullName || payload.name || current.fullName || 'นักศึกษา มธ.';
        const fallbackUserName = payload.name?.trim() ? payload.name.trim() : fallbackRealName;
        const newProfile: UserProfile = {
          ...current,
          ...payload,
          id: payload.id || `user-${Date.now()}`,
          name: fallbackUserName,
          fullName: fallbackRealName,
          studentId: payload.studentId || '660965xxxx',
          faculty: payload.faculty || 'วิศวกรรมศาสตร์ (TSE)',
          campus: payload.campus || 'ศูนย์รังสิต',
          bio: payload.bio?.trim() ? payload.bio.trim() : null,
        };
        saveLocalUser(newProfile);
        localStorage.setItem(LOGGED_IN_STORAGE_KEY, 'true');
        const mockToken = `mock-token-${Date.now()}`;
        setAuthToken(mockToken);
        return { user: newProfile, token: mockToken };
      }
    );
  },

  /**
   * Log out current user
   */
  async logout(): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[authService] Supabase signOut error:', err);
      }
    }

    return apiClient.post<void>(
      '/auth/logout',
      {},
      () => {
        clearAuthToken();
        localStorage.setItem(LOGGED_IN_STORAGE_KEY, 'false');
      }
    );
  },

  /**
   * Update student user profile
   */
  async updateProfile(updated: Partial<UserProfile>): Promise<UserProfile> {
    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.auth.updateUser({
            data: updated,
          });

          // Update 'profile' table (singular)
          try {
            await supabase
              .from('profile')
              .update({
                user_name: updated.name,
                bio: updated.bio,
              })
              .eq('id', user.id);
          } catch {
            // Ignore if profile table doesn't have these columns
          }

          // Try updating 'profiles' table (plural) if exists
          try {
            await supabase
              .from('profiles')
              .update({
                name: updated.name,
                faculty: updated.faculty,
                year: updated.year,
                campus: updated.campus,
                bio: updated.bio,
                avatar: updated.avatar,
                interests: updated.interests,
                updated_at: new Date().toISOString(),
              })
              .eq('id', user.id);
          } catch {
            // Ignore if profiles table is not available
          }
        }
      } catch (err) {
        console.warn('[authService] Supabase updateProfile error:', err);
      }
    }

    return apiClient.patch<UserProfile>(
      '/auth/profile',
      updated,
      () => {
        const current = getLocalUser();
        const merged: UserProfile = {
          ...current,
          ...updated,
        };
        saveLocalUser(merged);
        return merged;
      }
    );
  },

  /**
   * Send password reset email via Supabase Auth
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    const cleanedEmail = email.trim();
    if (!cleanedEmail) {
      throw new Error('กรุณากรอกอีเมล');
    }

    if (isSupabaseConfigured) {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(cleanedEmail, {
        redirectTo,
      });

      if (error) {
        console.warn('[authService] resetPasswordForEmail error:', error.message);
        throw new Error(formatPasswordResetError(error.message));
      }
      return;
    }

    // Mock fallback when offline or in mock mode
    console.log('[authService] (Mock) Password reset link sent to:', cleanedEmail);
    await new Promise((resolve) => setTimeout(resolve, 500));
  },

  /**
   * Set new password (used when user arrives via reset password email)
   */
  async updatePassword(newPassword: string): Promise<void> {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.warn('[authService] updateUser password error:', error.message);
        throw new Error(formatPasswordResetError(error.message));
      }
      return;
    }

    // Mock fallback
    console.log('[authService] (Mock) Password updated successfully');
    await new Promise((resolve) => setTimeout(resolve, 500));
  },
};

/**
 * Helper to format password reset error messages to user-friendly Thai
 */
export function formatPasswordResetError(reason: string): string {
  if (!reason) return 'เกิดข้อผิดพลาดในการดำเนินการ กรุณาลองใหม่อีกครั้ง';
  const lower = reason.toLowerCase();

  if (lower.includes('user not found') || lower.includes('no user found')) {
    return 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบอีเมลอีกครั้ง';
  }
  if (lower.includes('rate limit') || lower.includes('security purposes') || lower.includes('too many requests')) {
    return 'คุณได้ส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง';
  }
  if (lower.includes('same password') || lower.includes('different from the old')) {
    return 'รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม';
  }
  if (lower.includes('at least 6 characters') || lower.includes('password should be at least')) {
    return 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
  }
  if (lower.includes('auth session missing') || lower.includes('jwt') || lower.includes('expired')) {
    return 'เซสชันหมดอายุหรือไม่ถูกต้อง กรุณากดขอลิงก์รีเซ็ตรหัสผ่านใหม่อีกครั้ง';
  }

  return reason;
}


