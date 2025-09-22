import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@/config";
import { authMatchers } from "@/tests/helpers/authMatchers";
import { newsRouter } from "@/routes/customer/website/news";

jest.mock("@/config", () => ({
  prisma: {
    news: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
  getEnvVariable: jest.fn(() => {
    return "test";
  }),
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
  return {
    ...actual,
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

    logCustomerCatchyError: jest.fn(),
  };
});

expect.extend(authMatchers);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/news", newsRouter);

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

describe("Customer news routes — /news", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /news", () => {
    it("returns list of newses with count", async () => {
      (prisma.news.findMany as jest.Mock).mockResolvedValueOnce([mockNews]);
      (prisma.news.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/news");

      expect(res).toHaveStatus(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toEqual(1);
      expect(prisma.news.findMany).toHaveBeenCalled();
      expect(prisma.news.count).toHaveBeenCalled();
    });

    it("handles DB error gracefully", async () => {
      (prisma.news.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );
      const res = await request(app).get("/news");
      expect(res).toHaveStatus(500);
    });
  });

  describe("GET /admin/news/:slug", () => {
    it("returns single news when found", async () => {
      (prisma.news.findUnique as jest.Mock).mockResolvedValueOnce(mockNews);

      const res = await request(app).get(`/news/${mockNews.slug}`);

      expect(res).toHaveStatus(200);
      expect(res.body.data.slug).toBe(mockNews.slug);
      expect(prisma.news.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { slug: mockNews.slug } })
      );
    });

    it("returns 404 when not found", async () => {
      (prisma.news.findUnique as jest.Mock).mockResolvedValueOnce(null);
      const res = await request(app).get(`/news/${mockNews.slug}`);
      expect(res).toHaveStatus(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid slug", async () => {
      const res = await request(app).get("/news/INVALID SLUG");
      expect(res).toHaveStatus(400);
    });
  });
});
