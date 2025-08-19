import request from "supertest";
import express from "express";
import { adminAuthRouter } from "@/routes/admin";
import { prisma } from "@/config";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyField,
  errorMessages,
} from "@/utils";

const app = express();
app.use(express.json());
app.use("/admin", adminAuthRouter);

jest.mock("../../config", () => ({
  prisma: {
    admin: {
      findUnique: jest.fn(),
    },
  },
  getEnvVariable: jest.fn(() => ""),
}));

jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

jest.mock("@/utils", () => {
  const actual = jest.requireActual("@/utils");
  return {
    ...actual,
    errorMessages: {
      invalidPassword: { en: "Invalid password", ka: "არასწორი პაროლი" },
      passwordLength: { en: "Password length", ka: "პაროლის სიგრძე" },
      invalidEmail: { en: "Invalid email", ka: "ელ-ფოსტა არასწორია" },
      userNotFound: { en: "User not found", ka: "მომხმარებელი ვერ მოიძებნა" },
      invalidCredentials: {
        en: "Invalid email or password",
        ka: "არასწორი ელ-ფოსტა ან პაროლი",
      },
    },
    selectLogger: jest.fn(() => ({
      warn: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    })),
    getClientIp: jest.fn().mockResolvedValue("hashedIp"),
    verifyField: jest.fn(),
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
  };
});

const mockUser = {
  id: "1",
  email: "admin@test.com",
  passwordHash: "hashedPass",
  name: "Test Admin",
};

describe("POST /admin/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      user: { id: "1", email: "admin@test.com", name: "Test Admin" },
      accessToken: "access123",
      refreshToken: "refresh123",
      userType: "ADMIN",
    });
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("Should return 404 if user not found", async () => {
    (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const res = await request(app)
      .post("/admin/login")
      .send({ email: "unknown@test.com", password: "Password123" });

    expect(res.status).toBe(404);
    expect(res.body.error).toEqual(errorMessages.userNotFound);
  });

  it("Should return 401 if password invalid", async () => {
    (prisma.admin.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
    (verifyField as jest.Mock).mockResolvedValueOnce(false);

    const res = await request(app)
      .post("/admin/login")
      .send({ email: "admin@test.com", password: "wrongPass" });

    expect(res.status).toBe(401);
    expect(res.body.error).toEqual(errorMessages.invalidCredentials);
  });

  it("Should return 400 if missing fields", async () => {
    const res = await request(app).post("/admin/login").send({ email: "" });

    expect(res.status).toBe(400);
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

    expect(res.status).toBe(500);
  });

  it("Should return 400 if email is invalid format", async () => {
    const res = await request(app)
      .post("/admin/login")
      .send({ email: "not-an-email", password: "ValidPass123" });

    expect(res.status).toBe(400);
    console.log(res.body);
    expect(res.body.errors.map((e: any) => e.message.en)).toContain(
      errorMessages.invalidEmail.en
    );
  });

  it("Should return 400 if password too short", async () => {
    const res = await request(app)
      .post("/admin/login")
      .send({ email: "admin@test.com", password: "short" });

    expect(res.status).toBe(400);
    expect(res.body.errors.map((e: any) => e.message.en)).toContain(
      errorMessages.passwordLength.en
    );
  });

  it("Should return 400 if password is not a string", async () => {
    const res = await request(app)
      .post("/admin/login")
      .send({ email: "admin@test.com", password: 12345678 });

    expect(res.status).toBe(400);
    expect(res.body.errors.map((e: any) => e.message.en)).toContain(
      errorMessages.invalidPassword.en
    );
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

    expect(res.status).toBe(500);
  });
});
