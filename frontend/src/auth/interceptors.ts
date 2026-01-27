import axios from "axios";
import { getENVData } from "./environment";
import { tryLogout, verifyToken } from "./auth.v2";

// Create axios instance (so you don’t mess up global axios everywhere)
export const api = axios.create({
  baseURL: getENVData().baseURL, // adjust
});

// Request interceptor → attach token
api.interceptors.request.use((config) => {
  const tokenInfo = localStorage.getItem("token");
  if (tokenInfo) {
    const parsed = JSON.parse(tokenInfo);
    config.headers.Authorization = `Bearer ${parsed.access_token}`;
  }
  console.log(config, "config");

  return config;
});

// Response interceptor → refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const isVerified = await verifyToken(); // refresh using your function
      console.log(isVerified, "isVerified");

      if (isVerified) {
        // const tokenInfo = JSON.parse(localStorage.getItem("token") || "{}");
        // originalRequest.headers.Authorization = `Bearer ${tokenInfo.access_token}`;
        return api(originalRequest); // retry the failed request
      } else {
        // Refresh failed → log out user
        tryLogout();
      }
    }

    return Promise.reject(error);
  }
);
