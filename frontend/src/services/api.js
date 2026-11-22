import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 180000,
});

export const sendMessage = async (query) => {
  const response = await API.post("/chat/", { query });
  return response.data;
};

export const getOverview = async () => {
  const response = await API.get("/analytics/overview");
  return response.data;
};

export const getModelUsage = async () => {
  const response = await API.get("/analytics/models");
  return response.data;
};

export const getHistory = async (limit = 20) => {
  const response = await API.get(`/analytics/history?limit=${limit}`);
  return response.data;
};

export const deleteHistoryRecord = async (id) => {
  const response = await API.delete(`/analytics/history/${id}`);
  return response.data;
};

export const clearHistory = async () => {
  const response = await API.delete("/analytics/history");
  return response.data;
};

export const getCache = async () => {
  const response = await API.get("/cache/");
  return response.data;
};

export const getCacheStats = async () => {
  const response = await API.get("/cache/stats");
  return response.data;
};

export const clearCache = async () => {
  const response = await API.delete("/cache/");
  return response.data;
};

export const checkHealth = async () => {
  const response = await axios.get(`${BASE_URL}/health`);
  return response.data;
};

export default API;