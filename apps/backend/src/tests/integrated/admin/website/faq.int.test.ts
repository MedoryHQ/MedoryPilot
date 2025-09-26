import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

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

import { prisma } from "@/config";
import { adminFAQRouter } from "@/routes/admin/website/FAQ";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/faq", adminFAQRouter);

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

  describe("GET /faq/:id", () => {
    it("returns a FAQ by id", async () => {
      (prisma.fAQ.findUnique as jest.Mock).mockResolvedValueOnce(mockFAQ);

      const res = await request(app).get(`/faq/${mockFAQ.id}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("id", mockFAQ.id);
    });

    it("returns 404 if FAQ not found", async () => {
      (prisma.fAQ.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get(`/faq/${mockFAQ.id}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("POST /faq", () => {
    it("creates a new FAQ", async () => {
      (prisma.fAQ.create as jest.Mock).mockResolvedValueOnce(mockFAQ);

      const res = await request(app).post("/faq").send(createFAQPayload);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("id", mockFAQ.id);
    });

    it("returns 400 if translations missing", async () => {
      const res = await request(app).post("/faq").send({
        order: 1,
      });

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /faq/:id", () => {
    it("updates a FAQ", async () => {
      (prisma.fAQ.findUnique as jest.Mock).mockResolvedValueOnce(mockFAQ);
      (prisma.fAQ.update as jest.Mock).mockResolvedValueOnce({
        ...mockFAQ,
        order: 2,
      });

      const res = await request(app)
        .put(`/faq/${mockFAQ.id}`)
        .send(createFAQPayload);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("order", 2);
    });

    it("returns 404 if FAQ not found", async () => {
      (prisma.fAQ.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put(`/faq/${mockFAQ.id}`)
        .send(createFAQPayload);

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /faq/:id", () => {
    it("deletes a FAQ", async () => {
      (prisma.fAQ.delete as jest.Mock).mockResolvedValueOnce(mockFAQ);

      const res = await request(app).delete(`/faq/${mockFAQ.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
    });

    it("returns 404 for invalid UUID", async () => {
      const res = await request(app).delete("/admin/faq/not-uuid");

      expect(res.status).toBe(404);
    });
  });
});
