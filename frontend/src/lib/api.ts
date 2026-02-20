import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE + '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const sendOTP = (email: string, purpose: string) =>
  api.post('/auth/send-otp', { email, purpose });

export const verifyOTP = (email: string, otp: string, purpose: string) =>
  api.post('/auth/verify-otp', { email, otp, purpose });

export const signup = (data: { fullName: string; email: string; mobile: string; password: string; role: string }) =>
  api.post('/auth/signup', data);

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const verifyLoginOTP = (email: string, otp: string) =>
  api.post('/auth/login/verify-otp', { email, otp });

export const upgradeToProvider = () =>
  api.post('/auth/upgrade-provider');
export const getCurrentUser = () =>
  api.get('/users/me');
// ADMIN
export const getPendingProviders = () =>
  api.get("/admin/providers");

export const verifyProvider = (id: string) =>
  api.put(`/admin/verify-provider/${id}`);

// Services
export const getAllServices = () => api.get('/services');
export const getServiceById = (id: string) =>
  api.get(`/services/${id}`);

export const createService = (formData: FormData) =>
  api.post('/services', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });


export const deleteService = (id: string) => api.delete(`/services/${id}`);
export const getNearbyServices = (lat: number, lng: number, radius?: number) =>
  api.get('/services/nearby', { params: { lat, lng, radius } });

// Requests
export const createServiceRequest = (serviceId: string, requestedSlot: string) =>
  api.post('/requests', { serviceId, requestedSlot });
export const getProviderRequests = () => api.get('/requests/provider');
export const getCustomerRequests = () => api.get('/requests/customer');
export const acceptRequest = (requestId: string, bidId: string) =>
  api.post('/requests/accept', { requestId, bidId });
export const cancelRequest = (id: string) => api.delete(`/requests/${id}`);

// Bids
export const placeBid = (serviceRequestId: string, amount: number, message: string) =>
  api.post('/bids', { serviceRequestId, amount, message });
export const getCustomerBids = () => api.get('/bids/customer');
export const withdrawBid = (id: string) => api.delete(`/bids/${id}`);

// Channels
export const getMyChannels = () => api.get('/channels');

// Messages
export const sendMessage = (channelId: string, text: string) =>
  api.post('/messages', { channelId, text });
export const getChannelMessages = (channelId: string) =>
  api.get(`/messages/${channelId}`);
export const markAsRead = (channelId: string) =>
  api.post('/messages/read', { channelId });

// Provider
export const getProviderProfile = (providerId: string) =>
  api.get(`/providers/${providerId}`);

// User
export const updateProfile = (data: { fullName: string; mobile: string }) =>
  api.put('/users/me', data);
// Password
export const forgotPassword = (email: string) =>
  api.post('/password/forgot-password', { email });

export const resetPassword = (token: string, newPassword: string) =>
  api.post('/password/reset-password', { token, newPassword });
export const updateService = (id: string, data: any) =>
  api.put(`/services/${id}`, data);
// Chatbot
export const sendChatMessage = (message: string) =>
  api.post('/chat', { message });
export const getServiceRequestById = (id: string) =>
  api.get(`/requests/${id}`);

/* ================= PAYMENT ================= */
// ================= PAYMENT =================

export const requestPayment = (requestId: string) =>
  api.post(`/requests/${requestId}/request-payment`);

export const createPayment = (requestId: string) =>
  api.post(`/requests/${requestId}/create-payment`);

export const confirmPayment = (paymentId: string) =>
  api.post(`/requests/confirm-payment`, { paymentId });

export const verifyPayment = (requestId: string) =>
  api.post(`/requests/${requestId}/verify-payment`);



export { API_BASE };
export default api;
