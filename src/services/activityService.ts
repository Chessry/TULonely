import { UniversityActivity } from '../types';
import { UNIVERSITY_ACTIVITIES } from '../data/mockData';
import { apiClient } from './apiClient';
import { getLocalUser, saveLocalUser } from './authService';

export interface ActivityFilterParams {
  search?: string;
  campus?: string;
  tag?: string;
}

/**
 * University Activity Service
 */
export const activityService = {
  /**
   * Get all university activities with optional filter
   */
  async getActivities(filters?: ActivityFilterParams): Promise<UniversityActivity[]> {
    const queryParams = new URLSearchParams();
    if (filters?.search) queryParams.set('search', filters.search);
    if (filters?.campus) queryParams.set('campus', filters.campus);
    if (filters?.tag) queryParams.set('tag', filters.tag);

    const endpoint = `/activities${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return apiClient.get<UniversityActivity[]>(endpoint, () => {
      let result = [...UNIVERSITY_ACTIVITIES];

      if (filters?.campus) {
        result = result.filter((a) => a.campus === filters.campus);
      }
      if (filters?.tag) {
        result = result.filter((a) => a.tags.includes(filters.tag!));
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q) ||
            a.location.toLowerCase().includes(q) ||
            a.tags.some((t) => t.toLowerCase().includes(q))
        );
      }

      return result;
    });
  },

  /**
   * Get activity by ID
   */
  async getActivityById(id: string): Promise<UniversityActivity | null> {
    return apiClient.get<UniversityActivity | null>(`/activities/${id}`, () => {
      const match = UNIVERSITY_ACTIVITIES.find((a) => a.id === id);
      return match || null;
    });
  },

  /**
   * Toggle favorite university activity
   */
  async toggleFavoriteActivity(activityId: string, _userId: string): Promise<string[]> {
    return apiClient.post<string[]>(
      `/activities/${activityId}/favorite`,
      {},
      () => {
        const user = getLocalUser();
        const exists = user.favoriteActivities.includes(activityId);
        const updatedFavorites = exists
          ? user.favoriteActivities.filter((id) => id !== activityId)
          : [...user.favoriteActivities, activityId];

        saveLocalUser({
          ...user,
          favoriteActivities: updatedFavorites,
        });

        return updatedFavorites;
      }
    );
  },
};
