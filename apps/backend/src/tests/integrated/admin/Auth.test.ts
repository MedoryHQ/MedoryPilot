import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

import { adminAuthRouter } from "@/routes/admin";
import { prisma } from "@/config";
import {
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

  const errorMsgs = {
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
  };

  return {
    ...actual,
    getTokenFromRequest: jest.fn((req: any) => {
      const auth = req?.headers?.authorization;
      if (typeof auth === "string" && auth.startsWith("Bearer ")) {
        return auth.split(" ")[1];
      }
      return req?.cookies?.accessToken;
    }),
    selectLogger: jest.fn(() => ({
      warn: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    })),
    logAdminInfo: jest.fn(),
    logAdminWarn: jest.fn(),
    logAdminError: jest.fn(),
    getClientIp: jest.fn().mockResolvedValue("hashedIp"),
    verifyField: jest.fn(),
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    errorMessages: errorMsgs,
  };
});

const mockUser = {
  id: "1",
  email: "admin@test.com",
  passwordHash: "hashedPass",
  name: "Test Admin",
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
    it("logs in with valid credentials and sets cookies", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
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
        .post("/admin/login")
        .send({ email: "admin@test.com", password: "correctPass" });

      expect(res).toHaveStatus(200);
      expect(res.body).toBeValidAdminLoginResponse();
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("returns 404 when user not found", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .post("/admin/login")
        .send({ email: "unknown@test.com", password: "Password123" });

      expect(res).toHaveStatus(404);
      expect(res.body.error).toEqual(
        require("@/utils").errorMessages.userNotFound
      );
    });

    it("returns 401 when password invalid", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (verifyField as jest.Mock).mockResolvedValueOnce(false);

      const res = await request(app)
        .post("/admin/login")
        .send({ email: "admin@test.com", password: "Password12345" });

      expect(res).toHaveStatus(401);
      expect(res.body.error).toEqual(
        require("@/utils").errorMessages.invalidCredentials
      );
    });

    it("returns 400 when validation fails (missing/invalid fields)", async () => {
      const res = await request(app).post("/admin/login").send({ email: "" });

      expect(res).toHaveStatus(400);
      const params = res.body.errors.map((e: any) => e.param);
      expect(params).toEqual(expect.arrayContaining(["password", "email"]));
    });
    it("matches snapshot on successful login", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
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
        .post("/admin/login")
        .send({ email: "admin@test.com", password: "correctPass" });

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

  describe("GET /admin/renew", () => {
    it("returns 401 if no tokens provided", async () => {
      const res = await request(app).get("/admin/renew");

      expect(res).toHaveStatus(401);
      expect(res.body.error).toEqual(
        require("@/utils").errorMessages.noTokenProvided
      );
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

      expect(res.status).toBe(200);
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
      expect(res.body.error).toEqual(
        require("@/utils").errorMessages.invalidRefreshToken
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
      expect(res.body.error).toEqual(
        require("@/utils").errorMessages.jwtSecretNotProvided
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

      expect(res.status).toBe(500);
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
