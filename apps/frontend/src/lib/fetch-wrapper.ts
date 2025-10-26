import { AxiosRequestConfig, AxiosResponse } from "axios";
import axiosInstance from "../../api/axios";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const fetchWithRetry = async <T = any>(
  url: string,
  options: AxiosRequestConfig = {}
): Promise<AxiosResponse<T>> => {
  try {
    const response = await axiosInstance.request<T>({
      url: `${API_URL}${url}`,
      withCredentials: true,
      validateStatus: (status) => status < 500,
      ...options,
    });

    return response;
  } catch (err) {
    throw err;
  }
};

export const get = async <T = any>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<T> => {
  const res = await fetchWithRetry<T>(url, { ...config, method: "GET" });
  return res.data;
};

export const post = async <T = any>(
  url: string,
  data?: unknown,
  config: AxiosRequestConfig = {}
): Promise<T> => {
  const res = await fetchWithRetry<T>(url, {
    ...config,
    method: "POST",
    data,
  });
  return res.data;
};

export const put = async <T = any>(
  url: string,
  data?: unknown,
  config: AxiosRequestConfig = {}
): Promise<T> => {
  const res = await fetchWithRetry<T>(url, {
    ...config,
    method: "PUT",
    data,
  });
  return res.data;
};

export const patch = async <T = any>(
  url: string,
  data?: unknown,
  config: AxiosRequestConfig = {}
): Promise<T> => {
  const res = await fetchWithRetry<T>(url, {
    ...config,
    method: "PATCH",
    data,
  });
  return res.data;
};

export const del = async <T = any>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<T> => {
  const res = await fetchWithRetry<T>(url, { ...config, method: "DELETE" });
  return res.data;
};
