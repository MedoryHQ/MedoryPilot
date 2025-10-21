import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

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

import { prisma } from "@/config";
import { adminCategoryRouter } from "@/routes/admin/website/category";

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

  describe("POST /admin/category", () => {
    it("creates category successfully and calls prisma.create with translations", async () => {
      const payload = {
        translations: { en: { name: "New" }, ka: { name: "ახალი" } },
      };
      (prisma.category.create as jest.Mock).mockResolvedValueOnce({
        ...mockCategory,
        translations: [
          { id: "t3", name: "New", language: { code: "en" } },
          { id: "t4", name: "ახალი", language: { code: "ka" } },
        ],
      });

      const res = await request(app).post("/admin/category").send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(prisma.category.create).toHaveBeenCalledTimes(1);

      const createArg = (prisma.category.create as jest.Mock).mock.calls[0][0];
      expect(createArg).toHaveProperty("data");
      expect(createArg.data).toHaveProperty("translations");
      expect(createArg.data.translations).toHaveProperty("create");
      expect(Array.isArray(createArg.data.translations.create)).toBe(true);
    });

    it("returns 400 when translations missing/invalid", async () => {
      const res = await request(app)
        .post("/admin/category")
        .send({ translations: {} });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("PUT /admin/category/:id", () => {
    it("updates category successfully and calls prisma.update", async () => {
      const updatePayload = {
        translations: { en: { name: "Updated" }, ka: { name: "განახლებული" } },
      };

      (prisma.category.findUnique as jest.Mock).mockResolvedValueOnce(
        mockCategory
      );
      (prisma.category.update as jest.Mock).mockResolvedValueOnce({
        ...mockCategory,
        translations: [{ id: "t5", name: "Updated", language: { code: "en" } }],
      });

      const res = await request(app)
        .put(`/admin/category/${mockCategory.id}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(prisma.category.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockCategory.id } })
      );
      expect(prisma.category.update).toHaveBeenCalled();

      const updateArg = (prisma.category.update as jest.Mock).mock.calls[0][0];
      expect(updateArg).toHaveProperty("where");
      expect(updateArg).toHaveProperty("data");
      expect(updateArg.data).toHaveProperty("translations");
      expect(updateArg.data.translations).toHaveProperty("create");
    });

    it("returns 404 when updating non-existing category", async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put(`/admin/category/${mockCategory.id}`)
        .send({
          translations: { en: { name: "X" }, ka: { name: "Y" } },
        });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid body", async () => {
      const res = await request(app)
        .put(`/admin/category/${mockCategory.id}`)
        .send({ translations: {} });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("DELETE /admin/category/:id", () => {
    it("deletes category successfully", async () => {
      (prisma.category.delete as jest.Mock).mockResolvedValueOnce(mockCategory);

      const res = await request(app).delete(
        `/admin/category/${mockCategory.id}`
      );
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
      expect(prisma.category.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockCategory.id } })
      );
    });

    it("returns 404 when category not found", async () => {
      (prisma.category.delete as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).delete(
        `/admin/category/${mockCategory.id}`
      );
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("handles delete DB error (500)", async () => {
      (prisma.category.delete as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );

      const res = await request(app).delete(
        `/admin/category/${mockCategory.id}`
      );
      expect(res.status).toBe(500);
    });

    it("returns 400 for invalid UUID", async () => {
      const res = await request(app).delete("/admin/category/not-uuid");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });
});
