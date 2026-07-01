import axios from 'axios';
import { useAuthStore } from './store';

const NEST_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${NEST_URL}/api/v1`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach in-memory access token to every NestJS request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401: try refresh once via internal Next.js route, then retry
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise<string>((resolve) => {
        refreshQueue.push(resolve);
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    isRefreshing = true;
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' });
      if (!res.ok) throw new Error('refresh_failed');

      const { accessToken } = await res.json();
      useAuthStore.getState().setToken(accessToken);

      refreshQueue.forEach((cb) => cb(accessToken));
      refreshQueue = [];

      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch {
      refreshQueue = [];
      await useAuthStore.getState().logout();
      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

// Auth — routed through Next.js internal API (handles httpOnly cookies)
export const authApi = {
  login: async (data: { identifier: string; password: string }) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw { response: { data: json, status: res.status } };
    return { data: json };
  },
  logout: () => fetch('/api/auth/logout', { method: 'POST' }),
  me: () =>
    fetch('/api/auth/me', { cache: 'no-store' }).then(async (r) => {
      const json = await r.json();
      if (!r.ok) throw { response: { data: json, status: r.status } };
      return { data: json };
    }),
};

export const clinicsApi = {
  list: () => api.get('/clinics'),
  nearby: (lat: number, lng: number) => api.get(`/clinics/nearby?lat=${lat}&lng=${lng}`),
  create: (data: any) => api.post('/clinics', data),
  update: (id: string, data: any) => api.patch(`/clinics/${id}`, data),
  delete: (id: string) => api.delete(`/clinics/${id}`),
};

export const patientsApi = {
  list: () => api.get('/patients'),
  get: (id: string) => api.get(`/patients/${id}`),
  create: (data: any) => api.post('/patients', data),
  update: (id: string, data: any) => api.patch(`/patients/${id}`, data),
};

export const appointmentsApi = {
  list: (params?: any) => api.get('/appointments', { params }),
  get: (id: string) => api.get(`/appointments/${id}`),
  create: (data: any) => api.post('/appointments', data),
  updateStatus: (id: string, data: any) => api.patch(`/appointments/${id}/status`, data),
  delete: (id: string) => api.delete(`/appointments/${id}`),
};

export const onkoAiApi = {
  upload: (formData: FormData) =>
    api.post('/onko-ai/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  results: (clinicId?: string) => api.get('/onko-ai/results', { params: { clinicId } }),
  byPatient: (patientId: string) => api.get(`/onko-ai/results/${patientId}/patient`),
  review: (id: string, data: any) => api.patch(`/onko-ai/results/${id}/review`, data),
};

export const docDigitizerApi = {
  upload: (formData: FormData) =>
    api.post('/doc-digitizer/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  list: () => api.get('/doc-digitizer'),
  get: (id: string) => api.get(`/doc-digitizer/${id}`),
  update: (id: string, data: any) => api.patch(`/doc-digitizer/${id}`, data),
  export: (id: string) => api.get(`/doc-digitizer/export/${id}`, { responseType: 'blob' }),
};

export const dimedApi = {
  query: (data: { question: string; sessionId?: string }) =>
    api.post('/dimed-assistant/query', data),
  stats: () => api.get('/dimed-assistant/dashboard-stats'),
};

export const patientAssistantApi = {
  symptomCheck: (data: { symptomText: string; sessionId?: string }) =>
    api.post('/patient-assistant/symptom-check', data),
  nearbyClinics: (lat: number, lng: number) =>
    api.get(`/patient-assistant/nearby-clinics?lat=${lat}&lng=${lng}`),
  notifyDoctor: (data: any) => api.post('/patient-assistant/notify-doctor', data),
};

export const doctorsApi = {
  list: (clinicId?: string) => api.get('/doctors', { params: clinicId ? { clinicId } : {} }),
  get: (id: string) => api.get(`/doctors/${id}`),
  create: (data: any) => api.post('/doctors', data),
  update: (id: string, data: any) => api.patch(`/doctors/${id}`, data),
  remove: (id: string) => api.delete(`/doctors/${id}`),
};

export const departmentsApi = {
  list: (clinicId?: string) => api.get('/departments', { params: clinicId ? { clinicId } : {} }),
};

export const notificationsApi = {
  list: (unreadOnly?: boolean) => api.get('/notifications', { params: { unreadOnly } }),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  savePushSubscription: (sub: any) => api.post('/notifications/push-subscription', sub),
};
