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
  isAdminVerified: (req: any, _res: any, next: any) => next(),
  adminAuthenticate: (req: any, _res: any, next: any) => next(),
}));

jest.mock("@/validations/admin", () => {
  const actual = jest.requireActual("@/validations/admin");
  return {
    ...actual,
    fetchNewsValidation: [],
  };
});

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
    getPaginationAndFilters: jest.fn((req: any) => {
      const page = Number(req.query.page) || 1;
      const take = Number(req.query.take) || 10;
      const orderBy = req.query.orderBy
        ? { order: req.query.orderBy }
        : { order: "asc" };
      return {
        skip: (page - 1) * take,
        take,
        orderBy,
        search: req.query.search,
      };
    }),
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
  background: { id: "bg1", path: "/b.png", name: "b.png", size: 10 },
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

describe("Admin News (integration-style) — /admin/news", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /admin/news", () => {
    it("returns list of news with count", async () => {
      (prisma.news.findMany as jest.Mock).mockResolvedValueOnce([mockNews]);
      (prisma.news.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/admin/news");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toBe(1);
      expect(prisma.news.findMany).toHaveBeenCalled();
      expect(prisma.news.count).toHaveBeenCalled();
    });

    it("supports query params: pagination + orderBy + search", async () => {
      (prisma.news.findMany as jest.Mock).mockResolvedValueOnce([mockNews]);
      (prisma.news.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app)
        .get("/admin/news")
        .query({ page: "2", take: "5", orderBy: "desc", search: "something" });

      expect(res.status).toBe(200);
      expect(prisma.news.findMany).toHaveBeenCalled();
      expect(prisma.news.count).toHaveBeenCalled();
    });

    it("filters by showInLanding query param (true/false)", async () => {
      (prisma.news.findMany as jest.Mock).mockResolvedValueOnce([]);
      (prisma.news.count as jest.Mock).mockResolvedValueOnce(0);

      const resTrue = await request(app)
        .get("/admin/news")
        .query({ showInLanding: "true" });
      expect(resTrue.status).toBe(200);
      expect(prisma.news.findMany).toHaveBeenCalled();

      const resFalse = await request(app)
        .get("/admin/news")
        .query({ showInLanding: "false" });
      expect(resFalse.status).toBe(200);
      expect(prisma.news.findMany).toHaveBeenCalled();
    });

    it("returns empty list when there are no news", async () => {
      (prisma.news.findMany as jest.Mock).mockResolvedValueOnce([]);
      (prisma.news.count as jest.Mock).mockResolvedValueOnce(0);

      const res = await request(app).get("/admin/news");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it("handles DB error gracefully", async () => {
      (prisma.news.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB")
      );
      const res = await request(app).get("/admin/news");
      expect(res.status).toBe(500);
    });
  });

  describe("GET /admin/news/:slug", () => {
    it("returns single news when found", async () => {
      (prisma.news.findUnique as jest.Mock).mockResolvedValueOnce(mockNews);

      const res = await request(app).get(`/admin/news/${mockNews.slug}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("slug", mockNews.slug);
      expect(prisma.news.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { slug: mockNews.slug } })
      );
    });

    it("returns 404 when not found", async () => {
      (prisma.news.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get(`/admin/news/${mockNews.slug}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 404 for invalid slug", async () => {
      const res = await request(app).get("/admin/news/INVALID SLUG!!");
      expect(res.status).toBe(404);
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

    it("creates news successfully (without background)", async () => {
      (prisma.news.create as jest.Mock).mockResolvedValueOnce({
        ...mockNews,
        ...createPayload,
        background: null,
      });

      const res = await request(app).post("/admin/news").send(createPayload);
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("slug", createPayload.slug);
      expect(prisma.news.create).toHaveBeenCalled();
    });

    it("creates news with background when provided", async () => {
      const payloadWithBg = {
        ...createPayload,
        background: { path: "/bg.png", name: "bg.png", size: 100 },
      };

      (prisma.news.create as jest.Mock).mockResolvedValueOnce({
        ...mockNews,
        ...payloadWithBg,
      });

      const res = await request(app).post("/admin/news").send(payloadWithBg);
      expect(res.status).toBe(201);
      expect(prisma.news.create).toHaveBeenCalled();
      const createCall = (prisma.news.create as jest.Mock).mock.calls[0][0];
      expect(createCall).toHaveProperty("data");
      expect(createCall.data).toHaveProperty("translations");
      expect(createCall.data).toHaveProperty("background");
      expect(createCall.data.background).toHaveProperty("create");
      expect(createCall.data.background.create).toMatchObject({
        path: "/bg.png",
        name: "bg.png",
        size: 100,
      });
    });

    it("returns 400 for invalid body", async () => {
      const res = await request(app)
        .post("/admin/news")
        .send({ slug: "", translations: {} });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("returns 500 when DB create fails", async () => {
      (prisma.news.create as jest.Mock).mockRejectedValueOnce(
        new Error("DB create err")
      );
      const res = await request(app).post("/admin/news").send(createPayload);
      expect(res.status).toBe(500);
    });
  });
});
