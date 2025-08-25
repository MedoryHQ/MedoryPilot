import jwt from "jsonwebtoken";
import { getEnvVariable, prisma } from "@/config";
import { User } from "@/types/global";

const ACCESS_TOKEN_EXPIRES_IN = "1h";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

const ACCESS_TOKEN_EXPIRES_MS = 60 * 60 * 1000;
const REFRESH_TOKEN_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;

const STAGE_TOKEN_EXPIRES_IN = "5m";
const STAGE_TOKEN_EXPIRES_MS = 5 * 60 * 1000;

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
      ? getEnvVariable("JWT_ACCESS_SECRET")
      : getEnvVariable("ADMIN_JWT_ACCESS_SECRET");

  if (!secret) throw new Error("JWT secret not provided");

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
      ? getEnvVariable("JWT_REFRESH_SECRET")
      : getEnvVariable("ADMIN_JWT_REFRESH_SECRET");

  if (!secret) throw new Error("JWT secret not provided");

  const token = jwt.sign(payload, secret, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  return {
    token,
    expiresIn: REFRESH_TOKEN_EXPIRES_MS,
  };
};

export const verifyRefreshToken = async (refreshToken: string) => {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken) {
    throw new Error("Refresh token not found or revoked");
  }

  if (new Date(storedToken.expiresAt) < new Date()) {
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    throw new Error("Refresh token expired");
  }

  const secret = getEnvVariable("JWT_REFRESH_SECRET");
  if (!secret) throw new Error("JWT secret not provided");

  try {
    return jwt.verify(refreshToken, secret) as {
      id: string;
      phoneNumber: string;
    };
  } catch {
    throw new Error("Invalid refresh token");
  }
};

export const checkRefreshToken = (refreshToken: string) => {
  const secret = getEnvVariable("JWT_REFRESH_SECRET");

  try {
    const decoded = jwt.verify(refreshToken, secret) as {
      id: string;
      phoneNumber: string;
    };
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired refresh token.");
  }
};

export const generateTokens = async (user: User, userType: string) => {
  let accessSecret =
    (userType === "USER"
      ? getEnvVariable("JWT_ACCESS_SECRET")
      : getEnvVariable("ADMIN_JWT_ACCESS_SECRET")) || "";
  let refreshSecret =
    (userType === "USER"
      ? getEnvVariable("JWT_REFRESH_SECRET")
      : getEnvVariable("ADMIN_JWT_REFRESH_SECRET")) || "";

  if (!accessSecret || !refreshSecret) {
    throw new Error("JWT secrets are not provided");
  }

  const accessToken = jwt.sign(user, accessSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(user, refreshSecret, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  return {
    accessToken,
    refreshToken,
    accessTokenExpires: ACCESS_TOKEN_EXPIRES_MS,
    refreshTokenExpires: REFRESH_TOKEN_EXPIRES_MS,
  };
};

export const generateStageToken = (
  id: string,
  remember: boolean
): TokenResponse => {
  const payload = { id, remember };

  const secret = getEnvVariable("STAGE_JWT_SECRET");

  if (!secret) throw new Error("Stage JWT secret not provided");

  const token = jwt.sign(payload, secret, {
    expiresIn: STAGE_TOKEN_EXPIRES_IN,
  });

  return {
    token,
    expiresIn: STAGE_TOKEN_EXPIRES_MS,
  };
};
