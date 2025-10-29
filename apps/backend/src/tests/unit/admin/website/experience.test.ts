import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

jest.mock("@/config", () => ({
  prisma: {
    experience: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    file: {
      create: jest.fn(),
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
    experienceNotFound: {
      en: "Experience not found",
      ka: "გამოცდილება ვერ მოიძებნა",
    },
    experienceDeleted: {
      en: "Experience deleted successfully",
      ka: "გამოცდილება წარმატებით წაიშალა",
    },
  };

  return {
    ...actual,
    createTranslations: jest.fn((translations: any) =>
      Object.entries(translations).map(([lang, payload]: any) => ({
        language: { connect: { code: lang } },
        name: payload.name,
        position: payload.position,
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
import { adminExperienceRouter } from "@/routes/admin/website/experience";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/admin/experience", adminExperienceRouter);

const mockExperience = {
  id: "44444444-4444-4444-4444-444444444444",
  translations: [
    {
      id: "t1",
      name: "Company",
      position: "Dev",
      description: "desc",
      language: { code: "en" },
    },
    {
      id: "t2",
      name: "კომპანია",
      position: "დევ",
      description: "desc ka",
      language: { code: "ka" },
    },
  ],
  icon: null,
  link: null,
  location: null,
  fromDate: "2019-01-01",
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Admin Experience routes — /admin/experience", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /admin/experience", () => {
    it("returns list of experiences with count", async () => {
      (prisma.experience.findMany as jest.Mock).mockResolvedValueOnce([
        mockExperience,
      ]);
      (prisma.experience.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/admin/experience");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toEqual(1);
      expect(prisma.experience.findMany).toHaveBeenCalled();
      expect(prisma.experience.count).toHaveBeenCalled();
    });

    it("handles DB error gracefully", async () => {
      (prisma.experience.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );

      const res = await request(app).get("/admin/experience");

      expect(res.statusCode).toBe(500);
    });
  });

  describe("GET /admin/experience/:id", () => {
    it("returns single experience when found", async () => {
      (prisma.experience.findUnique as jest.Mock).mockResolvedValueOnce(
        mockExperience
      );

      const res = await request(app).get(
        `/admin/experience/${mockExperience.id}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toEqual(mockExperience.id);
      expect(prisma.experience.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockExperience.id } })
      );
    });

    it("returns 404 when not found", async () => {
      (prisma.experience.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get(
        `/admin/experience/${mockExperience.id}`
      );

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid UUID", async () => {
      const res = await request(app).get("/admin/experience/invalid-uuid");
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("DELETE /admin/experience/:id", () => {
    it("deletes experience successfully", async () => {
      (prisma.experience.delete as jest.Mock).mockResolvedValueOnce(
        mockExperience
      );

      const res = await request(app).delete(
        `/admin/experience/${mockExperience.id}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message");
      expect(prisma.experience.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockExperience.id } })
      );
    });

    it("returns 404 when prisma returns null", async () => {
      (prisma.experience.delete as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).delete(
        `/admin/experience/${mockExperience.id}`
      );

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("handles delete DB error (500)", async () => {
      (prisma.experience.delete as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );

      const res = await request(app).delete(
        `/admin/experience/${mockExperience.id}`
      );

      expect(res.statusCode).toBe(500);
    });

    it("returns 400 for invalid UUID", async () => {
      const res = await request(app).delete("/admin/experience/not-uuid");
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });
});
