import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@/config";
import { adminServiceRouter } from "@/routes/admin/website/service";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/service", adminServiceRouter);

jest.mock("@/config", () => ({
  prisma: {
    service: {
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
    fetchServiceValidation: [],
  };
});

jest.mock("@/utils", () => {
  const actual = jest.requireActual("@/utils");
  const errorMessages = {
    ...((actual as any).errorMessages ?? {}),
    serviceNotFound: { en: "Service not found", ka: "სერვისი ვერ მოიძებნა" },
    serviceDeleted: {
      en: "Service deleted successfully",
      ka: "სერვისი წარმატებით წაიშალა",
    },
  };

  return {
    ...actual,
    createTranslations: jest.fn((translations: any) =>
      Object.entries(translations).map(([lang, payload]: any) => ({
        language: { connect: { code: lang } },
        title: payload.title,
        description: payload.description,
      }))
    ),
    generateWhereInput: jest.fn(() => ({})),
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
    GLOBAL_ERROR_MESSAGE: "GLOBAL_ERROR",
    errorMessages,
    logAdminError: jest.fn(),
    logAdminInfo: jest.fn(),
    logAdminWarn: jest.fn(),
  };
});

const mockService = {
  id: "22222222-2222-2222-2222-222222222222",
  translations: [
    { id: "t1", title: "S1", description: "desc", language: { code: "en" } },
    {
      id: "t2",
      title: "S1 ka",
      description: "desc ka",
      language: { code: "ka" },
    },
  ],
  icon: null,
  background: null,
};

const createPayload = {
  translations: {
    en: { title: "New", description: "desc" },
    ka: { title: "ახალი", description: "მოკლე" },
  },
  icon: { path: "/p.png", name: "p.png", size: 123 },
  background: null,
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Admin Service (integration-style) — /service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /service", () => {
    it("returns list of services with count", async () => {
      (prisma.service.findMany as jest.Mock).mockResolvedValueOnce([
        mockService,
      ]);
      (prisma.service.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/service");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toEqual(1);
    });

    it("handles DB error gracefully", async () => {
      (prisma.service.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );
      const res = await request(app).get("/service");
      expect(res.status).toBe(500);
    });

    it("returns empty list when no services", async () => {
      (prisma.service.findMany as jest.Mock).mockResolvedValueOnce([]);
      (prisma.service.count as jest.Mock).mockResolvedValueOnce(0);
      const res = await request(app).get("/service");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.count).toBe(0);
    });
  });
});
