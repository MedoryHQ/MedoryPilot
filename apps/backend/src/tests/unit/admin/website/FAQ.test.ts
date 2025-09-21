import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

jest.mock("@/config", () => ({
  prisma: {
    fAQ: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
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

jest.mock("@/utils", () => {
  const actual = jest.requireActual("@/utils");
  const errorMessages = {
    ...((actual as any).errorMessages ?? {}),
    faqNotFound: { en: "FAQ not found", ka: "FAQ ვერ მოიძებნა" },
    FAQDeleted: {
      en: "FAQ deleted successfully",
      ka: "FAQ წარმატებით წაიშალა",
    },
  };

  return {
    ...actual,
    createTranslations: jest.fn((translations: any) =>
      Object.entries(translations).map(([lang, payload]: any) => ({
        language: { connect: { code: lang } },
        question: payload.question,
        answer: payload.answer,
      }))
    ),
    generateWhereInput: jest.fn((search: any, fields: any) => ({})),
    getPaginationAndFilters: jest.fn((req: any) => {
      const page = Number(req.query.page) || 1;
      const take = Number(req.query.take) || 10;
      return {
        skip: (page - 1) * take,
        take,
        orderBy: { order: "asc" },
        search: req.query.search,
      };
    }),
    getResponseMessage: jest.fn(
      (key: string) => (errorMessages as any)[key] ?? key
    ),
    sendError: jest.fn((req: any, res: any, status: number, key: string) => {
      res.status(status).json({ error: (errorMessages as any)[key] ?? key });
    }),
    logAdminError: jest.fn(),
    logAdminInfo: jest.fn(),
    logAdminWarn: jest.fn(),
    errorMessages,
  };
});

import { prisma } from "@/config";
import { authMatchers } from "@/tests/helpers/authMatchers";
import { adminFAQRouter } from "@/routes/admin/website/FAQ";
expect.extend(authMatchers);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/admin/faq", adminFAQRouter);

const mockFAQ = {
  id: "11111111-1111-1111-1111-111111111111",
  order: 1,
  translations: [
    {
      id: "t1",
      question: "Q?",
      answer: "A.",
      language: { code: "en" },
    },
  ],
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Admin FAQ routes — /admin/faq", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /admin/faq", () => {
    it("returns list of FAQs with count", async () => {
      (prisma.fAQ.findMany as jest.Mock).mockResolvedValueOnce([mockFAQ]);
      (prisma.fAQ.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/admin/faq");

      expect(res).toHaveStatus(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toEqual(1);
      expect(prisma.fAQ.findMany).toHaveBeenCalled();
      expect(prisma.fAQ.count).toHaveBeenCalled();
    });

    it("handles DB error gracefully", async () => {
      (prisma.fAQ.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );
      const res = await request(app).get("/admin/faq");
      expect(res).toHaveStatus(500);
    });
  });
});
