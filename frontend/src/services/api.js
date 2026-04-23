import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8080/api',
});

// Automatically add token and user headers to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Some backend controllers require explicit User ID and Role headers
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            config.headers['X-User-Id'] = user.id;
            config.headers['X-User-Role'] = user.role;
        } catch (e) {
            console.error('Error parsing user from localStorage', e);
        }
    }
    
    return config;
});

// Auth endpoints
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);

// User management endpoints
export const getAllUsers = () => API.get('/users');
export const getUserById = (id) => API.get(`/users/${id}`);
export const updateUserRole = (id, role) => API.put(`/users/${id}/role`, { role });
export const deactivateUser = (id) => API.put(`/users/${id}/deactivate`);
export const deleteUser = (id) => API.delete(`/users/${id}`);

// Notification endpoints
export const getNotifications = () => API.get('/notifications');
export const getUnreadNotifications = () => API.get('/notifications/unread');
export const getUnreadCount = () => API.get('/notifications/count');
export const markAsRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllAsRead = () => API.put('/notifications/read-all');
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);

export default API;
export const createUser = (data, role) => API.post(`/auth/admin/create-user?role=${role}`, data);