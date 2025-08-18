import { Response, Request } from "express";
import { ErrorKey, errorMessages, TranslatedMessage } from "./messages";
import logger from "@/logger";
import { getClientIp } from "../logging";
import { hashIp } from "../security";

export function getResponseMessage(messageKey: ErrorKey): TranslatedMessage {
  return (
    errorMessages[messageKey] || {
      en: "Unknown error",
      ka: "ამოუცნობი შეცდომა",
    }
  );
}

export async function sendError(
  req: Request,
  res: Response,
  statusCode: number,
  messageKey: ErrorKey,
  meta: Record<string, any> = {}
) {
  const message = getResponseMessage(messageKey);

  const clientIp = getClientIp(req);
  const hashedIp = await hashIp(clientIp);

  logger.error("Request failed", {
    timestamp: new Date().toISOString(),
    event: "request_failed",
    statusCode,
    errorKey: messageKey,
    errorMessage: message.en,
    path: req.path,
    method: req.method,
    user: req.user ? { id: req.user.id, ip: hashedIp } : { ip: hashedIp },
    ...meta,
  });

  return res.status(statusCode).json({
    error: message,
  });
}
