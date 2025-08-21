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
    user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
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
    cookieOptions: { path: "/", httpOnly: true, sameSite: "lax" },
    errorMessages: {
      ...((actual as any).errorMessages ?? {}),
      userNotFound: { en: "User not found", ka: "მომხმარებელი ვერ მოიძებნა" },
      invalidPassword: { en: "Invalid password", ka: "პაროლი არასწორია" },
      unauthorized: {
        en: "Authorization failed.",
        ka: "ავტორიზაცია წარუმატებლად დასრულდა.",
      },
      invalidRefreshToken: {
        en: "Access denied. Invalid refresh token.",
        ka: "წვდომა უარყოფილია. არასწორი refresh ტოკენი.",
      },
      passwordChanged: {
        en: "Password changed",
        ka: "პაროლი შეიცვალა",
      },
      smsCodeisInvalid: {
        en: "SMS code is invalid",
        ka: "SMS კოდი არ არის ვალიდური",
      },
      verificationCodeExpired: {
        en: "Verification code expired",
        ka: "ვერიფიკაციის კოდი ვადა ამოეწურა",
      },
    },
    logCatchyError: jest.fn(),
    selectLogger: jest.fn().mockReturnValue({
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    }),

    logCustomerCatchyError: jest.fn(),
    logCustomerInfo: jest.fn(),
    logCustomerWarn: jest.fn(),
  };
});

const mockUser = {
  id: "u-1",
  phoneNumber: "+995555555555",
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

describe("Customer auth (integration-style) — /auth/*", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("POST /auth/register", () => {
    it("creates pending user", async () => {
      (prisma.pendingUser.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (require("@/utils").createPassword as jest.Mock).mockResolvedValueOnce(
        "hashedPass"
      );
      (require("@/utils").generateSmsCode as jest.Mock).mockResolvedValueOnce({
        hashedSmsCode: "smsHash",
      });
      (prisma.pendingUser.create as jest.Mock).mockResolvedValueOnce({
        id: "p1",
        phoneNumber: mockUser.phoneNumber,
      });

      const res = await request(app).post("/auth/register").send({
        phoneNumber: mockUser.phoneNumber,
        firstName: "Alice",
        lastName: "Smith",
        dateOfBirth: "1990-01-01",
        personalId: "123456789",
        password: "Password123!",
        confirmPassword: "Password123!",
      });

      expect(res).toHaveStatus(200);
      expect(res.body.data).toMatchObject({
        id: "p1",
        phoneNumber: mockUser.phoneNumber,
      });
    });

    it("fails when pending user exists", async () => {
      (prisma.pendingUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: "p1",
      });
      const res = await request(app).post("/auth/register").send({
        phoneNumber: mockUser.phoneNumber,
        firstName: "Alice",
        lastName: "Smith",
        dateOfBirth: "1990-01-01",
        personalId: "123456789",
        password: "Password123!",
        confirmPassword: "Password123!",
      });
      expect(res).toHaveStatus(409);
    });
  });

  describe("POST /auth/login", () => {
    it("logs in successfully and sets cookies", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(true);
      (require("@/utils").generateTokens as jest.Mock).mockResolvedValueOnce({
        accessToken: "a-123",
        refreshToken: "r-123",
        accessTokenExpires: 1000,
        refreshTokenExpires: 2000,
      });
      (prisma.refreshToken.create as jest.Mock).mockResolvedValueOnce({
        token: "r-123",
      });

      const res = await request(app).post("/auth/login").send({
        phoneNumber: mockUser.phoneNumber,
        password: "Password123!",
      });

      expect(res).toHaveStatus(200);
      expect(res.body).toBeValidCustomerLoginResponse();
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("returns 404 if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      const res = await request(app).post("/auth/login").send({
        phoneNumber: "+995555555000",
        password: "Password123!",
      });
      expect(res).toHaveStatus(404);
    });
  });

  describe("POST /auth/refresh-token", () => {
    it("refreshes successfully", async () => {
      const oldRefresh = "old.r";
      (
        require("@/utils").verifyRefreshToken as jest.Mock
      ).mockResolvedValueOnce({ id: mockUser.id });
      (require("@/utils").generateAccessToken as jest.Mock).mockReturnValueOnce(
        { token: "a-new", expiresIn: 1000 }
      );
      (
        require("@/utils").generateRefreshToken as jest.Mock
      ).mockReturnValueOnce({ token: "r-new", expiresIn: 2000 });
      (prisma.refreshToken.delete as jest.Mock).mockResolvedValueOnce({});
      (prisma.refreshToken.create as jest.Mock).mockResolvedValueOnce({
        token: "r-new",
      });

      const res = await request(app)
        .post("/auth/refresh-token")
        .set("Cookie", [`refreshToken=${oldRefresh}`]);

      expect(res).toHaveStatus(200);
      expect(res.headers["set-cookie"]).toEqual(
        expect.arrayContaining([
          expect.stringContaining("accessToken="),
          expect.stringContaining("refreshToken="),
        ])
      );
    });

    it("returns 401 when no cookie", async () => {
      const res = await request(app).post("/auth/refresh-token");
      expect(res).toHaveStatus(401);
    });
  });

  describe("POST /auth/verify", () => {
    it("verifies pending user and creates account", async () => {
      (prisma.pendingUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: "p1",
        phoneNumber: mockUser.phoneNumber,
        smsCode: "smsHash",
        smsCodeExpiresAt: new Date(Date.now() + 10000).toISOString(),
        passwordHash: "h",
      });
      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(true);
      (prisma.user.create as jest.Mock).mockResolvedValueOnce(mockUser);
      (prisma.pendingUser.delete as jest.Mock).mockResolvedValueOnce({});
      (require("@/utils").generateAccessToken as jest.Mock).mockReturnValueOnce(
        { token: "a-v", expiresIn: 1000 }
      );
      (
        require("@/utils").generateRefreshToken as jest.Mock
      ).mockReturnValueOnce({ token: "r-v", expiresIn: 2000 });
      (prisma.refreshToken.create as jest.Mock).mockResolvedValueOnce({
        token: "r-v",
      });

      const res = await request(app).post("/auth/verify").send({
        id: "p1",
        phoneNumber: mockUser.phoneNumber,
        code: "1234",
      });

      expect(res).toHaveStatus(200);
      expect(res.body.data).toBeTruthy();
      expect(res.headers["set-cookie"]).toBeDefined();
    });
  });

  describe("POST /auth/forgot-password-verification", () => {
    it("verifies sms code successfully", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        smsCode: "smsHash",
        smsCodeExpiresAt: new Date(Date.now() + 10000).toISOString(),
      });
      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(true);

      const res = await request(app)
        .post("/auth/forgot-password-verification")
        .send({
          phoneNumber: mockUser.phoneNumber,
          smsCode: "1234",
        });

      expect(res).toHaveStatus(200);
      expect(res.body.message).toBe("codeVerified");
    });

    it("returns 404 when user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .post("/auth/forgot-password-verification")
        .send({
          phoneNumber: "+995555000000",
          smsCode: "1234",
        });

      expect(res).toHaveStatus(404);
      expect(res.body.error).toEqual(
        require("@/utils").errorMessages.userNotFound
      );
    });

    it("returns 400 when sms code expired", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        smsCode: "smsHash",
        smsCodeExpiresAt: new Date(Date.now() - 10000).toISOString(),
      });

      const res = await request(app)
        .post("/auth/forgot-password-verification")
        .send({
          phoneNumber: mockUser.phoneNumber,
          smsCode: "1234",
        });

      expect(res).toHaveStatus(400);
      expect(res.body.error).toEqual(
        require("@/utils").errorMessages.verificationCodeExpired
      );
    });

    it("returns 401 when sms code invalid", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        smsCode: "smsHash",
        smsCodeExpiresAt: new Date(Date.now() + 10000).toISOString(),
      });
      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(false);

      const res = await request(app)
        .post("/auth/forgot-password-verification")
        .send({
          phoneNumber: mockUser.phoneNumber,
          smsCode: "0000",
        });

      expect(res).toHaveStatus(401);
      expect(res.body.error).toEqual(
        require("@/utils").errorMessages.smsCodeisInvalid
      );
    });
  });

  describe("POST /auth/password-reset", () => {
    it("resets password with valid sms code", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        smsCode: "smsHash",
        smsCodeExpiresAt: new Date(Date.now() + 10000).toISOString(),
      });
      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(true);
      (require("@/utils").createPassword as jest.Mock).mockResolvedValueOnce(
        "newHash"
      );
      (prisma.user.update as jest.Mock).mockResolvedValueOnce(mockUser);

      const res = await request(app).post("/auth/password-reset").send({
        type: "phoneNumber",
        phoneNumber: mockUser.phoneNumber,
        smsCode: "1234",
        password: "NewPassword123!",
      });

      expect(res).toHaveStatus(200);
      expect(res.body.message).toBe("passwordChanged");
    });

    it("returns 404 when user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      const res = await request(app).post("/auth/password-reset").send({
        type: "phoneNumber",
        phoneNumber: "+995555000000",
        smsCode: "1234",
        password: "NewPassword123!",
      });
      expect(res).toHaveStatus(404);
    });

    it("matches snapshot on successful password reset", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        smsCode: "smsHash",
        smsCodeExpiresAt: new Date(Date.now() + 10000).toISOString(),
      });
      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(true);
      (require("@/utils").createPassword as jest.Mock).mockResolvedValueOnce(
        "newHash"
      );
      (prisma.user.update as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        passwordHash: "newHash",
        smsCode: null,
      });

      const res = await request(app).post("/auth/password-reset").send({
        type: "phoneNumber",
        phoneNumber: mockUser.phoneNumber,
        smsCode: "1234",
        password: "NewPassword123!",
      });

      const stableBody = {
        ...res.body,
        user: {
          ...res.body.user,
          passwordHash: res.body?.user?.passwordHash ? "<hash>" : undefined,
        },
      };

      expect({
        status: res.status,
        body: stableBody,
      }).toMatchSnapshot();
    });
  });
});
