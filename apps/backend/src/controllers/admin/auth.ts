import { prisma } from "@/config";
import {
  generateAccessToken,
  generateRefreshToken,
  sendError,
  verifyField,
  cookieOptions,
  logError,
} from "@/utils";
import { NextFunction, Response, Request } from "express";
import logger from "@/logger";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    logger.info("Login attempt", { email, ip: req.ip });

    const user = await prisma.admin.findUnique({ where: { email } });
    if (!user) {
      return sendError(res, 404, "userNotFound");
    }

    const validPassword = await verifyField(password, user.passwordHash);
    if (!validPassword) {
      return sendError(res, 401, "invalidCredentials");
    }

    const payload = { id: user.id, email: user.email };

    const access = generateAccessToken(payload, "ADMIN");
    const refresh = generateRefreshToken(payload, "ADMIN");

    const { passwordHash, ...userData } = user;

    res.cookie("accessToken", access.token, {
      ...cookieOptions,
      maxAge: access.expiresIn,
    });
    res.cookie("refreshToken", refresh.token, {
      ...cookieOptions,
      maxAge: refresh.expiresIn,
    });

    logger.info("Login success", { userId: user.id, email: user.email });

    return res.json({
      data: {
        user: userData,
        accessToken: access.token,
        refreshToken: refresh.token,
        userType: "ADMIN",
      },
    });
  } catch (error: unknown) {
    logError("Login exception", error, { email: req.body.email, ip: req.ip });
    next(error);
  }
};

export const renew = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info("Token renew attempt", { userId: req.user?.id, ip: req.ip });

    const user = await prisma.admin.findUnique({
      where: { id: req.user.id },
      omit: { passwordHash: true },
    });

    if (!user) return sendError(res, 404, "userNotFound");

    logger.info("Token renew success", { userId: user.id, email: user.email });

    return res.json({
      data: {
        user,
        userType: "ADMIN",
      },
    });
  } catch (error) {
    logError("Renew exception", error, { userId: req.user?.id });
    next(error);
  }
};
