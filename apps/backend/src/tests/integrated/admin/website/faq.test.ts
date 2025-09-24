import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@/config";
import { adminFAQRouter } from "@/routes/admin/website/FAQ";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/faq", adminFAQRouter);

jest.mock("@/config", () => ({
  prisma: {
    fAQ: {
      findMany: jest.fn(),
      count: jest.fn(),
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
  isAdminVerified: (req: any, _res: any, next: any) => next(),
  adminAuthenticate: (req: any, _res: any, next: any) => next(),
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
    fetchFAQValidation: [],
  };
});

jest.mock("@/utils", () => {
  const actual = jest.requireActual("@/utils");
  const errorMessages = {
    ...((actual as any).errorMessages ?? {}),
    faqNotFound: {
      en: "FAQ not found",
      ka: "FAQ ვერ მოიძებნა",
    },
    FAQDeleted: {
      en: "FAQ deleted successfully",
      ka: "FAQ წარმატებით წაიშალა",
    },
  };
  return {
    ...actual,
    sendError: jest.fn((req: any, res: any, status: number, key: string) =>
      res.status(status).json({ error: (errorMessages as any)[key] ?? key })
    ),
    getResponseMessage: jest.fn((key: string) => key),
    GLOBAL_ERROR_MESSAGE: "GLOBAL_ERROR",
    errorMessages,

    logAdminError: jest.fn(),
    logAdminInfo: jest.fn(),
    logAdminWarn: jest.fn(),
  };
});

const mockFAQ = {
  id: "11111111-1111-1111-1111-111111111111",
  order: 1,
  translations: [
    { question: "What?", answer: "This", language: { code: "en" } },
    { question: "რა?", answer: "ეს", language: { code: "ka" } },
  ],
};

const createFAQPayload = {
  order: 5,
  translations: {
    en: { question: "New?", answer: "Yes." },
    ka: { question: "სიახლე?", answer: "დიახ." },
  },
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Admin FAQ (integration-style) — /faq", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /faq", () => {
    it("returns a list of FAQs", async () => {
      (prisma.fAQ.findMany as jest.Mock).mockResolvedValueOnce([mockFAQ]);
      (prisma.fAQ.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/faq");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toBe(1);
    });

    it("returns empty list when no FAQs exist", async () => {
      (prisma.fAQ.findMany as jest.Mock).mockResolvedValueOnce([]);
      (prisma.fAQ.count as jest.Mock).mockResolvedValueOnce(0);

      const res = await request(app).get("/faq");

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.count).toBe(0);
    });
  });
});
