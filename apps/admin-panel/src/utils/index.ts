export * from "./ant";
export * from "./api";
export * from "./date";
export * from "./errors";
export * from "./i18n";
export * from "./navigation";
export * from "./utils";
export * from "./phone";

export const VITE_API_URL = import.meta.env.VITE_API_URL;
export const API_PATH = `${VITE_API_URL}/api/v1`;
export const ADMIN_API_PATH = `${API_PATH}/admin`;
