import { useAuthStore } from "@/store";
import { ADMIN_API_PATH } from "@/utils";
import axiosInstance, { CreateAxiosDefaults } from "axios";

const baseConfig: CreateAxiosDefaults = {
  baseURL: ADMIN_API_PATH,
  withCredentials: true
};

const getToken = () => {
  const state = useAuthStore.getState();
  return state.accessToken;
};

export const instanceWithoutInterceptors = axiosInstance.create(baseConfig);

const axios = axiosInstance.create(baseConfig);

axios.interceptors.request.use(
  function (config) {
    const accessToken = getToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default axios;
