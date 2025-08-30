import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import { adminAuthRouter } from "@/routes/admin";
import cookieParser from "cookie-parser";
import { authMatchers } from "@/tests/helpers/authMatchers";
import { prisma } from "@/config";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyField,
  errorMessages,
} from "@/utils";

expect.extend(authMatchers);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/admin", adminAuthRouter);

jest.mock("@/config", () => ({
  prisma: {
    admin: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $disconnect: jest.fn(),
  },

  getEnvVariable: jest.fn((key: string) => {
    if (key === "ADMIN_JWT_ACCESS_SECRET") return "accessSecret";
    if (key === "ADMIN_JWT_REFRESH_SECRET") return "refreshSecret";
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
    invalidPassword: { en: "Invalid password", ka: "არასწორი პაროლი" },
    passwordLength: { en: "Password length", ka: "პაროლის სიგრძე" },
    invalidEmail: { en: "Invalid email", ka: "ელ-ფოსტა არასწორია" },
    userNotFound: { en: "User not found", ka: "მომხმარებელი ვერ მოიძებნა" },
    noTokenProvided: {
      en: "Access denied. No token provided.",
      ka: "წვდომა უარყოფილია. ტოკენის მოწოდება აუცილებელია",
    },
    invalidCredentials: {
      en: "Invalid email or password",
      ka: "არასწორი ელ-ფოსტა ან პაროლი",
    },
    invalidRefreshToken: {
      en: "Access denied. Invalid refresh token.",
      ka: "წვდომა უარყოფილია. არასწორი refresh ტოკენი.",
    },
    jwtSecretNotProvided: {
      en: "JWT secrets not provided.",
      ka: "JWT secret-ების მოწოდება აუცილებელია.",
    },
    smsCodeisInvalid: {
      en: "SMS code is invalid",
      ka: "SMS კოდი არ არის ვალიდური",
    },
    adminAuthenticateFailed: {
      en: "Admin authentication failed.",
      ka: "ადმინისტრატორის ავტორიზაცია წარუმატებლად დასრულდა.",
    },
  };

  return {
    ...actual,
    sendError: jest.fn((req, res, status, key) => {
      res.status(status).json({ error: actual.errorMessages[key] ?? key });
    }),
    generateSmsCode: jest.fn(),
    createPassword: jest.fn(),
    issueAdminTokens: jest.fn((res, admin, remember) =>
      actual.issueAdminTokens(res, admin, remember)
    ),
    generateStageToken: jest.fn(),
    inMinutes: (mins: number) => new Date(Date.now() + mins * 60 * 1000),
    getTokenFromRequest: jest.fn((req: any) => {
      const auth = req?.headers?.authorization;
      if (typeof auth === "string" && auth.startsWith("Bearer ")) {
        return auth.split(" ")[1];
      }
      return req?.cookies?.accessToken;
    }),
    logAdminWarn: jest.fn(),
    logAdminError: jest.fn(),

    selectLogger: jest.fn(() => ({
      warn: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    })),
    getClientIp: jest.fn().mockResolvedValue("hashedIp"),
    verifyField: jest.fn(),
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    errorMessages,
  };
});

const mockUser = {
  id: "1",
  email: "admin@test.com",
  passwordHash: "hashedPass",
  name: "Test Admin",
  twoFactorAuth: true,
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

  describe("POST /admin/login", () => {
    it("sends OTP code when valid credentials", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (verifyField as jest.Mock).mockResolvedValueOnce(true);
      (require("@/utils").generateSmsCode as jest.Mock).mockResolvedValueOnce({
        hashedSmsCode: "hash123",
      });
      (prisma.admin.update as jest.Mock).mockResolvedValueOnce({});
      (require("@/utils").generateStageToken as jest.Mock).mockReturnValueOnce({
        token: "stage-token",
      });

      const res = await request(app)
        .post("/admin/login")
        .send({ email: "admin@test.com", password: "hashedPass" });

      expect(res).toHaveStatus(200);
      expect(res.body.message).toEqual(
        require("@/utils").getResponseMessage("codeSent")
      );
      expect(res.headers["set-cookie"]).toBeDefined();
      expect(prisma.admin.update).toHaveBeenCalled();
    });

    it("returns 401 if user not found", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .post("/admin/login")
        .send({ email: "unknown@test.com", password: "Password123" });

      expect(res).toHaveStatus(401);
      expect(res.body).toHaveErrorMessage("invalidCredentials", errorMessages);
    });

    it("returns 401 if password invalid", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (verifyField as jest.Mock).mockResolvedValueOnce(false);

      const res = await request(app)
        .post("/admin/login")
        .send({ email: "admin@test.com", password: "WrongPass12" });

      expect(res).toHaveStatus(401);
      expect(res.body).toHaveErrorMessage("invalidCredentials", errorMessages);
    });

    it("returns 400 if missing fields", async () => {
      const res = await request(app).post("/admin/login").send({ email: "" });
      expect(res).toHaveStatus(400);
    });

    it("handles unexpected error", async () => {
      (prisma.admin.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error("DB down")
      );
      const res = await request(app)
        .post("/admin/login")
        .send({ email: "admin@test.com", password: "ValidPass123" });

      expect(res).toHaveStatus(500);
    });
  });

  describe("POST /admin/verify-otp", () => {
    beforeEach(() => {
      (prisma.admin.findUnique as jest.Mock).mockReset();
      jest.spyOn(jwt, "verify").mockReturnValue({ id: mockUser.id } as any);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
    it("verifies otp, sets tokens and returns user data", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        smsCode: 1234,
        smsCodeExpiresAt: new Date(Date.now() + 10000),
        twoFactorAuth: true,
      });
      (verifyField as jest.Mock).mockResolvedValueOnce(true);
      (generateAccessToken as jest.Mock).mockReturnValueOnce({
        token: "access-abc",
        expiresIn: 1000,
      });
      (generateRefreshToken as jest.Mock).mockReturnValueOnce({
        token: "refresh-abc",
        expiresIn: 2000,
      });

      const res = await request(app)
        .post("/admin/verify-otp")
        .set("Cookie", ["admin_verify_stage=fakeStageToken"])
        .send({ code: 1234 });

      expect(res).toHaveStatus(200);
      expect(res.body.message).toEqual(
        require("@/utils").getResponseMessage("loginSuccessful")
      );
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("returns 404 if admin not found", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .post("/admin/verify-otp")
        .set("Cookie", ["admin_verify_stage=fakeStageToken"])
        .send({ code: 2345 });

      expect(res).toHaveStatus(404);
      expect(res.body).toHaveErrorMessage("userNotFound", errorMessages);
    });

    it("returns 400 if code expired", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        smsCode: 2345,
        smsCodeExpiresAt: new Date(Date.now() - 1000),
      });

      const res = await request(app)
        .post("/admin/verify-otp")
        .set("Cookie", ["admin_verify_stage=fakeStageToken"])
        .send({ code: 1234 });

      expect(res).toHaveStatus(400);
    });

    it("returns 401 if code invalid", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        smsCode: 2345,
        smsCodeExpiresAt: new Date(Date.now() + 10000),
      });
      (verifyField as jest.Mock).mockResolvedValueOnce(false);

      const res = await request(app)
        .post("/admin/verify-otp")
        .set("Cookie", ["admin_verify_stage=fakeStageToken"])
        .send({ code: 3456 });

      expect(res).toHaveStatus(401);
      expect(res.body).toHaveErrorMessage("smsCodeisInvalid", errorMessages);
    });
  });

  describe("POST /admin/resend-otp", () => {
    beforeEach(() => {
      (prisma.admin.findUnique as jest.Mock).mockReset();
      jest.spyOn(jwt, "verify").mockReturnValue({ id: mockUser.id } as any);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
    it("resends verification code if expired", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        smsCodeExpiresAt: new Date(Date.now() - 1000),
      });
      (require("@/utils").generateSmsCode as jest.Mock).mockResolvedValueOnce({
        hashedSmsCode: "newHash",
      });
      (prisma.admin.update as jest.Mock).mockResolvedValueOnce({});

      const res = await request(app)
        .post("/admin/resend-otp")
        .set("Cookie", ["admin_verify_stage=fakeStageToken"])
        .send({ email: mockUser.email });

      expect(res).toHaveStatus(200);
      expect(res.body.message).toEqual(
        require("@/utils").getResponseMessage("verificationCodeResent")
      );
      expect(prisma.admin.update).toHaveBeenCalled();
    });

    it("returns 404 if admin not found", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .post("/admin/resend-otp")
        .set("Cookie", ["admin_verify_stage=fakeStageToken"])
        .send({ email: mockUser.email });

      expect(res).toHaveStatus(404);
      expect(res.body).toHaveErrorMessage("userNotFound", errorMessages);
    });

    it("returns 400 if code still valid", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        smsCodeExpiresAt: new Date(Date.now() + 10000),
      });

      const res = await request(app)
        .post("/admin/resend-otp")
        .set("Cookie", ["admin_verify_stage=fakeStageToken"])
        .send({ email: mockUser.email });

      expect(res).toHaveStatus(400);
    });
  });

  describe("GET /admin/renew", () => {
    it("Should return 401 if no tokens provided", async () => {
      const res = await request(app).get("/admin/renew");

      expect(res).toHaveStatus(401);
      expect(res.body).toHaveErrorMessage("noTokenProvided", errorMessages);
    });

    it("Should succeed with valid access token", async () => {
      const jwt = require("jsonwebtoken");
      const payload = { id: "1", email: "admin@test.com" };

      const accessToken = jwt.sign(payload, "accessSecret");
      const refreshToken = jwt.sign(payload, "refreshSecret");

      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);

      const res = await request(app)
        .get("/admin/renew")
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ]);

      expect(res).toHaveStatus(200);
      expect(res.body).toHaveProperty("data");
    });

    it("succeeds when Authorization header provided and refresh cookie present", async () => {
      const jwt = require("jsonwebtoken");
      const payload = { id: "1", email: "admin@test.com" };
      const accessToken = jwt.sign(payload, "accessSecret");
      const refreshToken = jwt.sign(payload, "refreshSecret");

      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);

      const res = await request(app)
        .get("/admin/renew")
        .set("Authorization", `Bearer ${accessToken}`)
        .set("Cookie", [`refreshToken=${refreshToken}`]);

      expect(res).toHaveStatus(200);
      expect(res.body).toHaveProperty("data");
    });

    it("refreshes access token when expired but refresh valid", async () => {
      const jwt = require("jsonwebtoken");
      const payload = { id: "1", email: "admin@test.com" };
      const expiredAccess = jwt.sign(payload, "accessSecret", {
        expiresIn: "-1s",
      });
      const refreshToken = jwt.sign(payload, "refreshSecret");

      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);

      const res = await request(app)
        .get("/admin/renew")
        .set("Cookie", [
          `accessToken=${expiredAccess}`,
          `refreshToken=${refreshToken}`,
        ]);

      expect(res).toHaveStatus(200);
      expect(res.headers["set-cookie"] || []).toEqual(
        expect.arrayContaining([expect.stringContaining("accessToken=")])
      );
    });

    it("returns 401 when refresh token invalid", async () => {
      const jwt = require("jsonwebtoken");

      const payload = { id: "1", email: "admin@test.com" };
      const expiredAccess = jwt.sign(payload, "accessSecret", {
        expiresIn: "-1s",
      });
      const badRefresh = "invalidrefreshtoken";

      const res = await request(app)
        .get("/admin/renew")
        .set("Cookie", [
          `accessToken=${expiredAccess}`,
          `refreshToken=${badRefresh}`,
        ]);
      expect(res).toHaveStatus(401);
      expect(res.body).toHaveErrorMessage(
        "adminAuthenticateFailed",
        errorMessages
      );
    });

    it("returns 500 when secrets missing (simulated)", async () => {
      const cfg = require("@/config");
      (cfg.getEnvVariable as jest.Mock).mockImplementationOnce(() => null);

      const jwt = require("jsonwebtoken");
      const payload = { id: "1", email: "admin@test.com" };
      const accessToken = jwt.sign(payload, "accessSecret");
      const refreshToken = jwt.sign(payload, "refreshSecret");

      const res = await request(app)
        .get("/admin/renew")
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ]);

      expect(res).toHaveStatus(500);
      expect(res.body).toHaveErrorMessage(
        "jwtSecretNotProvided",
        errorMessages
      );
    });

    it("handles unexpected controller error (mock renew to throw)", async () => {
      const authController = require("@/controllers/admin/auth");
      jest
        .spyOn(authController, "renew")
        .mockImplementationOnce((req: any, res: any) => {
          throw new Error("Unexpected");
        });

      const jwt = require("jsonwebtoken");
      const payload = { id: "1", email: "admin@test.com" };
      const accessToken = jwt.sign(payload, "accessSecret");
      const refreshToken = jwt.sign(payload, "refreshSecret");

      const res = await request(app)
        .get("/admin/renew")
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ]);

      expect(res).toHaveStatus(500);
    });
  });

  describe("POST /admin/forgot-password", () => {
    it("sends forgot password code via email when admin exists", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue({
        id: mockUser.id,
        email: "a@b.com",
      });

      (require("@/utils").generateSmsCode as jest.Mock).mockResolvedValueOnce({
        hashedSmsCode: "emailForgotHash",
      });

      (prisma.admin.update as jest.Mock).mockResolvedValueOnce({});

      const res = await request(app)
        .post("/admin/forgot-password")
        .send({ email: "a@b.com" });

      expect(res).toHaveStatus(200);
      expect(res.body.message).toEqual(
        require("@/utils").getResponseMessage("codeSent")
      );
      expect(prisma.admin.update).toHaveBeenCalled();
    });

    it("returns 404 when admin not found", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post("/admin/forgot-password")
        .send({ email: "missing@b.com" });

      expect(res).toHaveStatus(400);
    });
  });

  describe("POST /admin/forgot-password-verification", () => {
    it("verifies forgot password sms code successfully", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce({
        id: mockUser.id,
        email: mockUser.email,
        smsCode: "smsStoredHash",
        smsCodeExpiresAt: new Date(Date.now() + 10000).toISOString(),
      });

      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(true);

      const res = await request(app)
        .post("/admin/forgot-password-verification")
        .send({ email: mockUser.email, smsCode: "1234" });

      expect(res).toHaveStatus(200);
      expect(res.body.message).toEqual(
        require("@/utils").getResponseMessage("codeVerified")
      );
    });

    it("returns 404 when user not found or no smsCode", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .post("/admin/forgot-password-verification")
        .send({ email: "man@gmail.com", smsCode: "1234" });

      expect(res).toHaveStatus(404);
      expect(res.body).toHaveErrorMessage("userNotFound", errorMessages);
    });

    it("returns 401 when code invalid", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce({
        id: mockUser.id,
        email: mockUser.email,
        smsCode: 2345,
        smsCodeExpiresAt: new Date(Date.now() + 10000).toISOString(),
      });

      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(false);

      const res = await request(app)
        .post("/admin/forgot-password-verification")
        .send({ email: mockUser.email, smsCode: 1234 });

      expect(res).toHaveStatus(401);
      expect(res.body).toHaveErrorMessage("smsCodeisInvalid", errorMessages);
    });
  });

  describe("POST /admin/password-reset", () => {
    it("resets password successfully when sms code valid", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        smsCode: 1234,
        smsCodeExpiresAt: new Date(Date.now() + 10000).toISOString(),
      });

      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(true);
      (require("@/utils").createPassword as jest.Mock).mockResolvedValueOnce(
        "newHash"
      );
      (prisma.admin.update as jest.Mock).mockResolvedValueOnce({
        id: mockUser.id,
        email: mockUser.email,
      });

      const res = await request(app).post("/admin/password-reset").send({
        type: "email",
        email: mockUser.email,
        smsCode: 1234,
        password: "NewPassword123!",
      });

      expect(res).toHaveStatus(200);
      expect(res.body.message).toEqual(
        require("@/utils").getResponseMessage("passwordChanged")
      );

      expect(prisma.admin.update).toHaveBeenCalled();
    });

    it("returns 404 when user not found or no smsCode", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).post("/admin/password-reset").send({
        type: "email",
        email: "man@gmail.com",
        smsCode: 1234,
        password: "NewPassword123!",
      });

      expect(res).toHaveStatus(404);
      expect(res.body).toHaveErrorMessage("userNotFound", errorMessages);
    });

    it("returns 401 when sms code invalid", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce({
        id: mockUser.id,
        email: mockUser.email,
        smsCode: 1234,
        smsCodeExpiresAt: new Date(Date.now() + 10000).toISOString(),
      });

      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(false);

      const res = await request(app).post("/admin/password-reset").send({
        type: "email",
        email: mockUser.email,
        smsCode: 2345,
        password: "NewPassword123!",
      });

      expect(res).toHaveStatus(401);
      expect(res.body).toHaveErrorMessage("smsCodeisInvalid", errorMessages);
    });

    it("returns 400 when sms code expired", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce({
        id: mockUser.id,
        email: mockUser.email,
        smsCode: 1234,
        smsCodeExpiresAt: new Date(Date.now() - 10000).toISOString(),
      });

      const res = await request(app).post("/admin/password-reset").send({
        type: "email",
        email: mockUser.email,
        smsCode: 1234,
        password: "NewPassword123!",
      });

      expect(res).toHaveStatus(400);
    });
  });
});
