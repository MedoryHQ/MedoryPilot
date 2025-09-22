// tests/admin/news.test.ts
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

jest.mock("@/config", () => ({
  prisma: {
    news: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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

jest.mock("@/utils", () => {
  const actual = jest.requireActual("@/utils");
  const errorMessages = {
    ...((actual as any).errorMessages ?? {}),
    newsNotFound: {
      en: "News not found",
      ka: "სიახლე ვერ მოიძებნა",
    },
    newsDeleted: {
      en: "News deleted successfully",
      ka: "სიახლე წარმატებით წაიშალა",
    },
  };
  return {
    ...actual,
    getPaginationAndFilters: jest.fn(() => ({
      skip: 0,
      take: 10,
      orderBy: { order: "asc" },
      search: undefined,
    })),
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
import { adminNewsRouter } from "@/routes/admin/website/news";
import { authMatchers } from "@/tests/helpers/authMatchers";

expect.extend(authMatchers);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/admin/news", adminNewsRouter);

const mockNews = {
  id: "11111111-1111-1111-1111-111111111111",
  slug: "test-news",
  order: 1,
  showInLanding: true,
  background: null,
  translations: [
    { content: "Hello", language: { code: "en" } },
    { content: "გამარჯობა", language: { code: "ka" } },
  ],
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Admin News routes — /admin/news", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /admin/news", () => {
    it("returns list of news with count", async () => {
      (prisma.news.findMany as jest.Mock).mockResolvedValueOnce([mockNews]);
      (prisma.news.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/admin/news");

      expect(res).toHaveStatus(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toBe(1);
      expect(prisma.news.findMany).toHaveBeenCalled();
      expect(prisma.news.count).toHaveBeenCalled();
    });

    it("handles DB error gracefully", async () => {
      (prisma.news.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB")
      );
      const res = await request(app).get("/admin/news");
      expect(res).toHaveStatus(500);
    });
  });

  describe("GET /admin/news/:slug", () => {
    it("returns single news when found", async () => {
      (prisma.news.findUnique as jest.Mock).mockResolvedValueOnce(mockNews);

      const res = await request(app).get(`/admin/news/${mockNews.slug}`);

      expect(res).toHaveStatus(200);
      expect(res.body.data.slug).toBe(mockNews.slug);
      expect(prisma.news.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { slug: mockNews.slug } })
      );
    });

    it("returns 404 when not found", async () => {
      (prisma.news.findUnique as jest.Mock).mockResolvedValueOnce(null);
      const res = await request(app).get(`/admin/news/${mockNews.slug}`);
      expect(res).toHaveStatus(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid slug", async () => {
      const res = await request(app).get("/admin/news/INVALID SLUG");
      expect(res).toHaveStatus(400);
    });
  });

  describe("POST /admin/news", () => {
    const createPayload = {
      slug: "new-news",
      showInLanding: true,
      order: 2,
      translations: {
        en: { content: "English content" },
        ka: { content: "ქართული ტექსტი" },
      },
    };

    it("creates news successfully", async () => {
      (prisma.news.create as jest.Mock).mockResolvedValueOnce({
        ...mockNews,
        ...createPayload,
      });

      const res = await request(app).post("/admin/news").send(createPayload);

      expect(res).toHaveStatus(201);
      expect(res.body.data.slug).toBe("new-news");
      expect(prisma.news.create).toHaveBeenCalled();
    });

    it("returns 400 for invalid body", async () => {
      const res = await request(app)
        .post("/admin/news")
        .send({ slug: "", translations: {} });
      expect(res).toHaveStatus(400);
    });
  });

  describe("PUT /admin/news/:slug", () => {
    const updatePayload = {
      showInLanding: false,
      slug: "new-slug",
      translations: {
        en: { content: "Updated content" },
        ka: { content: "განახლებული" },
      },
    };

    it("updates news successfully", async () => {
      (prisma.news.findUnique as jest.Mock).mockResolvedValueOnce(mockNews);
      (prisma.news.update as jest.Mock).mockResolvedValueOnce({
        ...mockNews,
        ...updatePayload,
      });

      const res = await request(app)
        .put(`/admin/news/${mockNews.slug}`)
        .send(updatePayload);

      expect(res).toHaveStatus(200);
      expect(res.body.data.showInLanding).toBe(false);
      expect(prisma.news.update).toHaveBeenCalled();
    });

    it("returns 404 if news not found", async () => {
      (prisma.news.findUnique as jest.Mock).mockResolvedValueOnce(null);
      const res = await request(app)
        .put(`/admin/news/${mockNews.slug}`)
        .send(updatePayload);
      expect(res).toHaveStatus(404);
    });

    it("returns 400 for invalid body", async () => {
      const res = await request(app)
        .put(`/admin/news/${mockNews.slug}`)
        .send({ slug: "" });
      expect(res).toHaveStatus(400);
    });
  });
});
