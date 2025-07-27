import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (currentPassword, newPassword) => 
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// Coffee Beans API
export const coffeeBeansAPI = {
  getAll: () => api.get('/coffee'),
  getById: (id) => api.get(`/coffee/${id}`),
  create: (data) => api.post('/coffee', data),
  update: (id, data) => api.put(`/coffee/${id}`, data),
  delete: (id) => api.delete(`/coffee/${id}`),
  getByRoastLevel: (level) => api.get(`/coffee/roast/${level}`),
  getByOrigin: (origin) => api.get(`/coffee/origin/${origin}`),
};



// Tasting Notes API
export const tastingNotesAPI = {
  getAll: () => api.get('/tasting'),
  getByBeanId: (id) => api.get(`/tasting/bean/${id}`),
  getByDateRange: (startDate, endDate) => 
    api.get('/tasting/date-range', { params: { start_date: startDate, end_date: endDate } }),
  getTopRated: (limit = 10) => api.get('/tasting/top-rated', { params: { limit } }),
  getStats: () => api.get('/tasting/stats'),
  create: (data) => api.post('/tasting', data),
  update: (id, data) => api.put(`/tasting/${id}`, data),
  delete: (id) => api.delete(`/tasting/${id}`),
  getById: (id) => api.get(`/tasting/${id}`),
};

// Brewing Schedule API
export const brewingAPI = {
  getAll: (params = {}) => api.get('/brewing', { params }),
  getById: (id) => api.get(`/brewing/${id}`),
  getUpcoming: (limit = 5) => api.get(`/brewing/upcoming/limit/${limit}`),
  getStats: () => api.get('/brewing/stats/summary'),
  create: (data) => api.post('/brewing', data),
  update: (id, data) => api.put(`/brewing/${id}`, data),
  delete: (id) => api.delete(`/brewing/${id}`),
};

// Cost Analysis API
export const costAPI = {
  getAll: (params = {}) => api.get('/cost', { params }),
  getMonthly: (year, month) => api.get(`/cost/monthly/${year}/${month}`),
  getAnalysis: () => api.get('/cost/analysis'),
  getROI: () => api.get('/cost/roi'),
  create: (data) => api.post('/cost', data),
};

// Brewing Log API
export const brewingLogAPI = {
  getAll: (params = {}) => api.get('/brewing-log', { params }),
  getStats: () => api.get('/brewing-log/stats'),
  getMethods: () => api.get('/brewing-log/methods'),
  create: (data) => api.post('/brewing-log', data),
};

// Freshness API
export const freshnessAPI = {
  getAlerts: () => api.get('/coffee/freshness/alerts'),
  getSummary: () => api.get('/coffee/freshness/summary'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api; 