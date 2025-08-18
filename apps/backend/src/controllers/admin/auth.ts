import { prisma } from "@/config";
import {
  generateAccessToken,
  generateRefreshToken,
  sendError,
  verifyField,
  cookieOptions,
  logCatchyError,
  logInfo,
  logWarn,
  getClientIp,
  hashIp,
} from "@/utils";
import { NextFunction, Response, Request } from "express";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hashedIp = await getClientIp(req);
    const { email, password } = req.body;

    logInfo("Login attempt", {
      ip: hashedIp,
      path: req.path,
      method: req.method,
    });

    const user = await prisma.admin.findUnique({ where: { email } });
    if (!user) {
      logWarn("Login failed: user not found", { ip: hashedIp, path: req.path });
      return sendError(req, res, 404, "userNotFound");
    }

    const validPassword = await verifyField(password, user.passwordHash);
    if (!validPassword) {
      logWarn("Login failed: invalid password", {
        ip: hashedIp,
        userId: user.id,
      });
      return sendError(req, res, 401, "invalidCredentials");
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

    logInfo("Login success", { ip: hashedIp, userId: user.id });

    return res.json({
      data: {
        user: userData,
        accessToken: access.token,
        refreshToken: refresh.token,
        userType: "ADMIN",
      },
    });
  } catch (error: unknown) {
    const hashedIp = await getClientIp(req);
    logCatchyError("Login exception", error, {
      ip: hashedIp,
    });
    next(error);
  }
};

export const renew = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hashedIp = await getClientIp(req);
    logInfo("Token renew attempt", { ip: hashedIp, userId: req.user?.id });

    const user = await prisma.admin.findUnique({
      where: { id: req.user.id },
      omit: { passwordHash: true },
    });

    if (!user) {
      logWarn("Token renew failed: user not found", {
        ip: hashedIp,
        userId: req.user?.id,
      });
      return sendError(req, res, 404, "userNotFound");
    }

    logInfo("Token renew success", { ip: hashedIp, userId: user.id });

    return res.json({
      data: {
        user,
        userType: "ADMIN",
      },
    });
  } catch (error) {
    const hashedIp = await getClientIp(req);
    logInfo("Token renew exception", { ip: hashedIp, userId: req.user?.id });
    next(error);
  }
};
