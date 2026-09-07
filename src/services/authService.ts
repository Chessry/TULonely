import { UserProfile } from '../types';
import { INITIAL_USER } from '../data/mockData';
import { apiClient, setAuthToken, clearAuthToken } from './apiClient';

const USER_STORAGE_KEY = 'tulonely_user';
const LOGGED_IN_STORAGE_KEY = 'tulonely_is_logged_in';

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
 * Authentication Service
 */
export const authService = {
  /**
   * Get current authenticated user profile
   */
  async getCurrentUser(): Promise<UserProfile | null> {
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
   * Login with student credentials
   */
  async login(credentials?: LoginCredentials): Promise<AuthResponse> {
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
   * Register a new student profile
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(
      '/auth/register',
      payload,
      () => {
        const current = getLocalUser();
        const newProfile: UserProfile = {
          ...current,
          ...payload,
          id: payload.id || `user-${Date.now()}`,
          name: payload.name || 'นักศึกษา มธ.',
          studentId: payload.studentId || '660965xxxx',
          faculty: payload.faculty || 'วิศวกรรมศาสตร์ (TSE)',
          campus: payload.campus || 'ศูนย์รังสิต',
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
};
