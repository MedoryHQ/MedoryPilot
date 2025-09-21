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

  describe("GET /admin/faq/:id", () => {
    it("returns single FAQ when found", async () => {
      (prisma.fAQ.findUnique as jest.Mock).mockResolvedValueOnce(mockFAQ);

      const res = await request(app).get(`/admin/faq/${mockFAQ.id}`);

      expect(res).toHaveStatus(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toEqual(mockFAQ.id);
      expect(prisma.fAQ.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockFAQ.id },
        })
      );
    });

    it("returns 404 when FAQ not found", async () => {
      (prisma.fAQ.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get(`/admin/faq/${mockFAQ.id}`);
      expect(res).toHaveStatus(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid UUID", async () => {
      const res = await request(app).get("/admin/faq/invalid-uuid");
      expect(res).toHaveStatus(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("POST /admin/faq", () => {
    it("creates FAQ successfully", async () => {
      const createPayload = {
        order: 5,
        translations: {
          en: { question: "New?", answer: "Yes." },
          ka: { question: "სიახლე?", answer: "დიახ." },
        },
      };

      (prisma.fAQ.create as jest.Mock).mockResolvedValueOnce({
        ...mockFAQ,
        order: createPayload.order,
      });

      const res = await request(app).post("/admin/faq").send(createPayload);

      expect(res).toHaveStatus(201);
      expect(res.body.data).toBeDefined();
      expect(prisma.fAQ.create).toHaveBeenCalled();
    });

    it("returns 400 when translations missing or invalid", async () => {
      const res = await request(app)
        .post("/admin/faq")
        .send({ translations: {} });
      console.log(res.body, res.status, res.body.error, res.body.errors);
      expect(res).toHaveStatus(400);
      expect(res.body).toHaveProperty("errors");
    });
  });
});
