import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@/config";
import { authMatchers } from "@/tests/helpers/authMatchers";
import { pageComponentRouter } from "@/routes/customer/website/page-component";

jest.mock("@/config", () => ({
  prisma: {
    pageComponent: {
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
    parseBooleanQuery: jest.fn(),
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
app.use("/page-component", pageComponentRouter);

const mockPageComponent = {
  slug: "test-component",
  footerOrder: 1,
  translations: [
    {
      name: "Test",
      content: "Content",
      description: "Description",
      language: { code: "en" },
    },
    {
      name: "ტესტი",
      content: "კონტენტი",
      description: "აღწერა",
      language: { code: "ka" },
    },
  ],
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Customer pageComponent routes — /page-component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /page-component", () => {
    it("returns list of pageComponents with count", async () => {
      (prisma.pageComponent.findMany as jest.Mock).mockResolvedValueOnce([
        mockPageComponent,
      ]);
      (prisma.pageComponent.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/page-component");

      expect(res).toHaveStatus(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toEqual(1);
      expect(prisma.pageComponent.findMany).toHaveBeenCalled();
      expect(prisma.pageComponent.count).toHaveBeenCalled();
    });

    it("handles DB error gracefully", async () => {
      (prisma.pageComponent.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );
      const res = await request(app).get("/page-component");
      expect(res).toHaveStatus(500);
    });
  });

  describe("GET /admin/page-component/:slug", () => {
    it("returns single pageComponent when found", async () => {
      (prisma.pageComponent.findUnique as jest.Mock).mockResolvedValueOnce(
        mockPageComponent
      );

      const res = await request(app).get(
        `/page-component/${mockPageComponent.slug}`
      );

      expect(res).toHaveStatus(200);
      expect(res.body.data.slug).toBe(mockPageComponent.slug);
      expect(prisma.pageComponent.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { slug: mockPageComponent.slug } })
      );
    });

    it("returns 404 when not found", async () => {
      (prisma.pageComponent.findUnique as jest.Mock).mockResolvedValueOnce(
        null
      );
      const res = await request(app).get(
        `/page-component/${mockPageComponent.slug}`
      );
      expect(res).toHaveStatus(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid slug", async () => {
      const res = await request(app).get("/page-component/INVALID SLUG");
      expect(res).toHaveStatus(400);
    });
  });
});
