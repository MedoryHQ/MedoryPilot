import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

import { userAuthRouter } from "@/routes/customer";
import { prisma } from "@/config";
import {
  verifyField,
  generateTokens,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  errorMessages,
} from "@/utils";
import { authMatchers } from "@/tests/helpers/authMatchers";
expect.extend(authMatchers);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/auth", userAuthRouter);

jest.mock("@/config", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    pendingUser: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
  getEnvVariable: jest.fn((key: string) => {
    if (key === "USER_JWT_ACCESS_SECRET") return "accessSecret";
    if (key === "USER_JWT_REFRESH_SECRET") return "refreshSecret";
    return "test";
  }),
}));

jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

jest.mock("@/utils", () => {
  const actual = jest.requireActual("@/utils");

  const errorMessages = {
    ...((actual as any).errorMessages ?? {}),
    userNotFound: { en: "User not found", ka: "მომხმარებელი ვერ მოიძებნა" },
    invalidPassword: { en: "Invalid password", ka: "არასწორი პაროლი" },
    unauthorized: { en: "Unauthorized", ka: "უსურვებელი" },
    invalidRefreshToken: {
      en: "Access denied. Invalid refresh token.",
      ka: "არასწორი refresh ტოკენი",
    },
    phoneAlreadyExists: {
      en: "Phone already exists",
      ka: "ტელეფონი უკვე არსებობს",
    },
    smsVerificationSent: { en: "smsVerificationSent", ka: "sent" },
    verificationSuccessful: { en: "verificationSuccessful", ka: "ok" },
    loginSuccessful: { en: "loginSuccessful", ka: "ok" },
  };

  return {
    ...actual,
    getClientIp: jest.fn().mockResolvedValue("hashedIp"),
    verifyField: jest.fn(),
    generateTokens: jest.fn(),
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
    createPassword: jest.fn(),
    generateSmsCode: jest.fn(),
    inMinutes: (mins: number) => new Date(Date.now() + mins * 60 * 1000),
    errorMessages,
    cookieOptions: { path: "/", httpOnly: true, sameSite: "lax" },
    getResponseMessage: jest.fn((k: string) => k),

    // 👇 add mocks for missing loggers
    selectLogger: jest.fn(() => ({
      warn: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    })),
    logCustomerCatchyError: jest.fn(),
    logCustomerInfo: jest.fn(),
    logCustomerWarn: jest.fn(),
  };
});

const mockUser = {
  id: "user-1",
  phoneNumber: "+1234567890",
  passwordHash: "hashedPass",
  firstName: "John",
  lastName: "Doe",
  fullName: "John Doe",
  isVerified: true,
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Customer auth routes — /auth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /auth/register", () => {
    it.todo(
      "registers a pending user successfully and returns id + phoneNumber"
    );

    it.todo("returns 409 when pending user with phone already exists");
    it.todo("returns 400 when validation fails (missing/invalid fields)");
  });

  describe("POST /auth/login", () => {
    it.todo("logs in successfully with valid credentials and sets cookies");

    it.todo("returns 404 when user not found");

    it.todo("returns 400 when password invalid");

    it.todo("returns 400 when validation fails (missing/invalid fields)");

    it.todo("returns 500 when token generation fails");
  });

  describe("POST /auth/refresh-token", () => {
    it.todo("returns 401 if no refresh cookie provided");

    it.todo("returns 401 if refresh token invalid");

    it.todo("successfully refreshes tokens and sets cookies");

    it.todo("returns 500 if an unexpected error occurs during refresh");
  });
});
