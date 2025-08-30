import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

import { adminAuthRouter } from "@/routes/admin";
import { prisma } from "@/config";
import {
  errorMessages,
  generateAccessToken,
  generateRefreshToken,
  verifyField,
} from "@/utils";
import { authMatchers } from "@/tests/helpers/authMatchers";
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

describe("Admin auth (integration-style) — /admin/login & /admin/renew", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /admin/login", () => {
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

    it("sends OTP code when valid credentials", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (verifyField as jest.Mock).mockResolvedValueOnce(true);
      (require("@/utils").generateSmsCode as jest.Mock).mockResolvedValueOnce({
        hashedSmsCode: 1234,
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
      expect(res.headers["set-cookie"]).toEqual(
        expect.arrayContaining([expect.stringContaining("admin_verify_stage=")])
      );
      expect(prisma.admin.update).toHaveBeenCalled();
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

    it("returns 404 if admin not found", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .post("/admin/verify-otp")
        .set("Cookie", ["admin_verify_stage=stage-token"])
        .send({ code: 2345 });

      expect(res).toHaveStatus(404);
      expect(res.body).toHaveErrorMessage("userNotFound", errorMessages);
    });

    it("returns 400 if code expired", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        smsCode: 2345,
        smsCodeExpiresAt: new Date(Date.now() - 5000),
      });

      const res = await request(app)
        .post("/admin/verify-otp")
        .set("Cookie", ["admin_verify_stage=stage-token"])
        .send({ code: 1234 });

      expect(res).toHaveStatus(400);
    });

    it("returns 401 if code invalid", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        smsCode: 2345,
        smsCodeExpiresAt: new Date(Date.now() + 5000),
      });
      (verifyField as jest.Mock).mockResolvedValueOnce(false);

      const res = await request(app)
        .post("/admin/verify-otp")
        .set("Cookie", ["admin_verify_stage=stage-token"])
        .send({ code: 3456 });

      expect(res).toHaveStatus(401);
      expect(res.body).toHaveErrorMessage("smsCodeisInvalid", errorMessages);
    });

    it("verifies OTP, sets access & refresh tokens", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        smsCode: 1234,
        smsCodeExpiresAt: new Date(Date.now() + 5000),
      });
      (verifyField as jest.Mock).mockResolvedValueOnce(true);
      (generateAccessToken as jest.Mock).mockReturnValueOnce({
        token: "access123",
        expiresIn: 1000,
      });
      (generateRefreshToken as jest.Mock).mockReturnValueOnce({
        token: "refresh123",
        expiresIn: 2000,
      });

      const res = await request(app)
        .post("/admin/verify-otp")
        .set("Cookie", ["admin_verify_stage=stage-token"])
        .send({ code: 1234 });

      expect(res).toHaveStatus(200);
      expect(res.body.message).toEqual(
        require("@/utils").getResponseMessage("loginSuccessful")
      );
      expect(res.headers["set-cookie"]).toEqual(
        expect.arrayContaining([
          expect.stringContaining("accessToken="),
          expect.stringContaining("refreshToken="),
        ])
      );
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

    it("returns 404 if admin not found", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .post("/admin/resend-otp")
        .set("Cookie", ["admin_verify_stage=stage-token"])
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
        .set("Cookie", ["admin_verify_stage=stage-token"])
        .send({ email: mockUser.email });

      expect(res).toHaveStatus(400);
    });

    it("resends OTP if expired", async () => {
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
        .set("Cookie", ["admin_verify_stage=stage-token"])
        .send({ email: mockUser.email });

      expect(res).toHaveStatus(200);
      expect(res.body.message).toEqual(
        require("@/utils").getResponseMessage("verificationCodeResent")
      );
      expect(prisma.admin.update).toHaveBeenCalled();
    });
  });

  describe("GET /admin/renew", () => {
    it("returns 401 if no tokens provided", async () => {
      const res = await request(app).get("/admin/renew");

      expect(res).toHaveStatus(401);
      expect(res.body).toHaveErrorMessage("noTokenProvided", errorMessages);
    });

    it("succeeds with valid access token cookie", async () => {
      const payload = { id: mockUser.id, email: mockUser.email };
      const accessToken = jwt.sign(
        payload,
        (require("@/config").getEnvVariable as jest.Mock)(
          "ADMIN_JWT_ACCESS_SECRET"
        )
      );
      const refreshToken = jwt.sign(
        payload,
        (require("@/config").getEnvVariable as jest.Mock)(
          "ADMIN_JWT_REFRESH_SECRET"
        )
      );

      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        passwordHash: undefined,
      });

      const res = await request(app)
        .get("/admin/renew")
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ]);

      expect(res).toHaveStatus(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data.user.id).toBe(mockUser.id);
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
      const payload = { id: mockUser.id, email: mockUser.email };
      const expiredAccess = jwt.sign(
        payload,
        (require("@/config").getEnvVariable as jest.Mock)(
          "ADMIN_JWT_ACCESS_SECRET"
        ),
        {
          expiresIn: "-1s",
        }
      );
      const badRefresh = "not.a.jwt.token";

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

    it("returns 500 when jwt secrets missing (simulated)", async () => {
      const cfg = require("@/config");
      const original = (cfg.getEnvVariable as jest.Mock).mockImplementationOnce(
        () => null
      );

      const payload = { id: mockUser.id, email: mockUser.email };
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

    it("bubbles controller errors as 500 (mock renew to throw)", async () => {
      const authController = require("@/controllers/admin/auth");
      jest.spyOn(authController, "renew").mockImplementationOnce(() => {
        throw new Error("Unexpected failure");
      });

      const payload = { id: mockUser.id, email: mockUser.email };
      const accessToken = jwt.sign(
        payload,
        (require("@/config").getEnvVariable as jest.Mock)(
          "ADMIN_JWT_ACCESS_SECRET"
        )
      );
      const refreshToken = jwt.sign(
        payload,
        (require("@/config").getEnvVariable as jest.Mock)(
          "ADMIN_JWT_REFRESH_SECRET"
        )
      );

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
    it("sends forgot password code when admin exists", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        smsCode: null,
      });

      (require("@/utils").generateSmsCode as jest.Mock).mockResolvedValueOnce({
        hashedSmsCode: 2345,
      });
      (prisma.admin.update as jest.Mock).mockResolvedValueOnce({});

      const res = await request(app)
        .post("/admin/forgot-password")
        .send({ email: mockUser.email });

      expect(res).toHaveStatus(200);
      expect(res.body.message).toEqual(
        require("@/utils").getResponseMessage("codeSent")
      );
      expect(prisma.admin.update).toHaveBeenCalled();
    });

    it("returns 400 when admin not found", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .post("/admin/forgot-password")
        .send({ email: "missing@test.com" });

      expect(res).toHaveStatus(400);
    });

    it("returns 400 when code still valid", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        smsCode: 1234,
        smsCodeExpiresAt: new Date(Date.now() + 5000).toISOString(),
      });

      const res = await request(app)
        .post("/admin/forgot-password")
        .send({ email: mockUser.email });

      expect(res).toHaveStatus(400);
      expect(res.body).toHaveErrorMessage(
        "verificationCodeStillValid",
        errorMessages
      );
    });
  });

  describe("POST /admin/forgot-password-verification", () => {
    it("returns 404 when admin not found", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .post("/admin/forgot-password-verification")
        .send({ email: "no@test.com", smsCode: 2345 });

      expect(res).toHaveStatus(404);
      expect(res.body).toHaveErrorMessage("userNotFound", errorMessages);
    });

    it("returns 400 when code expired", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        smsCode: 2345,
        smsCodeExpiresAt: new Date(Date.now() - 5000).toISOString(),
      });

      const res = await request(app)
        .post("/admin/forgot-password-verification")
        .send({ email: mockUser.email, smsCode: 2345 });

      expect(res).toHaveStatus(400);
      expect(res.body).toHaveErrorMessage(
        "verificationCodeExpired",
        errorMessages
      );
    });

    it("returns 401 when code invalid", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        smsCode: 2345,
        smsCodeExpiresAt: new Date(Date.now() + 5000).toISOString(),
      });
      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(false);

      const res = await request(app)
        .post("/admin/forgot-password-verification")
        .send({ email: mockUser.email, smsCode: 1234 });

      expect(res).toHaveStatus(401);
      expect(res.body).toHaveErrorMessage("smsCodeisInvalid", errorMessages);
    });

    it("verifies code successfully", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        smsCode: 2345,
        smsCodeExpiresAt: new Date(Date.now() + 5000).toISOString(),
      });
      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(true);

      const res = await request(app)
        .post("/admin/forgot-password-verification")
        .send({ email: mockUser.email, smsCode: 2345 });

      expect(res).toHaveStatus(200);
      expect(res.body.message).toEqual(
        require("@/utils").getResponseMessage("codeVerified")
      );
    });
  });

  describe("POST /admin/password-reset", () => {
    it("returns 404 when admin not found", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).post("/admin/password-reset").send({
        email: "no@test.com",
        password: "NewPassword123!",
        smsCode: "1234",
      });

      expect(res).toHaveStatus(404);
      expect(res.body).toHaveErrorMessage("userNotFound", errorMessages);
    });

    it("returns 400 when code expired", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        smsCode: "hash123",
        smsCodeExpiresAt: new Date(Date.now() - 5000).toISOString(),
      });

      const res = await request(app).post("/admin/password-reset").send({
        email: mockUser.email,
        password: "NewPassword123!",
        smsCode: "1234",
      });

      expect(res).toHaveStatus(400);
      expect(res.body).toHaveErrorMessage(
        "verificationCodeExpired",
        errorMessages
      );
    });

    it("returns 401 when sms invalid", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        smsCode: 2345,
        smsCodeExpiresAt: new Date(Date.now() + 5000).toISOString(),
      });
      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(false);

      const res = await request(app).post("/admin/password-reset").send({
        email: mockUser.email,
        password: "NewPassword123!",
        smsCode: 3456,
      });

      expect(res).toHaveStatus(401);
      expect(res.body).toHaveErrorMessage("smsCodeisInvalid", errorMessages);
    });

    it("resets password successfully", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        smsCode: "hash123",
        smsCodeExpiresAt: new Date(Date.now() + 5000).toISOString(),
      });
      (require("@/utils").verifyField as jest.Mock).mockReturnValueOnce(true);
      (require("@/utils").createPassword as jest.Mock).mockResolvedValueOnce(
        "newHash"
      );
      (prisma.admin.update as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        passwordHash: "newHash",
        smsCode: null,
      });

      const res = await request(app).post("/admin/password-reset").send({
        email: mockUser.email,
        password: "NewPassword123!",
        smsCode: "1234",
      });

      expect(res).toHaveStatus(200);
      expect(res.body.message).toEqual(
        require("@/utils").getResponseMessage("passwordChanged")
      );
      expect(prisma.admin.update).toHaveBeenCalled();
    });

    it("matches snapshot on renew with valid tokens", async () => {
      const payload = { id: mockUser.id, email: mockUser.email };
      const accessToken = jwt.sign(
        payload,
        (require("@/config").getEnvVariable as jest.Mock)(
          "ADMIN_JWT_ACCESS_SECRET"
        )
      );
      const refreshToken = jwt.sign(
        payload,
        (require("@/config").getEnvVariable as jest.Mock)(
          "ADMIN_JWT_REFRESH_SECRET"
        )
      );

      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        passwordHash: undefined,
      });

      const res = await request(app)
        .get("/admin/renew")
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ]);

      const setCookieHeader = res.headers["set-cookie"];
      const normalizedCookies = Array.isArray(setCookieHeader)
        ? setCookieHeader.map((c: string) =>
            c
              .replace(/Expires=[^;]+/, "Expires=<normalized>")
              .replace(/Max-Age=\d+/, "Max-Age=<normalized>")
              .replace(/accessToken=[^;]+/, "accessToken=<token>")
              .replace(/refreshToken=[^;]+/, "refreshToken=<token>")
          )
        : [];

      const stableBody = {
        ...res.body,
        data: {
          ...res.body.data,
          accessToken: res.body?.data?.accessToken ? "<token>" : undefined,
          refreshToken: res.body?.data?.refreshToken ? "<token>" : undefined,
        },
      };

      expect({
        status: res.status,
        body: stableBody,
        cookies: normalizedCookies,
      }).toMatchSnapshot();
    });
  });
});
