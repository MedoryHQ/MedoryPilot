import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

jest.mock("@/config", () => ({
  prisma: {
    pageComponent: {
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
    fetchPageComponentValidation: [],
  };
});

jest.mock("@/utils", () => {
  const actual = jest.requireActual("@/utils");
  const errorMessages = {
    ...((actual as any).errorMessages ?? {}),
    pageNotFound: {
      en: "Page not found",
      ka: "გვერდი ვერ მოიძებნა",
    },
    pageDeleted: {
      en: "Page deleted successfully",
      ka: "გვერდი წარმატებით წაიშალა",
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
import { adminPageComponentRouter } from "@/routes/admin/website/page-component";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/admin/page-component", adminPageComponentRouter);

const mockPageComponent = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  slug: "home-component",
  footerId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  footerOrder: 2,
  translations: [
    {
      name: "Homepage block",
      content: "Some content",
      language: { code: "en" },
    },
    { name: "მთავარი ბლოკი", content: "ტექსტი", language: { code: "ka" } },
  ],
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Admin PageComponent (integration-style) — /admin/page-component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /admin/page-component", () => {
    it("returns list with count", async () => {
      (prisma.pageComponent.findMany as jest.Mock).mockResolvedValueOnce([
        mockPageComponent,
      ]);
      (prisma.pageComponent.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/admin/page-component");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toBe(1);
      expect(prisma.pageComponent.findMany).toHaveBeenCalled();
      expect(prisma.pageComponent.count).toHaveBeenCalled();
    });

    it("returns empty list when no items", async () => {
      (prisma.pageComponent.findMany as jest.Mock).mockResolvedValueOnce([]);
      (prisma.pageComponent.count as jest.Mock).mockResolvedValueOnce(0);

      const res = await request(app).get("/admin/page-component");

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it("handles DB errors", async () => {
      (prisma.pageComponent.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );
      const res = await request(app).get("/admin/page-component");
      expect(res.status).toBe(500);
    });
  });
});
