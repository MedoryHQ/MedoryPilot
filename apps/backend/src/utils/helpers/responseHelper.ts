import { Response } from "express";
import { ErrorKey, errorMessages, TranslatedMessage } from "./messages";
import logger from "@/logger";

export function getResponseMessage(messageKey: ErrorKey): TranslatedMessage {
  return (
    errorMessages[messageKey] || {
      en: "Unknown error",
      ka: "ამოუცნობი შეცდომა",
    }
  );
}

export function sendError(
  res: Response,
  statusCode: number,
  messageKey: ErrorKey,
  meta: Record<string, any> = {}
) {
  const message = getResponseMessage(messageKey);

  logger.error("Request failed", {
    statusCode,
    errorKey: messageKey,
    errorMessage: message.en,
    ...meta,
  });

  return res.status(statusCode).json({
    error: message,
  });
}
