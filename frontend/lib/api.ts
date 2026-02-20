import axios from 'axios';
import type { Registration, LoginResponse, ApiResponse, PaginatedResponse, Stats } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const userToken = localStorage.getItem('userToken');
        const adminToken = localStorage.getItem('adminToken');
        const token = userToken || adminToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});


// Auth API
export const authAPI = {
    login: async (username: string, password: string): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/auth/login', { username, password });
        return response.data;
    },

    verify: async (): Promise<ApiResponse<any>> => {
        const response = await api.get<ApiResponse<any>>('/auth/verify');
        return response.data;
    },
};

// Submissions API
export const submissionsAPI = {
    create: async (data: Record<string, any>): Promise<ApiResponse<Registration>> => {
        const response = await api.post<ApiResponse<Registration>>('/submissions', data);
        return response.data;
    },

    getAll: async (page = 1, limit = 10, search = '', status = '', sortBy = 'submittedAt', sortOrder = 'desc'): Promise<PaginatedResponse<Registration>> => {
        const response = await api.get<PaginatedResponse<Registration>>('/submissions', {
            params: { page, limit, search, status, sortBy, sortOrder },
        });
        return response.data;
    },

    getOne: async (id: string): Promise<ApiResponse<Registration>> => {
        const response = await api.get<ApiResponse<Registration>>(`/submissions/${id}`);
        return response.data;
    },

    updateStatus: async (id: string, status: 'approved' | 'rejected'): Promise<ApiResponse<Registration>> => {
        const response = await api.patch<ApiResponse<Registration>>(`/submissions/${id}/status`, { status });
        return response.data;
    },

    approve: async (id: string): Promise<ApiResponse<any>> => {
        const response = await api.patch<ApiResponse<any>>(`/submissions/${id}/approve`);
        return response.data;
    },

    reject: async (id: string, reason?: string): Promise<ApiResponse<any>> => {
        const response = await api.patch<ApiResponse<any>>(`/submissions/${id}/reject`, { reason });
        return response.data;
    },

    delete: async (id: string): Promise<ApiResponse<any>> => {
        const response = await api.delete<ApiResponse<any>>(`/submissions/${id}`);
        return response.data;
    },

    getStats: async (): Promise<ApiResponse<Stats>> => {
        const response = await api.get<ApiResponse<Stats>>('/submissions/stats/overview');
        return response.data;
    },
};

// User Auth API
export const userAuthAPI = {
    login: async (email: string, password: string): Promise<any> => {
        const response = await api.post('/user/login', { email, password });
        return response.data;
    },

    getProfile: async (): Promise<any> => {
        const response = await api.get('/user/profile');
        return response.data;
    },

    updateProfile: async (data: any): Promise<any> => {
        const response = await api.put('/user/profile', data);
        return response.data;
    },

    changePassword: async (currentPassword: string, newPassword: string): Promise<any> => {
        const response = await api.put('/user/change-password', { currentPassword, newPassword });
        return response.data;
    },

    forgotPassword: async (email: string): Promise<any> => {
        const response = await api.post('/user/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token: string, newPassword: string): Promise<any> => {
        const response = await api.post('/user/reset-password', { token, newPassword });
        return response.data;
    },
};

// Roles API
export const rolesAPI = {
    getAll: async (): Promise<any> => {
        const response = await api.get('/roles');
        return response.data;
    },

    getOne: async (id: string): Promise<any> => {
        const response = await api.get(`/roles/${id}`);
        return response.data;
    },

    getUserRoles: async (userId: string): Promise<any> => {
        const response = await api.get(`/roles/users/${userId}/roles`);
        return response.data;
    },

    assignRole: async (userId: string, roleId: string, notes?: string): Promise<any> => {
        const response = await api.post(`/roles/users/${userId}/roles`, { roleId, notes });
        return response.data;
    },

    removeRole: async (userId: string, roleId: string): Promise<any> => {
        const response = await api.delete(`/roles/users/${userId}/roles/${roleId}`);
        return response.data;
    },
};

// Notifications API
export const notificationsAPI = {
    getAll: async (page = 1, limit = 20): Promise<any> => {
        const response = await api.get('/notifications', { params: { page, limit } });
        return response.data;
    },

    getUnreadCount: async (): Promise<any> => {
        const response = await api.get('/notifications/unread-count');
        return response.data;
    },

    markAsRead: async (id: string): Promise<any> => {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async (): Promise<any> => {
        const response = await api.put('/notifications/mark-all-read');
        return response.data;
    },

    delete: async (id: string): Promise<any> => {
        const response = await api.delete(`/notifications/${id}`);
        return response.data;
    },
};

// Events API
export const eventsAPI = {
    getAll: async (startDate?: string, endDate?: string, eventType?: string): Promise<any> => {
        const response = await api.get('/events', {
            params: { startDate, endDate, eventType },
        });
        return response.data;
    },

    getUpcoming: async (limit = 5): Promise<any> => {
        const response = await api.get('/events/upcoming', { params: { limit } });
        return response.data;
    },

    getOne: async (id: string): Promise<any> => {
        const response = await api.get(`/events/${id}`);
        return response.data;
    },

    create: async (data: any): Promise<any> => {
        const response = await api.post('/events', data);
        return response.data;
    },

    update: async (id: string, data: any): Promise<any> => {
        const response = await api.put(`/events/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<any> => {
        const response = await api.delete(`/events/${id}`);
        return response.data;
    },
};

// Meeting Minutes API
export const meetingMinutesAPI = {
    getAll: async (page = 1, limit = 10, search = ''): Promise<any> => {
        const response = await api.get('/meeting-minutes', {
            params: { page, limit, search },
        });
        return response.data;
    },

    getOne: async (id: string): Promise<any> => {
        const response = await api.get(`/meeting-minutes/${id}`);
        return response.data;
    },

    create: async (formData: FormData): Promise<any> => {
        const response = await api.post('/meeting-minutes', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    update: async (id: string, formData: FormData): Promise<any> => {
        const response = await api.put(`/meeting-minutes/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    delete: async (id: string): Promise<any> => {
        const response = await api.delete(`/meeting-minutes/${id}`);
        return response.data;
    },

    downloadAttachment: (id: string, fileIndex: number): string => {
        return `${API_URL}/meeting-minutes/${id}/download/${fileIndex}`;
    },
};

// Users API
export const usersAPI = {
    getAll: async (page = 1, limit = 50, search = '', isActive?: boolean): Promise<any> => {
        const response = await api.get('/users', {
            params: { page, limit, search, isActive },
        });
        return response.data;
    },

    getStats: async (): Promise<any> => {
        const response = await api.get('/users/stats');
        return response.data;
    },

    getOne: async (id: string): Promise<any> => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    toggleStatus: async (id: string): Promise<any> => {
        const response = await api.patch(`/users/${id}/status`);
        return response.data;
    },
};

// Activity API
export const activityAPI = {
    getRecent: async (page = 1, limit = 20, action?: string, adminId?: string): Promise<any> => {
        const response = await api.get('/activity', {
            params: { page, limit, action, adminId },
        });
        return response.data;
    },

    getStats: async (): Promise<any> => {
        const response = await api.get('/activity/stats');
        return response.data;
    },

    getByAdmin: async (adminId: string, limit = 20): Promise<any> => {
        const response = await api.get(`/activity/admin/${adminId}`, {
            params: { limit },
        });
        return response.data;
    },
};

// Analytics API
export const analyticsAPI = {
    getOverview: async (): Promise<any> => {
        const response = await api.get('/analytics/overview');
        return response.data;
    },

    getEvents: async (): Promise<any> => {
        const response = await api.get('/analytics/events');
        return response.data;
    },

    getMembers: async (): Promise<any> => {
        const response = await api.get('/analytics/members');
        return response.data;
    },
};

// Reports API
export const reportsAPI = {
    getApplications: async (startDate?: string, endDate?: string, status?: string): Promise<any> => {
        const response = await api.get('/reports/applications', {
            params: { startDate, endDate, status },
        });
        return response.data;
    },

    getMembers: async (): Promise<any> => {
        const response = await api.get('/reports/members');
        return response.data;
    },

    getEvents: async (startDate?: string, endDate?: string): Promise<any> => {
        const response = await api.get('/reports/events', {
            params: { startDate, endDate },
        });
        return response.data;
    },
};

export default api;
