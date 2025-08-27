import { Response } from "express";
import {
  cookieOptions,
  generateAccessToken,
  generateRefreshToken,
  getResponseMessage,
} from "@/utils";

export const issueAdminTokens = (
  res: Response,
  admin: { id: string; email: string },
  remember: boolean
) => {
  const payload = { id: admin.id, email: admin.email };
  const access = generateAccessToken(payload, "ADMIN");
  const refresh = generateRefreshToken(payload, "ADMIN");

  res.cookie("accessToken", access.token, {
    ...cookieOptions,
    maxAge: remember ? refresh.expiresIn : undefined,
  });
  res.cookie("refreshToken", refresh.token, {
    ...cookieOptions,
    maxAge: remember ? refresh.expiresIn : undefined,
  });

  return {
    message: getResponseMessage("loginSuccessful"),
    data: { user: { email: admin.email } },
  };
};
