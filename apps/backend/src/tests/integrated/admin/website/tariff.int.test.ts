import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

jest.mock("@/config", () => ({
  prisma: {
    tariff: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    tariffHistory: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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
    tariffNotFound: {
      en: "Tariff not found",
      ka: "ტარიფი ვერ მოიძებნა",
    },
    tariffDeleted: {
      en: "Tariff deleted successfully",
      ka: "ტარიფი წარმატებით წაიშალა",
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
import { adminTariffRouter } from "@/routes/admin/website/tariff";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/admin/tariff", adminTariffRouter);

const mockTariff = {
  id: "11111111-1111-1111-1111-111111111111",
  price: 99,
  createdAt: new Date(),
  updatedAt: new Date(),
  history: [],
};

const mockTariffHistory = {
  id: "22222222-2222-2222-2222-222222222222",
  price: 80,
  fromDate: new Date("2023-01-01"),
  endDate: new Date("2023-12-31"),
  tariffId: mockTariff.id,
  createdAt: new Date(),
  updatedAt: new Date(),
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Admin Tariff (integration-style) — /admin/tariff", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /admin/tariff", () => {
    it("returns currentTariff, counts", async () => {
      (prisma.tariff.findFirst as jest.Mock).mockResolvedValueOnce(mockTariff);
      (prisma.tariff.count as jest.Mock).mockResolvedValueOnce(1);
      (prisma.tariffHistory.count as jest.Mock).mockResolvedValueOnce(2);

      const res = await request(app).get("/admin/tariff");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("currentTariff");
      expect(res.body.count).toEqual({ total: 3 });
      expect(prisma.tariff.findFirst).toHaveBeenCalled();
      expect(prisma.tariff.count).toHaveBeenCalled();
      expect(prisma.tariffHistory.count).toHaveBeenCalled();
    });

    it("handles DB error gracefully", async () => {
      (prisma.tariff.findFirst as jest.Mock).mockRejectedValueOnce(
        new Error("DB")
      );
      const res = await request(app).get("/admin/tariff");
      expect(res.status).toBe(500);
    });
  });
});
