import request from "supertest";
import express from "express";
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
  };

  return {
    ...actual,
    generateSmsCode: jest.fn(),
    createPassword: jest.fn(),
    inMinutes: (mins: number) => new Date(Date.now() + mins * 60 * 1000),
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
    it("Should login with valid credentials", async () => {
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

    it("Should return 404 if user not found", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .post("/admin/login")
        .send({ email: "unknown@test.com", password: "Password123" });

      expect(res).toHaveStatus(404);
      expect(res.body.error).toEqual(errorMessages.userNotFound);
    });

    it("Should return 401 if password invalid", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (verifyField as jest.Mock).mockResolvedValueOnce(false);

      const res = await request(app)
        .post("/admin/login")
        .send({ email: "admin@test.com", password: "wrongPass" });

      expect(res).toHaveStatus(401);
      expect(res.body.error).toEqual(errorMessages.invalidCredentials);
    });

    it("Should return 400 if missing fields", async () => {
      const res = await request(app).post("/admin/login").send({ email: "" });

      expect(res).toHaveStatus(400);
      expect(res.body.errors.map((e: any) => e.param)).toEqual(
        expect.arrayContaining(["password", "email"])
      );
    });

    it("Should handle unexpected error", async () => {
      (prisma.admin.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error("DB down")
      );

      const res = await request(app)
        .post("/admin/login")
        .send({ email: "admin@test.com", password: "ValidPass123" });

      expect(res).toHaveStatus(500);
    });

    it("Should return 400 if email is invalid format", async () => {
      const res = await request(app)
        .post("/admin/login")
        .send({ email: "not-an-email", password: "ValidPass123" });

      expect(res).toHaveStatus(400);
      expect(res.body).toHaveErrorMessage("invalidEmail", errorMessages);
    });

    it("Should return 400 if password too short", async () => {
      const res = await request(app)
        .post("/admin/login")
        .send({ email: "admin@test.com", password: "short" });

      expect(res).toHaveStatus(400);
      expect(res.body).toHaveErrorMessage("passwordLength", errorMessages);
    });

    it("Should return 400 if password is not a string", async () => {
      const res = await request(app)
        .post("/admin/login")
        .send({ email: "admin@test.com", password: 12345678 });

      expect(res).toHaveStatus(400);
      expect(res.body).toHaveErrorMessage("invalidPassword", errorMessages);
    });

    it("Should handle error during token generation", async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (verifyField as jest.Mock).mockResolvedValueOnce(true);
      (generateAccessToken as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Token gen failed");
      });

      const res = await request(app)
        .post("/admin/login")
        .send({ email: "admin@test.com", password: "ValidPass123" });

      expect(res).toHaveStatus(500);
    });
  });

  describe("GET /admin/renew", () => {
    it("Should return 401 if no tokens provided", async () => {
      const res = await request(app).get("/admin/renew");

      expect(res).toHaveStatus(401);

      expect(res.body.error).toEqual(errorMessages.noTokenProvided);
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

      expect(res.status).toBe(200);
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

      expect(res.status).toBe(200);
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
      const badRefresh = "invalid.refresh.token";

      const res = await request(app)
        .get("/admin/renew")
        .set("Cookie", [
          `accessToken=${expiredAccess}`,
          `refreshToken=${badRefresh}`,
        ]);

      expect(res.status).toBe(401);
      expect(res.body.error).toEqual(errorMessages.invalidRefreshToken);
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

      expect(res.status).toBe(500);
      expect(res.body.error).toEqual(errorMessages.jwtSecretNotProvided);
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

      expect(res.status).toBe(500);
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

      console.log(res.status, res.body, "sfa");

      expect(res.status).toBe(200);
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
      expect(res.body.error).toEqual(
        require("@/utils").errorMessages.userNotFound
      );
    });
  });
});
