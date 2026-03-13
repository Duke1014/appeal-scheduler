import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (formData: FormData) =>
    api.post('/auth/register', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  login: (email: string, password: string) => {
    const fd = new FormData();
    fd.append('email', email);
    fd.append('password', password);
    return api.post('/auth/login', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const usersApi = {
  me: ()                              => api.get('/users/me'),
  list: ()                            => api.get('/users/'),
  get: (id: number)                   => api.get(`/users/${id}`),
  update: (id: number, data: object)  => api.patch(`/users/${id}`, data),
  uploadPhoto: (id: number, file: File) => {
    const fd = new FormData();
    fd.append('photo', file);
    return api.post(`/users/${id}/photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  delete: (id: number)                => api.delete(`/users/${id}`),
};

// ── Events ────────────────────────────────────────────────────────────────────

export const eventsApi = {
  list: ()                                => api.get('/events/'),
  get: (id: number)                       => api.get(`/events/${id}`),
  create: (data: object)                  => api.post('/events/', data),
  update: (id: number, data: object)      => api.patch(`/events/${id}`, data),
  delete: (id: number)                    => api.delete(`/events/${id}`),
  addAssignment: (eventId: number, assignmentId: number) =>
    api.post(`/events/${eventId}/assignments/${assignmentId}`),
  removeAssignment: (eventId: number, assignmentId: number) =>
    api.delete(`/events/${eventId}/assignments/${assignmentId}`),
};

// ── Assignments ───────────────────────────────────────────────────────────────

export const assignmentsApi = {
  list: ()                                => api.get('/assignments/'),
  my: ()                                  => api.get('/assignments/my'),
  get: (id: number)                       => api.get(`/assignments/${id}`),
  create: (data: object)                  => api.post('/assignments/', data),
  update: (id: number, data: object)      => api.patch(`/assignments/${id}`, data),
  delete: (id: number)                    => api.delete(`/assignments/${id}`),
  assignVolunteer: (assignmentId: number, userId: number) =>
    api.post(`/assignments/${assignmentId}/volunteers/${userId}`),
  unassignVolunteer: (assignmentId: number, userId: number) =>
    api.delete(`/assignments/${assignmentId}/volunteers/${userId}`),
};

// ── Surveys ───────────────────────────────────────────────────────────────────

export const surveysApi = {
  submit: (data: object)    => api.post('/surveys/', data),
  my: ()                    => api.get('/surveys/my'),
  currentWeek: ()           => api.get('/surveys/current-week'),
  adminAll: (weekStart?: string) =>
    api.get('/surveys/admin/all', weekStart ? { params: { week_start: weekStart } } : {}),
  withNotes: ()             => api.get('/surveys/admin/with-notes'),
};