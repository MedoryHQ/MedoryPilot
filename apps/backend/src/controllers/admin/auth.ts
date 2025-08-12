import { prisma } from "../../config";
import {
  adminErrorMessages,
  generateAccessToken,
  generateRefreshToken,
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
      return res.status(404).json({
        error: adminErrorMessages.userNotFound,
      });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({
        error: adminErrorMessages.invalidCredentials,
      });
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
