import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

jest.mock("@/config", () => ({
  prisma: {
    introduce: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
  getEnvVariable: jest.fn(() => "test"),
}));

jest.mock("@/middlewares/admin", () => ({
  isAdminVerified: (req: any, res: any, next: any) => next(),
  adminAuthenticate: (req: any, res: any, next: any) => next(),
}));

jest.mock("@/middlewares/global/validationHandler", () => {
  return {
    validationHandler: (req: any, res: any, next: any) => {
      const { validationResult } = require("express-validator");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      return next();
    },
  };
});

jest.mock("@/validations/admin", () => {
  const actual = jest.requireActual("@/validations/admin");
  return {
    ...actual,
    fetchIntroduceValidation: [],
  };
});

jest.mock("@/utils", () => {
  const actual = jest.requireActual("@/utils");
  const errorMessages = {
    ...((actual as any).errorMessages ?? {}),
    introduceNotFound: {
      en: "Introduce not found",
      ka: "შესავალი ვერ მოიძებნა",
    },
    introduceDeleted: {
      en: "Introduce deleted successfully",
      ka: "შესავალი წარმატებით წაიშალა",
    },
  };

  return {
    ...actual,
    getResponseMessage: jest.fn(
      (key: string) => (errorMessages as any)[key] ?? key
    ),
    sendError: jest.fn((req: any, res: any, status: number, key: string) =>
      res.status(status).json({ error: (errorMessages as any)[key] ?? key })
    ),
    logAdminError: jest.fn(),
    logAdminInfo: jest.fn(),
    logAdminWarn: jest.fn(),
    errorMessages,
  };
});

import { prisma } from "@/config";
import { adminIntroduceRouter } from "@/routes/admin/website/introduce";
import { authMatchers } from "@/tests/helpers/authMatchers";

expect.extend(authMatchers);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/admin/introduce", adminIntroduceRouter);

const mockIntroduce = {
  id: "11111111-1111-1111-1111-111111111111",
  translations: [
    {
      id: "t-en",
      headline: "Hello",
      description: "Desc",
      language: { code: "en" },
    },
    {
      id: "t-ka",
      headline: "გამარჯობა",
      description: "აღწერა",
      language: { code: "ka" },
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Admin Introduce routes — /admin/introduce", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /admin/introduce", () => {
    it("returns the introduce when found", async () => {
      (prisma.introduce.findFirst as jest.Mock).mockResolvedValueOnce(
        mockIntroduce
      );

      const res = await request(app).get("/admin/introduce");

      expect(res).toHaveStatus(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.translations).toHaveLength(2);
      expect(prisma.introduce.findFirst).toHaveBeenCalled();
    });

    it("returns 404 when introduce not found", async () => {
      (prisma.introduce.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get("/admin/introduce");

      expect(res).toHaveStatus(404);
      expect(res.body).toHaveProperty("error");
    });

    it("handles DB error gracefully", async () => {
      (prisma.introduce.findFirst as jest.Mock).mockRejectedValueOnce(
        new Error("DB")
      );

      const res = await request(app).get("/admin/introduce");
      expect(res).toHaveStatus(500);
    });
  });
});
