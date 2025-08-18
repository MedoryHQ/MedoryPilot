import logger from "@/logger";

export function logCatchyError(
  scope: string,
  error: unknown,
  extra: Record<string, any> = {}
) {
  if (error instanceof Error) {
    logger.error(scope, {
      message: error.message,
      stack: error.stack,
      ...extra,
    });
  } else {
    logger.error(scope, { error, ...extra });
  }
}

export function logInfo(message: string, meta: Record<string, any> = {}) {
  logger.info(message, sanitize(meta));
}

export function logWarn(message: string, meta: Record<string, any> = {}) {
  logger.warn(message, sanitize(meta));
}

export function logError(
  message: string,
  error: any,
  meta: Record<string, any> = {}
) {
  logger.error(message, { ...sanitize(meta), error: error?.message });
}

function sanitize(meta: Record<string, any>) {
  const { phoneNumber, email, personalId, password, ...rest } = meta;
  return rest;
}
