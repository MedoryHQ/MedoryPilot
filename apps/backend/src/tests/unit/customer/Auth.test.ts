import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

import { userAuthRouter } from "@/routes/customer";
import { prisma } from "@/config";

import { authMatchers } from "@/tests/helpers/authMatchers";
import { errorMessages } from "@/utils";
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
    errorMessages: {
      ...((actual as any).errorMessages ?? {}),
      userNotFound: { en: "User not found", ka: "მომხმარებელი ვერ მოიძებნა" },
      invalidPassword: {
        en: "Invalid password",
        ka: "პაროლი არასწორია",
      },
      unauthorized: {
        en: "Authorization failed.",
        ka: "ავტორიზაცია წარუმატებლად დასრულდა.",
      },
      invalidRefreshToken: {
        en: "Access denied. Invalid refresh token.",
        ka: "წვდომა უარყოფილია. არასწორი refresh ტოკენი.",
      },
      phoneAlreadyExists: {
        en: "User with this phone number already exists",
        ka: "მომხმარებელი ამ ტელეფონის ნომრით უკვე არსებობს",
      },
      smsVerificationSent: {
        en: "Verification code sent to your phone number.",
        ka: "ვერიფიკაციის კოდი გამოიგზავნა თქვენს ტელეფონის ნომერზე.",
      },
      verificationSuccessful: {
        en: "Verification successful",
        ka: "ვერიფიკაცია წარმატებით დასრულდა",
      },
      loginSuccessful: {
        en: "Login successful",
        ka: "შესახებ წარმატებით დასრულდა",
      },
      verificationCodeResent: {
        en: "Verification code resent successfully",
        ka: "ვერიფიკაცის კოდი წარმატებით გამოიგზავნა ხელახლა",
      },
      codeSent: {
        en: "Code sent successfully",
        ka: "კოდი წარმატებით გამოიგზავნა",
      },
      codeVerified: {
        en: "Code verified successfully",
        ka: "კოდი ვერიფიცირებულია",
      },
      passwordChanged: {
        en: "Password changed",
        ka: "პაროლი შეიცვალა",
      },
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

      expect(res).toHaveStatus(200);
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
      expect(res).toHaveStatus(409);
    });

    it("returns 400 when validation fails (missing/invalid fields)", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({ phoneNumber: "", firstName: "" });
      expect(res).toHaveStatus(400);
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

      expect(res).toHaveStatus(200);
      expect(res.body).toBeValidCustomerLoginResponse();
      expect(res.headers["set-cookie"]).toBeDefined();
      expect(prisma.refreshToken.create).toHaveBeenCalled();
    });

    it("returns 404 when user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .post("/auth/login")
        .send({ phoneNumber: "+995555555552", password: "whatever" });

      expect(res).toHaveStatus(404);
      expect(res.body).toHaveErrorMessage("userNotFound", errorMessages);
    });

    it("returns 400 when password invalid", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(false);

      const res = await request(app).post("/auth/login").send({
        phoneNumber: mockUser.phoneNumber,
        password: "BadPassword123",
      });

      expect(res).toHaveStatus(400);
      expect(res.body).toHaveErrorMessage("invalidPassword", errorMessages);
    });

    it("returns 400 when validation fails (missing/invalid fields)", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ phoneNumber: "", password: "" });

      expect(res).toHaveStatus(400);
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

      expect(res).toHaveStatus(500);
    });
  });

  describe("POST /auth/refresh-token", () => {
    it("returns 401 if no refresh cookie provided", async () => {
      const res = await request(app).post("/auth/refresh-token");
      expect(res).toHaveStatus(401);
      expect(res.body).toHaveErrorMessage("unauthorized", errorMessages);
    });

    it("returns 401 if refresh token invalid", async () => {
      const badToken = "invalid.token.here";
      (
        require("@/utils").verifyRefreshToken as jest.Mock
      ).mockImplementationOnce(() => {
        throw new Error("invalid");
      });

      const res = await request(app)
        .post("/auth/refresh-token")
        .set("Cookie", [`refreshToken=${badToken}`]);

      expect(res).toHaveStatus(401);
      expect(res.body).toHaveErrorMessage("invalidRefreshToken", errorMessages);
    });

    it("successfully refreshes tokens and sets cookies", async () => {
      const oldRefresh = "old.refresh.token";
      const decoded = { id: mockUser.id, phoneNumber: mockUser.phoneNumber };

      (
        require("@/utils").verifyRefreshToken as jest.Mock
      ).mockResolvedValueOnce(decoded);

      (require("@/utils").generateAccessToken as jest.Mock).mockReturnValueOnce(
        {
          token: "new.access",
          expiresIn: 1000,
        }
      );
      (
        require("@/utils").generateRefreshToken as jest.Mock
      ).mockReturnValueOnce({
        token: "new.refresh",
        expiresIn: 2000,
      });

      (prisma.refreshToken.delete as jest.Mock).mockResolvedValueOnce({});
      (prisma.refreshToken.create as jest.Mock).mockResolvedValueOnce({
        token: "new.refresh",
      });

      const res = await request(app)
        .post("/auth/refresh-token")
        .set("Cookie", [`refreshToken=${oldRefresh}`]);

      expect(res).toHaveStatus(200);
      const setCookie = res.headers["set-cookie"];
      expect(setCookie).toBeDefined();
      const asArray = Array.isArray(setCookie) ? setCookie : [setCookie];
      const cookieStr = asArray.join(";");
      expect(cookieStr).toContain("accessToken=");
      expect(cookieStr).toContain("refreshToken=");
      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { token: oldRefresh },
      });
      expect(prisma.refreshToken.create).toHaveBeenCalled();
    });

    it("returns 500 if an unexpected error occurs during refresh", async () => {
      const oldRefresh = "old.refresh.token";
      (
        require("@/utils").verifyRefreshToken as jest.Mock
      ).mockResolvedValueOnce({
        id: mockUser.id,
        phoneNumber: mockUser.phoneNumber,
      });

      (prisma.refreshToken.delete as jest.Mock).mockRejectedValueOnce(
        new Error("DB fail")
      );

      const res = await request(app)
        .post("/auth/refresh-token")
        .set("Cookie", [`refreshToken=${oldRefresh}`]);

      expect(res).toHaveStatus(500);
    });
  });

  describe("POST /auth/verify", () => {
    it("verifies pending user, creates user, sets cookies and returns user data", async () => {
      (prisma.pendingUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: "pending-1",
        phoneNumber: mockUser.phoneNumber,
        smsCode: "smsHash",
        smsCodeExpiresAt: new Date(Date.now() + 10000).toISOString(),
        firstName: "Alice",
        lastName: "Smith",
        dateOfBirth: "1990-01-01",
        passwordHash: "hashedPassword",
        personalId: "123456789",
        email: null,
      });

      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(true);

      (prisma.user.create as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        dateOfBirth: "1990-01-01",
      });

      (prisma.pendingUser.delete as jest.Mock).mockResolvedValueOnce({});

      (require("@/utils").generateAccessToken as jest.Mock).mockReturnValueOnce(
        {
          token: "access-abc",
          expiresIn: 1000,
        }
      );
      (
        require("@/utils").generateRefreshToken as jest.Mock
      ).mockReturnValueOnce({
        token: "refresh-abc",
        expiresIn: 2000,
      });

      (prisma.refreshToken.create as jest.Mock).mockResolvedValueOnce({
        token: "refresh-abc",
      });

      const res = await request(app).post("/auth/verify").send({
        id: "pending-1",
        phoneNumber: mockUser.phoneNumber,
        code: "1234",
      });

      expect(res).toHaveStatus(200);
      const setCookie = res.headers["set-cookie"];
      expect(setCookie).toBeDefined();
      const asArray = Array.isArray(setCookie) ? setCookie : [setCookie];
      const cookieStr = asArray.join(";");
      expect(cookieStr).toContain("accessToken=");
      expect(cookieStr).toContain("refreshToken=");
      expect(res.body.data).toBeTruthy();
    });

    it("returns 404 when pending user not found", async () => {
      (prisma.pendingUser.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).post("/auth/verify").send({
        id: "missing",
        phoneNumber: mockUser.phoneNumber,
        code: "1234",
      });

      expect(res).toHaveStatus(404);
      expect(res.body).toHaveErrorMessage("userNotFound", errorMessages);
    });

    it("returns 401 when sms code invalid", async () => {
      (prisma.pendingUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: "pending-1",
        phoneNumber: mockUser.phoneNumber,
        smsCode: 3456,
        smsCodeExpiresAt: new Date(Date.now() + 10000).toISOString(),
        firstName: "Alice",
        lastName: "Smith",
        dateOfBirth: "1990-01-01",
        passwordHash: "hashedPassword",
        personalId: "123456789",
      });

      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(false);

      const res = await request(app).post("/auth/verify").send({
        id: "pending-1",
        phoneNumber: mockUser.phoneNumber,
        code: 1234,
      });

      expect(res).toHaveStatus(401);
      expect(res.body).toHaveErrorMessage("smsCodeisInvalid", errorMessages);
    });
  });

  describe("POST /auth/verification-resend", () => {
    it("resends verification code when pending user exists and code expired", async () => {
      (prisma.pendingUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: "pending-1",
        phoneNumber: mockUser.phoneNumber,
        smsCodeExpiresAt: new Date(Date.now() - 10000).toISOString(),
      });

      (require("@/utils").generateSmsCode as jest.Mock).mockResolvedValueOnce({
        hashedSmsCode: "newSmsHash",
      });

      (prisma.pendingUser.update as jest.Mock).mockResolvedValueOnce({});

      const res = await request(app)
        .post("/auth/verification-resend")
        .send({ phoneNumber: mockUser.phoneNumber });

      expect(res).toHaveStatus(200);
      expect(res.body.message).toEqual(
        require("@/utils").getResponseMessage("verificationCodeResent")
      );
      expect(prisma.pendingUser.update).toHaveBeenCalled();
    });

    it("returns 404 when pending user not found", async () => {
      (prisma.pendingUser.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .post("/auth/verification-resend")
        .send({ phoneNumber: mockUser.phoneNumber });

      expect(res).toHaveStatus(404);
      expect(res.body).toHaveErrorMessage("userNotFound", errorMessages);
    });

    it("returns 400 when code still valid", async () => {
      (prisma.pendingUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: "pending-1",
        phoneNumber: mockUser.phoneNumber,
        smsCodeExpiresAt: new Date(Date.now() + 10000).toISOString(),
      });

      const res = await request(app)
        .post("/auth/verification-resend")
        .send({ phoneNumber: mockUser.phoneNumber });

      expect(res).toHaveStatus(400);
    });
  });

  describe("POST /auth/forgot-password", () => {
    it("sends forgot password code when user exists", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: mockUser.id,
        phoneNumber: mockUser.phoneNumber,
      });

      (require("@/utils").generateSmsCode as jest.Mock).mockResolvedValueOnce({
        hashedSmsCode: "forgotHash",
      });

      (prisma.user.update as jest.Mock).mockResolvedValueOnce({});

      const res = await request(app)
        .post("/auth/forgot-password")
        .send({ phoneNumber: mockUser.phoneNumber });

      expect(res).toHaveStatus(200);
      expect(res.body.message).toEqual(
        require("@/utils").getResponseMessage("codeSent")
      );
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it("returns 404 when user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .post("/auth/forgot-password")
        .send({ phoneNumber: "+995555555552" });

      expect(res).toHaveStatus(404);
      expect(res.body).toHaveErrorMessage("userNotFound", errorMessages);
    });
  });

  describe("POST /auth/forgot-password/with-email", () => {
    it("sends forgot password code via email when user exists", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: mockUser.id,
        email: "a@b.com",
      });

      (require("@/utils").generateSmsCode as jest.Mock).mockResolvedValueOnce({
        hashedSmsCode: "emailForgotHash",
      });

      (prisma.user.update as jest.Mock).mockResolvedValueOnce({});

      const res = await request(app)
        .post("/auth/forgot-password/with-email")
        .send({ email: "a@b.com" });

      expect(res).toHaveStatus(200);
      expect(res.body.message).toEqual(
        require("@/utils").getResponseMessage("codeSent")
      );
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it("returns 400 (validation) when user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post("/auth/forgot-password/with-email")
        .send({ email: "missing@b.com" });

      expect(res).toHaveStatus(400);

      const params = (res.body.errors || []).map((e: any) => e.param);
      expect(params).toEqual(expect.arrayContaining(["email"]));
    });
  });

  describe("POST /auth/forgot-password-verification", () => {
    it("verifies forgot password sms code successfully", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: mockUser.id,
        phoneNumber: mockUser.phoneNumber,
        smsCode: "smsStoredHash",
        smsCodeExpiresAt: new Date(Date.now() + 10000).toISOString(),
      });

      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(true);

      const res = await request(app)
        .post("/auth/forgot-password-verification")
        .send({ phoneNumber: mockUser.phoneNumber, smsCode: "1234" });

      expect(res).toHaveStatus(200);
      expect(res.body.message).toEqual(
        require("@/utils").getResponseMessage("codeVerified")
      );
    });

    it("returns 404 when user not found or no smsCode", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .post("/auth/forgot-password-verification")
        .send({ phoneNumber: "+995555555552", smsCode: "1234" });

      expect(res).toHaveStatus(404);
      expect(res.body).toHaveErrorMessage("userNotFound", errorMessages);
    });

    it("returns 401 when code invalid", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: mockUser.id,
        phoneNumber: mockUser.phoneNumber,
        smsCode: 2345,
        smsCodeExpiresAt: new Date(Date.now() + 10000).toISOString(),
      });

      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(false);

      const res = await request(app)
        .post("/auth/forgot-password-verification")
        .send({ phoneNumber: mockUser.phoneNumber, smsCode: 1234 });

      expect(res).toHaveStatus(401);
      expect(res.body).toHaveErrorMessage("smsCodeisInvalid", errorMessages);
    });
  });

  describe("POST /auth/password-reset", () => {
    it("resets password successfully when sms code valid and type=phoneNumber", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: mockUser.id,
        phoneNumber: mockUser.phoneNumber,
        smsCode: 2345,
        smsCodeExpiresAt: new Date(Date.now() + 10000).toISOString(),
        isVerified: true,
      });

      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(true);
      (require("@/utils").createPassword as jest.Mock).mockResolvedValueOnce(
        "newHash"
      );
      (prisma.user.update as jest.Mock).mockResolvedValueOnce({
        id: mockUser.id,
        phoneNumber: mockUser.phoneNumber,
      });

      const res = await request(app).post("/auth/password-reset").send({
        type: "phoneNumber",
        phoneNumber: mockUser.phoneNumber,
        smsCode: 2345,
        password: "NewPassword123!",
      });

      expect(res).toHaveStatus(200);
      expect(res.body.message).toEqual(
        require("@/utils").getResponseMessage("passwordChanged")
      );

      expect(prisma.user.update).toHaveBeenCalled();
    });

    it("returns 404 when user not found or no smsCode", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).post("/auth/password-reset").send({
        type: "phoneNumber",
        phoneNumber: "+995555555552",
        smsCode: "1234",
        password: "NewPassword123!",
      });

      expect(res).toHaveStatus(404);
      expect(res.body).toHaveErrorMessage("userNotFound", errorMessages);
    });

    it("returns 401 when sms code invalid", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: mockUser.id,
        phoneNumber: mockUser.phoneNumber,
        smsCode: 3456,
        smsCodeExpiresAt: new Date(Date.now() + 10000).toISOString(),
      });

      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(false);

      const res = await request(app).post("/auth/password-reset").send({
        type: "phoneNumber",
        phoneNumber: mockUser.phoneNumber,
        smsCode: 1234,
        password: "NewPassword123!",
      });

      expect(res).toHaveStatus(401);
      expect(res.body).toHaveErrorMessage("smsCodeisInvalid", errorMessages);
    });

    it("returns 400 when sms code expired", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: mockUser.id,
        phoneNumber: mockUser.phoneNumber,
        smsCode: 1234,
        smsCodeExpiresAt: new Date(Date.now() - 10000).toISOString(),
      });

      const res = await request(app).post("/auth/password-reset").send({
        type: "phoneNumber",
        phoneNumber: mockUser.phoneNumber,
        smsCode: 1234,
        password: "NewPassword123!",
      });

      console.log(res.body.error, res.body.errors);
      expect(res).toHaveStatus(400);
      expect(res.body).toHaveErrorMessage(
        "verificationCodeExpired",
        errorMessages
      );
    });
  });
});
