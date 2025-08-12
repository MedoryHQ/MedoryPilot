import { prisma } from "../../config";
import {
  generateAccessToken,
  generateRefreshToken,
  sendError,
} from "../../utils";
import bcrypt from "bcrypt";
import { NextFunction, Response, Request } from "express";
import { cookieOptions } from "../../utils/constants";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.admin.findUnique({ where: { email } });
    if (!user) {
      return sendError(req, res, 404, "userNotFound");
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
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

    return res.json({
      data: {
        user: userData,
        accessToken: access.token,
        refreshToken: refresh.token,
        userType: "ADMIN",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const renew = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await prisma.admin.findUnique({
      where: { id: req.user.id },
      omit: { passwordHash: true },
    });

    if (!user) return sendError(req, res, 404, "userNotFound");

    return res.json({
      data: {
        user,
        userType: "ADMIN",
      },
    });
  } catch (error) {
    next(error);
  }
};
