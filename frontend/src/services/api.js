import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData)
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  getAll: (role) => api.get('/users', { params: role ? { role } : {} }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
};

// Classes API
export const classAPI = {
  getAll: () => api.get('/classes'),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`)
};

// Enrollments API
export const enrollmentAPI = {
  getMyEnrollments: () => api.get('/enrollments/my-enrollments'),
  enroll: (classId) => api.post('/enrollments', { classId }),
  cancel: (id) => api.delete(`/enrollments/${id}`)
};

// Payments API
export const paymentAPI = {
  getMyPayments: () => api.get('/payments/my-payments'),
  getAll: () => api.get('/payments'),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data)
};

// Attendance API
export const attendanceAPI = {
  getByClass: (classId, date) => api.get(`/attendance/class/${classId}`, { params: { date } }),
  mark: (data) => api.post('/attendance', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  getStudentHistory: (userId) => api.get(`/attendance/student/${userId}`)
};

// Reports API
export const reportAPI = {
  getEnrollmentStats: () => api.get('/reports/enrollment-stats'),
  getRevenue: (startDate, endDate) => api.get('/reports/revenue', { params: { startDate, endDate } }),
  getAttendanceSummary: (classId, startDate, endDate) => api.get('/reports/attendance-summary', { params: { classId, startDate, endDate } }),
  getStudentProgress: (userId) => api.get(`/reports/student-progress/${userId}`)
};

// Accounting API
export const accountingAPI = {
  getExpenses: (params) => api.get('/accounting/expenses', { params }),
  createExpense: (data) => api.post('/accounting/expenses', data),
  updateExpense: (id, data) => api.put(`/accounting/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/accounting/expenses/${id}`),
  getSummary: (startDate, endDate) => api.get('/accounting/summary', { params: { startDate, endDate } }),
  getMonthly: (year) => api.get('/accounting/monthly', { params: { year } })
};

// Branch API
export const branchAPI = {
  getAll: () => api.get('/branches'),
  getById: (id) => api.get(`/branches/${id}`),
  create: (data) => api.post('/branches', data),
  update: (id, data) => api.put(`/branches/${id}`, data),
  delete: (id) => api.delete(`/branches/${id}`)
};

// Saloon API
export const saloonAPI = {
  getAll: (branchId) => api.get('/saloons', { params: branchId ? { branchId } : {} }),
  getByBranch: (branchId) => api.get(`/saloons/branch/${branchId}`),
  getById: (id) => api.get(`/saloons/${id}`),
  create: (data) => api.post('/saloons', data),
  update: (id, data) => api.put(`/saloons/${id}`, data),
  delete: (id) => api.delete(`/saloons/${id}`)
};

// Instructor Payment API
export const instructorPaymentAPI = {
  getAll: () => api.get('/instructor-payments'),
  getByInstructor: (instructorId) => api.get(`/instructor-payments/${instructorId}`),
  save: (data) => api.post('/instructor-payments', data),
  update: (instructorId, data) => api.put(`/instructor-payments/${instructorId}`, data),
  delete: (instructorId) => api.delete(`/instructor-payments/${instructorId}`),
  calculate: (instructorId, startDate, endDate) => api.get(`/instructor-payments/calculate/${instructorId}`, { params: { startDate, endDate } })
};

// Calendar API
export const calendarAPI = {
  getWeekly: (branchId) => api.get('/calendar/weekly', { params: branchId ? { branchId } : {} }),
  getWeeklyByBranch: (branchId) => api.get(`/calendar/weekly/${branchId}`)
};

// Schedule Validation API (part of classes)
export const scheduleAPI = {
  validateSchedule: (data) => api.post('/classes/validate-schedule', data)
};

export default api;
