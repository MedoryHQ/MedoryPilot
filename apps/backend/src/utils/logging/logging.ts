import {
  adminErrorLogger,
  adminInfoLogger,
  adminWarnLogger,
  customerErrorLogger,
  customerInfoLogger,
  customerWarnLogger,
  systemErrorLogger,
} from "@/logger";

function logCustomer(
  level: "info" | "warn" | "error",
  message: string,
  meta: Record<string, any> = {},
  error?: any
) {
  const sanitizedMeta = sanitize(meta);
  if (level === "error" && error) {
    customerErrorLogger.error(message, {
      ...sanitizedMeta,
      error: error?.message,
    });
  } else if (level === "warn") {
    customerWarnLogger.warn(message, sanitizedMeta);
  } else {
    customerInfoLogger.info(message, sanitizedMeta);
  }
}

function logAdmin(
  level: "info" | "warn" | "error",
  message: string,
  meta: Record<string, any> = {},
  error?: any
) {
  const sanitizedMeta = sanitize(meta);
  if (level === "error" && error) {
    adminErrorLogger.error(message, {
      ...sanitizedMeta,
      error: error?.message,
    });
  } else if (level === "warn") {
    adminWarnLogger.warn(message, sanitizedMeta);
  } else {
    adminInfoLogger.info(message, sanitizedMeta);
  }
}

export function logCustomerInfo(
  message: string,
  meta: Record<string, any> = {}
) {
  logCustomer("info", message, meta);
}

export function logCustomerWarn(
  message: string,
  meta: Record<string, any> = {}
) {
  logCustomer("warn", message, meta);
}

export function logCustomerError(
  message: string,
  error: any,
  meta: Record<string, any> = {}
) {
  logCustomer("error", message, meta, error);
}

export function logCustomerCatchyError(
  scope: string,
  error: unknown,
  extra: Record<string, any> = {}
) {
  logCustomer("error", scope, extra, error);
}

export function logAdminInfo(message: string, meta: Record<string, any> = {}) {
  logAdmin("info", message, meta);
}

export function logAdminWarn(message: string, meta: Record<string, any> = {}) {
  logAdmin("warn", message, meta);
}

export function logAdminError(
  message: string,
  error: any,
  meta: Record<string, any> = {}
) {
  logAdmin("error", message, meta, error);
}

export function logAdminCatchyError(
  scope: string,
  error: unknown,
  extra: Record<string, any> = {}
) {
  logAdmin("error", scope, extra, error);
}

function sanitize(meta: Record<string, any>) {
  const { phoneNumber, email, personalId, password, ...rest } = meta;
  return rest;
}

export function selectLogger(fullPath: string, level: "error" | "warn") {
  if (fullPath.startsWith("/api/v1/admin")) {
    return level === "error" ? adminErrorLogger : adminWarnLogger;
  } else if (fullPath.startsWith("/api/v1/")) {
    return level === "error" ? customerErrorLogger : customerWarnLogger;
  }
  return systemErrorLogger;
}
