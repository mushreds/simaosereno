import axios from 'axios';

const api = axios.create({
  baseURL: '', // Vazio porque o Vite faz o proxy de /api para http://localhost:3001
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getConfig = async () => {
  const response = await api.get('/api/config');
  return response.data;
};

export const getPipelines = async () => {
  const response = await api.get('/api/pipelines');
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get('/api/users');
  return response.data;
};

export const getOverviewMetrics = async (params = {}) => {
  const response = await api.get('/api/metrics/overview', { params });
  return response.data;
};

export const getLeadsList = async (params = {}) => {
  const response = await api.get('/api/leads/list', { params });
  return response.data;
};

export const getSimaoReport = async () => {
  const response = await api.get('/api/metrics/simao-report');
  return response.data;
};

export const getMetaAdsMetrics = async (params = {}) => {
  const response = await api.get('/api/metrics/meta-ads', { params });
  return response.data;
};

export const clearCache = async () => {
  const response = await api.delete('/api/cache/clear');
  return response.data;
};

export default api;
