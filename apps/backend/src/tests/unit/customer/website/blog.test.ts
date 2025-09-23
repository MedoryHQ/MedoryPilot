import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@/config";
import { authMatchers } from "@/tests/helpers/authMatchers";
import { blogRouter } from "@/routes/customer/website/blog";

jest.mock("@/config", () => ({
  prisma: {
    blog: {
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
    parseBooleanQuery: jest.fn(() => undefined),
    parseQueryParams: jest.fn(() => ({})),
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
    sendError: jest.fn((req, res, status, key) =>
      res.status(status).json({ error: key })
    ),
    logCustomerCatchyError: jest.fn(),
    logCustomerWarn: jest.fn(),
  };
});

expect.extend(authMatchers);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/blog", blogRouter);

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

describe("Customer blog routes — /blog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /blog", () => {
    it("returns list of blogs with count", async () => {
      (prisma.blog.findMany as jest.Mock).mockResolvedValueOnce([mockBlog]);
      (prisma.blog.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/blog");

      expect(res).toHaveStatus(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toEqual(1);
      expect(prisma.blog.findMany).toHaveBeenCalled();
      expect(prisma.blog.count).toHaveBeenCalled();
    });

    it("handles DB error gracefully", async () => {
      (prisma.blog.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );
      const res = await request(app).get("/blog");
      expect(res).toHaveStatus(500);
    });
  });
});
