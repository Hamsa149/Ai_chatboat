import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const chatAPI = {
  sendMessage: async (message, sessionId) => {
    const res = await api.post('/api/chat/send', { message, sessionId });
    return res.data;
  },
  getHistory: async (sessionId) => {
    const res = await api.get(`/api/chat/history/${sessionId}`);
    return res.data;
  },
  clearHistory: async (sessionId) => {
    const res = await api.delete(`/api/chat/history/${sessionId}`);
    return res.data;
  },
  getSessions: async () => {
    const res = await api.get('/api/chat/sessions');
    return res.data;
  },
};

export default api;
