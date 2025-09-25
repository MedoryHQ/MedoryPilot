import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

jest.mock("@/config", () => ({
  prisma: {
    blog: {
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
    fetchBlogValidation: [],
  };
});

jest.mock("@/utils", () => {
  const actual = jest.requireActual("@/utils");
  const errorMessages = {
    ...((actual as any).errorMessages ?? {}),
    blogNotFound: {
      en: "Blog not found",
      ka: "ბლოგი ვერ მოიძებნა",
    },
    blogDeleted: {
      en: "Blog deleted successfully",
      ka: "ბლოგი წარმატებით წაიშალა",
    },
  };

  return {
    ...actual,
    getPaginationAndFilters: jest.fn(() => ({
      skip: 0,
      take: 10,
      orderBy: { createdAt: "desc" },
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
import { adminBlogRouter } from "@/routes/admin/website/blog";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/admin/blogs", adminBlogRouter);

const mockBlog = {
  id: "22222222-2222-2222-2222-222222222222",
  slug: "test-blog",
  showInLanding: true,
  landingOrder: 1,
  background: null,
  categories: [],
  translations: [
    { title: "Hello", content: "World", language: { code: "en" } },
    { title: "გამარჯობა", content: "საერთო", language: { code: "ka" } },
  ],
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Admin Blog (integration-style) — /admin/blogs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /admin/blogs", () => {
    it("returns list of blogs with count", async () => {
      (prisma.blog.findMany as jest.Mock).mockResolvedValueOnce([mockBlog]);
      (prisma.blog.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/admin/blogs");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toBe(1);
      expect(prisma.blog.findMany).toHaveBeenCalled();
      expect(prisma.blog.count).toHaveBeenCalled();
    });

    it("handles DB error gracefully", async () => {
      (prisma.blog.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB")
      );
      const res = await request(app).get("/admin/blogs");
      expect(res.status).toBe(500);
    });
  });

  describe("GET /admin/blogs/:slug", () => {
    it("returns single blog when found", async () => {
      (prisma.blog.findUnique as jest.Mock).mockResolvedValueOnce(mockBlog);

      const res = await request(app).get(`/admin/blogs/${mockBlog.slug}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("slug", mockBlog.slug);
      expect(prisma.blog.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { slug: mockBlog.slug } })
      );
    });

    it("returns 404 when blog not found", async () => {
      (prisma.blog.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get(`/admin/blogs/${mockBlog.slug}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 404 for invalid slug", async () => {
      const res = await request(app).get("/admin/blogs/INVALID SLUG!!");
      expect(res.status).toBe(404);
    });
  });
});
