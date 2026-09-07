/**
 * TUlonely API Client
 * Configurable HTTP client with automatic fallback to mock/localStorage data
 * when the backend is offline or not configured.
 */

const DEFAULT_API_URL = 'http://localhost:5000/api';
const TOKEN_STORAGE_KEY = 'tulonely_token';
const REQUEST_TIMEOUT_MS = 3500;

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success?: boolean;
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Get configured API Base URL from Vite environment or default
 */
export const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as unknown as { env: Record<string, string | undefined> }).env.VITE_API_URL;
  if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return DEFAULT_API_URL;
};

/**
 * Check if the app is explicitly set to mock mode
 */
export const isMockModeConfigured = (): boolean => {
  return (import.meta as unknown as { env: Record<string, string | undefined> }).env.VITE_USE_MOCK === 'true';
};

/**
 * Auth Token Management
 */
export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string | null): void => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('[apiClient] Failed to update localStorage token:', err);
  }
};

export const clearAuthToken = (): void => {
  setAuthToken(null);
};

/**
 * Core Request wrapper with automatic fallback
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  fallback?: () => Promise<T> | T
): Promise<T> {
  // If explicitly forced to mock mode, skip network request
  if (isMockModeConfigured()) {
    if (fallback) {
      return await fallback();
    }
    throw new Error('Mock mode enabled but no fallback handler provided');
  }

  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const json = await response.json();
    return (json?.data !== undefined ? json.data : json) as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    // If fallback is available, warn and use it gracefully
    if (fallback) {
      const errMessage = err instanceof Error ? err.message : String(err);
      console.warn(
        `[TUlonely apiClient] Backend request to "${cleanEndpoint}" failed (${errMessage}). Switching to localStorage fallback.`
      );
      return await fallback();
    }

    throw err;
  }
}

/**
 * Convenience methods
 */
export const apiClient = {
  get<T>(endpoint: string, fallback?: () => Promise<T> | T, init?: RequestInit): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'GET', ...init }, fallback);
  },

  post<T>(endpoint: string, body?: unknown, fallback?: () => Promise<T> | T, init?: RequestInit): Promise<T> {
    return apiRequest<T>(
      endpoint,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
        ...init,
      },
      fallback
    );
  },

  put<T>(endpoint: string, body?: unknown, fallback?: () => Promise<T> | T, init?: RequestInit): Promise<T> {
    return apiRequest<T>(
      endpoint,
      {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
        ...init,
      },
      fallback
    );
  },

  patch<T>(endpoint: string, body?: unknown, fallback?: () => Promise<T> | T, init?: RequestInit): Promise<T> {
    return apiRequest<T>(
      endpoint,
      {
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
        ...init,
      },
      fallback
    );
  },

  delete<T>(endpoint: string, fallback?: () => Promise<T> | T, init?: RequestInit): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'DELETE', ...init }, fallback);
  },
};
