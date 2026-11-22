import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
  timeout: 180000
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
  const response = await API.get("/health");
  return response.data;
};

export default API;