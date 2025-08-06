import jwt from "jsonwebtoken";
import { getEnvVariable } from "../config";
import { prisma } from "../config/prisma";

const ACCESS_TOKEN_EXPIRES_IN = "1h";
const REFRESH_TOKEN_EXPIRES_IN = "30d";

const ACCESS_TOKEN_EXPIRES_MS = 60 * 60 * 1000;
const REFRESH_TOKEN_EXPIRES_MS = 30 * 24 * 60 * 60 * 1000;

type TokenType = "USER" | "ADMIN";

interface TokenResponse {
  token: string;
  expiresIn: number;
}

export const generateAccessToken = (
  payload: object,
  type: TokenType
): TokenResponse => {
  const secret =
    type === "USER"
      ? getEnvVariable("jwtAccessSecret")
      : getEnvVariable("adminJwtAccessSecret");

  const token = jwt.sign(payload, secret, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

  return {
    token,
    expiresIn: ACCESS_TOKEN_EXPIRES_MS,
  };
};

export const generateRefreshToken = (
  payload: object,
  type: TokenType
): TokenResponse => {
  const secret =
    type === "USER"
      ? getEnvVariable("jwtRefreshSecret")
      : getEnvVariable("adminJwtRefreshSecret");

  const token = jwt.sign(payload, secret, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  return {
    token,
    expiresIn: REFRESH_TOKEN_EXPIRES_MS,
  };
};

export const verifyRefreshToken = async (refreshToken: string) => {
  const secret = getEnvVariable("jwtRefreshSecret");

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken) {
    throw new Error("Refresh token not found or already revoked.");
  }

  if (new Date(storedToken.expiresAt) < new Date()) {
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    throw new Error("Refresh token has expired.");
  }

  try {
    const decoded = jwt.verify(refreshToken, secret) as {
      id: string;
      email: string;
    };
    return decoded;
  } catch (error) {
    throw new Error("Invalid refresh token.");
  }
};

export const checkRefreshToken = (refreshToken: string) => {
  const secret = getEnvVariable("jwtRefreshSecret");

  try {
    const decoded = jwt.verify(refreshToken, secret) as {
      id: string;
      email: string;
    };
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired refresh token.");
  }
};
