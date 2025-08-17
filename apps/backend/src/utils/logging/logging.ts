import logger from "@/logger";

export function logError(
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
