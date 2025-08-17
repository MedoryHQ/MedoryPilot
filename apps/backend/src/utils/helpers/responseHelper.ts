import { Response, Request } from "express";
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
  req: Request,
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
    path: req.path,
    method: req.method,
    user: req.user ? { id: req.user.id } : { ip: req.ip },
    ...meta,
  });

  return res.status(statusCode).json({
    error: message,
  });
}
