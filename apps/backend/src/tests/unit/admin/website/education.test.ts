import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

jest.mock("@/config", () => ({
  prisma: {
    education: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
  getEnvVariable: jest.fn((key: string) => {
    if (key === "ADMIN_JWT_ACCESS_SECRET") return "accessSecret";
    if (key === "ADMIN_JWT_REFRESH_SECRET") return "refreshSecret";
    return "test";
  }),
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
    educationNotFound: {
      en: "Education not found",
      ka: "განათლება ვერ მოიძებნა",
    },
    educationDeleted: {
      en: "Education deleted successfully",
      ka: "განათლება წარმატებით წაიშალა",
    },
  };

  return {
    ...actual,
    createTranslations: jest.fn((translations: any) =>
      Object.entries(translations).map(([lang, payload]: any) => ({
        language: { connect: { code: lang } },
        name: payload.name,
        degree: payload.degree,
        description: payload.description,
      }))
    ),
    generateWhereInput: jest.fn(() => ({})),
    parseFilters: jest.fn(() => ({})),
    parseDate: jest.fn(() => null),
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
    sendError: jest.fn((req: any, res: any, status: number, key: string) => {
      res.status(status).json({ error: (errorMessages as any)[key] ?? key });
    }),
    logAdminError: jest.fn(),
    logAdminInfo: jest.fn(),
    logAdminWarn: jest.fn(),
    errorMessages,
  };
});

import { prisma } from "@/config";
import { adminEducationRouter } from "@/routes/admin/website/education";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/admin/education", adminEducationRouter);

const mockEducation = {
  id: "33333333-3333-3333-3333-333333333333",
  translations: [
    {
      id: "t1",
      name: "Uni",
      degree: "BSc",
      description: "desc",
      language: { code: "en" },
    },
    {
      id: "t2",
      name: "უნი",
      degree: "ბაკალავრი",
      description: "desc ka",
      language: { code: "ka" },
    },
  ],
  icon: null,
  link: null,
  fromDate: "2020-01-01",
  endDate: null,
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Admin Education routes — /admin/education", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /admin/education", () => {
    it("returns list of educations with count", async () => {
      (prisma.education.findMany as jest.Mock).mockResolvedValueOnce([
        mockEducation,
      ]);
      (prisma.education.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/admin/education");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toEqual(1);
      expect(prisma.education.findMany).toHaveBeenCalled();
      expect(prisma.education.count).toHaveBeenCalled();
    });

    it("handles DB error gracefully", async () => {
      (prisma.education.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );

      const res = await request(app).get("/admin/education");

      expect(res.statusCode).toBe(500);
    });
  });

  describe("GET /admin/education/:id", () => {
    it("returns single education when found", async () => {
      (prisma.education.findUnique as jest.Mock).mockResolvedValueOnce(
        mockEducation
      );

      const res = await request(app).get(
        `/admin/education/${mockEducation.id}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toEqual(mockEducation.id);
      expect(prisma.education.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockEducation.id } })
      );
    });

    it("returns 404 when not found", async () => {
      (prisma.education.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get(
        `/admin/education/${mockEducation.id}`
      );

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid UUID", async () => {
      const res = await request(app).get("/admin/education/invalid-uuid");
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("DELETE /admin/education/:id", () => {
    it("deletes education successfully", async () => {
      (prisma.education.delete as jest.Mock).mockResolvedValueOnce(
        mockEducation
      );

      const res = await request(app).delete(
        `/admin/education/${mockEducation.id}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message");
      expect(prisma.education.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockEducation.id } })
      );
    });

    it("returns 404 when prisma returns null", async () => {
      (prisma.education.delete as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).delete(
        `/admin/education/${mockEducation.id}`
      );

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("handles delete DB error (500)", async () => {
      (prisma.education.delete as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );

      const res = await request(app).delete(
        `/admin/education/${mockEducation.id}`
      );

      expect(res.statusCode).toBe(500);
    });

    it("returns 400 for invalid UUID", async () => {
      const res = await request(app).delete("/admin/education/not-uuid");
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("POST /admin/education", () => {
    it("creates education successfully", async () => {
      (prisma.education.create as jest.Mock).mockResolvedValueOnce(
        mockEducation
      );

      const payload = {
        translations: {
          en: { name: "New Uni", degree: "MSc", description: "desc" },
          ka: { name: "უნიში", degree: "მაგისტრატი", description: "desc ka" },
        },
        icon: null,
        link: "https://example.com",
        fromDate: "2020-01-01",
      };

      const res = await request(app).post("/admin/education").send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(prisma.education.create).toHaveBeenCalled();
    });

    it("returns 400 when translations missing/invalid", async () => {
      const res = await request(app)
        .post("/admin/education")
        .send({ translations: {} });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("handles DB error with 500", async () => {
      (prisma.education.create as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );

      const payload = {
        translations: {
          en: { name: "New Uni", degree: "MSc", description: "desc" },
          ka: { name: "უნიში", degree: "მაგისტრატი", description: "desc ka" },
        },
        icon: null,
        link: "https://example.com",
        fromDate: "2020-01-01",
      };

      const res = await request(app).post("/admin/education").send(payload);

      expect(res.statusCode).toBe(500);
    });
  });

  describe("PUT /admin/education/:id", () => {
    it("updates education successfully with new icon", async () => {
      const id = mockEducation.id;
      (prisma.education.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockEducation,
        icon: null,
      });

      (prisma.education.update as jest.Mock).mockResolvedValueOnce({
        ...mockEducation,
        translations: [
          {
            id: "t1",
            name: "Updated",
            degree: "X",
            description: "D",
            language: { code: "en" },
          },
        ],
      });

      const payload = {
        translations: {
          en: { name: "Updated", degree: "X", description: "D" },
          ka: { name: "განახლება", degree: "Xka", description: "Dka" },
        },
        icon: { path: "/i.png", name: "i.png", size: 50 },
        link: "https://example.com",
        fromDate: "2020-01-01",
      };

      const res = await request(app)
        .put(`/admin/education/${id}`)
        .send(payload);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(prisma.education.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id },
          include: { icon: true },
        })
      );
      expect(prisma.education.update).toHaveBeenCalled();
    });

    it("returns 404 when updating non-existing education", async () => {
      const id = mockEducation.id;
      (prisma.education.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put(`/admin/education/${id}`)
        .send({
          translations: {
            en: { name: "x", degree: "d", description: "d" },
            ka: { name: "x", degree: "d", description: "d" },
          },
          fromDate: "2020-01-01",
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid UUID param", async () => {
      const res = await request(app)
        .put("/admin/education/not-a-uuid")
        .send({
          translations: {
            en: { name: "x", degree: "d", description: "d" },
            ka: { name: "x", degree: "d", description: "d" },
          },
          fromDate: "2020-01-01",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("handles DB error with 500 on update", async () => {
      const id = mockEducation.id;
      (prisma.education.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockEducation,
        icon: null,
      });
      (prisma.education.update as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );

      const res = await request(app)
        .put(`/admin/education/${id}`)
        .send({
          translations: {
            en: { name: "x", degree: "d", description: "d" },
            ka: { name: "x", degree: "d", description: "d" },
          },
          fromDate: "2020-01-01",
        });

      expect(res.statusCode).toBe(500);
    });
  });
});
