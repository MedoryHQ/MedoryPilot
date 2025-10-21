import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@/config";
import { adminCategoryRouter } from "@/routes/admin/website/category";

jest.mock("@/config", () => ({
  prisma: {
    category: {
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
    categoryDeleted: {
      en: "Category deleted successfully",
      ka: "კატეგორია წარმატებით წაიშალა",
    },
    categoryNotFound: {
      en: "Category not found",
      ka: "კატეგორია ვერ მოიძებნა",
    },
  };

  return {
    ...actual,
    createTranslations: jest.fn((translations: any) =>
      Object.entries(translations || {}).map(([lang, payload]: any) => ({
        language: { connect: { code: lang } },
        name: payload.name,
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
    sendError: jest.fn((req: any, res: any, status: number, key: string) =>
      res.status(status).json({ error: (errorMessages as any)[key] ?? key })
    ),
    logAdminError: jest.fn(),
    logAdminInfo: jest.fn(),
    logAdminWarn: jest.fn(),
    errorMessages,
  };
});

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/admin/category", adminCategoryRouter);

const mockCategory = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  translations: [
    { id: "t1", name: "Tech", language: { code: "en" } },
    { id: "t2", name: "ტექ", language: { code: "ka" } },
  ],
  _count: { blogs: 5 },
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Admin Category routes — /admin/category", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /admin/category", () => {
    it("returns list of categories with count", async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValueOnce([
        mockCategory,
      ]);
      (prisma.category.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/admin/category");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toEqual(1);
      expect(prisma.category.findMany).toHaveBeenCalled();
      expect(prisma.category.count).toHaveBeenCalled();
    });

    it("handles DB error gracefully", async () => {
      (prisma.category.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );
      const res = await request(app).get("/admin/category");
      expect(res.status).toBe(500);
    });
  });

  describe("GET /admin/category/:id", () => {
    it("returns single category when found", async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValueOnce(
        mockCategory
      );

      const res = await request(app).get(`/admin/category/${mockCategory.id}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toEqual(mockCategory.id);
      expect(prisma.category.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockCategory.id } })
      );
    });

    it("returns 404 when category not found", async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get(`/admin/category/${mockCategory.id}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("handles DB error (500)", async () => {
      (prisma.category.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );
      const res = await request(app).get(`/admin/category/${mockCategory.id}`);
      expect(res.status).toBe(500);
    });
  });
});
