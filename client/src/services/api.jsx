import axios from "axios";

// Use Vite env variable instead of process.env
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) =>
    apiClient.post("/auth/login", { email, password }),
  getCurrentUser: () => apiClient.get("/auth/me"),
  refreshToken: () => apiClient.post("/auth/refresh"),
};

// Users API
export const usersAPI = {
  getAll: (page, limit, search) =>
    apiClient.get("/users", { params: { page, limit, search } }),
  getById: (id) => apiClient.get(`/users/${id}`),
  create: (data) => apiClient.post("/users", data),
  update: (id, data) => apiClient.put(`/users/${id}`, data),
  delete: (id) => apiClient.delete(`/users/${id}`),
};

// Sheets API
export const sheetsAPI = {
  getAll: (page, limit, search, archived) =>
    apiClient.get("/sheets", { params: { page, limit, search, archived } }),
  getById: (id) => apiClient.get(`/sheets/${id}`),
  create: (data) => apiClient.post("/sheets", data),
  update: (id, data) => apiClient.put(`/sheets/${id}`, data),
  delete: (id) => apiClient.delete(`/sheets/${id}`),
};

// Sheet Cells API
export const cellsAPI = {
  getAll: (sheetId, page, limit) =>
    apiClient.get(`/sheets/${sheetId}/cells`, { params: { page, limit } }),
  save: (sheetId, data) => apiClient.post(`/sheets/${sheetId}/cells`, data),
  delete: (sheetId, row, col) =>
    apiClient.delete(`/sheets/${sheetId}/cells/${row}/${col}`),
};

// Sheet Sharing API
export const sharingAPI = {
  getShares: (sheetId) => apiClient.get(`/sheets/${sheetId}/shares`),
  share: (sheetId, data) => apiClient.post(`/sheets/${sheetId}/share`, data),
  updatePermission: (sheetId, userId, data) =>
    apiClient.put(`/sheets/${sheetId}/shares/${userId}`, data),
  removeShare: (sheetId, userId) =>
    apiClient.delete(`/sheets/${sheetId}/shares/${userId}`),
};

// Notifications API
export const notificationsAPI = {
  getAll: (page, limit, isRead) =>
    apiClient.get("/notifications", {
      params: { page, limit, is_read: isRead },
    }),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.put("/notifications/read-all"),
  delete: (id) => apiClient.delete(`/notifications/${id}`),
  getUnreadCount: () => apiClient.get("/notifications/unread-count"),
};

// Activity Logs API
export const logsAPI = {
  getAll: (page, limit, action, entityType, userId, startDate, endDate) =>
    apiClient.get("/activity-logs", {
      params: {
        page,
        limit,
        action,
        entity_type: entityType,
        user_id: userId,
        startDate,
        endDate,
      },
    }),
  getByUser: (userId, page, limit) =>
    apiClient.get(`/activity-logs/user/${userId}`, { params: { page, limit } }),
};

// Branches API
export const branchesAPI = {
  getAll: (page, limit, search) =>
    apiClient.get("/branches", { params: { page, limit, search } }),
  getById: (id) => apiClient.get(`/branches/${id}`),
  create: (data) => apiClient.post("/branches", data),
  update: (id, data) => apiClient.put(`/branches/${id}`, data),
  delete: (id) => apiClient.delete(`/branches/${id}`),
  getUsers: (id, page, limit) =>
    apiClient.get(`/branches/${id}/users`, { params: { page, limit } }),
};

// Export grouped API object
export const api = {
  authAPI,
  usersAPI,
  sheetsAPI,
  cellsAPI,
  sharingAPI,
  notificationsAPI,
  logsAPI,
  branchesAPI,
};

export default apiClient;
