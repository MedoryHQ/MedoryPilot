import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

import { userAuthRouter } from "@/routes/customer";
import { prisma } from "@/config";

import { authMatchers } from "@/tests/helpers/authMatchers";
expect.extend(authMatchers);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/auth", userAuthRouter);

jest.mock("@/config", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
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
    getResponseMessage: jest.fn((k: string) => k),
    errorMessages: {
      ...((actual as any).errorMessages ?? {}),
      userNotFound: { en: "User not found", ka: "მომხმარებელი ვერ მოიძებნა" },
      invalidPassword: {
        en: "Invalid password",
        ka: "პაროლი არასწორია",
      },
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
    },
    cookieOptions: { path: "/", httpOnly: true, sameSite: "lax" },
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
  phoneNumber: "+995555555555",
  passwordHash: "hashedPass",
  firstName: "John",
  lastName: "Doe",
  fullName: "John Doe",
  isVerified: true,
};

const getRegisterPayload = (overrides = {}) => ({
  phoneNumber: "+995555555555",
  firstName: "Alice",
  lastName: "Smith",
  dateOfBirth: "1990-01-01",
  personalId: "123456789",
  password: "Password123!",
  confirmPassword: "Password123!",
  ...overrides,
});

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
    it("registers a pending user successfully and returns id + phoneNumber", async () => {
      (prisma.pendingUser.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (require("@/utils").createPassword as jest.Mock).mockResolvedValueOnce(
        "hashedPassword"
      );
      (require("@/utils").generateSmsCode as jest.Mock).mockResolvedValueOnce({
        hashedSmsCode: "smsHash",
      });
      (prisma.pendingUser.create as jest.Mock).mockResolvedValueOnce({
        id: "pending-1",
        phoneNumber: "+995555555555",
      });

      const res = await request(app)
        .post("/auth/register")
        .send(getRegisterPayload());

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({
        id: "pending-1",
        phoneNumber: "+995555555555",
      });
      expect(prisma.pendingUser.create).toHaveBeenCalled();
    });

    it("returns 409 when pending user with phone already exists", async () => {
      (prisma.pendingUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: "pending-1",
        phoneNumber: "+995555555555",
      });
      const res = await request(app)
        .post("/auth/register")
        .send(getRegisterPayload());
      expect(res.status).toBe(409);
    });

    it("returns 400 when validation fails (missing/invalid fields)", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({ phoneNumber: "", firstName: "" });
      expect(res.status).toBe(400);
      expect((res.body.errors || []).map((e: any) => e.param)).toEqual(
        expect.arrayContaining(["phoneNumber"])
      );
    });
  });

  describe("POST /auth/login", () => {
    it("logs in successfully with valid credentials and sets cookies", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (require("@/utils").verifyField as jest.Mock).mockResolvedValueOnce(true);

      (require("@/utils").generateTokens as jest.Mock).mockResolvedValueOnce({
        accessToken: "access-xyz",
        refreshToken: "refresh-xyz",
        accessTokenExpires: 1000,
        refreshTokenExpires: 2000,
      });

      (prisma.refreshToken.create as jest.Mock).mockResolvedValueOnce({
        token: "refresh-xyz",
      });

      const res = await request(app)
        .post("/auth/login")
        .send({ phoneNumber: mockUser.phoneNumber, password: "correctPass" });

      expect(res.status).toBe(200);
      expect(res.body).toBeValidCustomerLoginResponse();
      expect(res.headers["set-cookie"]).toBeDefined();
      expect(prisma.refreshToken.create).toHaveBeenCalled();
    });

    it("returns 404 when user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .post("/auth/login")
        .send({ phoneNumber: "+995555555552", password: "whatever" });

      expect(res.status).toBe(404);
      expect(res.body.error).toEqual(
        require("@/utils").errorMessages.userNotFound
      );
    });

    it("returns 400 when password invalid", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(false);

      const res = await request(app).post("/auth/login").send({
        phoneNumber: mockUser.phoneNumber,
        password: "BadPassword123",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toEqual(
        require("@/utils").errorMessages.invalidPassword
      );
    });

    it("returns 400 when validation fails (missing/invalid fields)", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ phoneNumber: "", password: "" });

      expect(res.status).toBe(400);
      const params = (res.body.errors || []).map((e: any) => e.param);
      expect(params).toEqual(
        expect.arrayContaining(["phoneNumber", "password"])
      );
    });

    it("returns 500 when token generation fails", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(true);
      (require("@/utils").generateTokens as jest.Mock).mockRejectedValueOnce(
        new Error("No tokens")
      );

      const res = await request(app)
        .post("/auth/login")
        .send({ phoneNumber: mockUser.phoneNumber, password: "correctPass" });

      expect(res.status).toBe(500);
    });
  });

  describe("POST /auth/refresh-token", () => {
    it.todo("returns 401 if no refresh cookie provided");

    it.todo("returns 401 if refresh token invalid");

    it.todo("successfully refreshes tokens and sets cookies");

    it.todo("returns 500 if an unexpected error occurs during refresh");
  });
});
