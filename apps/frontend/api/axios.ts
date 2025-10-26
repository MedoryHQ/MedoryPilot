import axios, {
  AxiosError,
  CreateAxiosDefaults,
  InternalAxiosRequestConfig,
} from "axios";

const baseConfig: CreateAxiosDefaults = {
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  withCredentials: true,
  validateStatus: (status) => status < 300,

  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
};

export const instanceWithoutInterceptors = axios.create(baseConfig);

const instance = axios.create(baseConfig);

instance.interceptors.request.use(
  function (config: InternalAxiosRequestConfig) {
    return config;
  },
  function (error: AxiosError) {
    return Promise.reject(error);
  }
);

export default instance;
