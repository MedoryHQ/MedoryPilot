import { Response, Request } from "express";

export const errorMessages = {
  userNotFound: {
    en: "User not found",
    ka: "მომხმარებელი ვერ მოიძებნა",
  },
  invalidCredentials: {
    en: "Invalid email or password",
    ka: "არასწორი ელ-ფოსტა ან პაროლი",
  },
  invalidRefreshToken: {
    en: "Access denied. Invalid refresh token.",
    ka: "წვდომა უარყოფილია. არასწორი refresh ტოკენი.",
  },
  jwtSecretNotProvided: {
    en: "JWT secrets not provided.",
    ka: "JWT secret-ების მოწოდება აუცილებელია.",
  },
  noTokenProvided: {
    en: "Access denied. No token provided.",
    ka: "წვდომა უარყოფილია. ტოკენის მოწოდება აუცილებელია",
  },
};

type ErrorKey = keyof typeof errorMessages;

export function sendError(
  req: Request,
  res: Response,
  statusCode: number,
  messageKey: ErrorKey
) {
  const lang = (req.headers["accept-language"] || "en").split(",")[0].trim();

  const message =
    errorMessages[messageKey][lang as keyof (typeof errorMessages)[ErrorKey]] ||
    errorMessages[messageKey].en;

  return res.status(statusCode).json({ error: message });
}
