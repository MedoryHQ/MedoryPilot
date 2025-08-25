import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getEnvVariable } from "@/config";
import { User } from "@/types/global";
import { getTokenFromRequest, sendError } from "@/utils";

type TokenPayload = JwtPayload & User;

export const adminAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = getTokenFromRequest(req);
  const refreshToken = req.cookies?.["refreshToken"];

  if (!accessToken || !refreshToken) {
    return sendError(req, res, 401, "noTokenProvided");
  }

  const accessSecret = getEnvVariable("ADMIN_JWT_ACCESS_SECRET");
  const refreshSecret = getEnvVariable("ADMIN_JWT_REFRESH_SECRET");

  if (!accessSecret || !refreshSecret) {
    return sendError(req, res, 500, "jwtSecretNotProvided");
  }

  try {
    const decoded = jwt.verify(accessToken, accessSecret) as TokenPayload;
    req.user = decoded;
    return next();
  } catch {
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
    } catch {
      return sendError(req, res, 401, "invalidRefreshToken");
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

    if (!stageToken) return sendError(req, res, 401, "verificationRequired");

    const decoded = jwt.verify(
      stageToken,
      getEnvVariable("STAGE_JWT_SECRET")
    ) as { id: string; remember?: boolean };

    (req as any).userId = decoded.id;
    (req as any).remember = decoded.remember ?? false;

    next();
  } catch (error) {
    console.error("JWT verify error:", error);
    return sendError(req, res, 401, "verificationExpired");
  }
};
