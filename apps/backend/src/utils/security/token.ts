import { Request } from "express";

export const getTokenFromRequest = (req: Request): string | null => {
  const authHeader = (req.headers["authorization"] ??
    req.headers["Authorization"]) as string | undefined;
  if (
    authHeader &&
    typeof authHeader === "string" &&
    authHeader.startsWith("Bearer ")
  ) {
    return authHeader.slice(7).trim();
  }

  const cookieAccess = req.cookies?.["accessToken"];
  if (cookieAccess) {
    if (typeof cookieAccess === "string") return cookieAccess;
    if (typeof cookieAccess === "object" && (cookieAccess as any).token)
      return (cookieAccess as any).token;
  }

  const signed = (req as any).signedCookies?.["accessToken"];
  if (signed) {
    if (typeof signed === "string") return signed;
    if (typeof signed === "object" && (signed as any).token)
      return (signed as any).token;
  }

  return null;
};
