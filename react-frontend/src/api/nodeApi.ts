import axios from "axios";

const nodeApi = axios.create({
  baseURL: import.meta.env.VITE_NODE_API_URL || "http://localhost:3000/api",
});

nodeApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default nodeApi;
