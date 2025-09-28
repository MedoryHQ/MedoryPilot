import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getEnvVariable } from "@/config";
import { User } from "@/types/global";
import {
  getTokenFromRequest,
  sendError,
  logAdminWarn as logWarn,
  logAdminError as logCatchyError,
  getClientIp,
} from "@/utils";

type TokenPayload = JwtPayload & User;

export const adminAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = getTokenFromRequest(req);
  const refreshToken = req.cookies?.["refreshToken"];

  if (!accessToken || !refreshToken) {
    logWarn("Admin authentication failed: no tokens provided", {
      ip: (req as any).hashedIp,
      event: "admin_authenticate_no_tokens",
    });
    return sendError(req, res, 401, "noTokenProvided");
  }

  const accessSecret = getEnvVariable("ADMIN_JWT_ACCESS_SECRET");
  const refreshSecret = getEnvVariable("ADMIN_JWT_REFRESH_SECRET");
  if (!accessSecret || !refreshSecret) {
    logWarn("JWT secrets missing", {
      ip: (req as any).hashedIp,
      event: "admin_jwt_secret_missing",
    });

    return sendError(req, res, 500, "jwtSecretNotProvided");
  }

  try {
    const decoded = jwt.verify(accessToken, accessSecret) as TokenPayload;
    req.user = decoded;
    return next();
  } catch (accessError) {
    try {
      const decodedRefresh = jwt.verify(
        refreshToken,
        refreshSecret
      ) as TokenPayload;

      const newAccessToken = jwt.sign(decodedRefresh, accessSecret, {
        expiresIn: "1d",
      });
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        sameSite: "strict",
      });

      req.user = decodedRefresh;
      return next();
    } catch (refreshError) {
      logCatchyError("admin authenticate failed", refreshError, {
        ip: (req as any).hashedIp,
        event: "admin_authenticate_failed",
      });
      return sendError(req, res, 401, "adminAuthenticateFailed");
    }
  }
};

export const isAdminVerified = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stageToken = req.cookies.admin_verify_stage;

    if (!stageToken) {
      logWarn("Admin verification failed: code expired", {
        ip: (req as any).hashedId,
        id: (req as any).userId,
        event: "admin_verification_failed",
      });
      return sendError(req, res, 401, "verificationRequired");
    }

    const decoded = jwt.verify(
      stageToken,
      getEnvVariable("STAGE_JWT_SECRET")
    ) as { id: string; remember?: boolean };

    (req as any).userId = decoded.id;
    (req as any).remember = decoded.remember ?? false;

    next();
  } catch (error) {
    logCatchyError("refreshToken verification failed", error, {
      ip: (req as any).hashedIp,
      event: "refresh_token_failed",
    });
    return sendError(req, res, 401, "invalidRefreshToken");
  }
};

export const determineAdminIp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hashedIp = await getClientIp(req);
    (req as any).hashedIp = hashedIp;
    next();
  } catch (error) {
    logCatchyError("Determine admin IP failed", error, {
      event: "admin_determine_ip_exception",
    });
    return sendError(req, res, 401, "determineIpFailed");
  }
};
