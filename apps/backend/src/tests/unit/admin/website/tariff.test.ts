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
import { authMatchers } from "@/tests/helpers/authMatchers";

expect.extend(authMatchers);

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

describe("Admin Tariff routes — /admin/tariff", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /admin/tariff", () => {
    it("returns currentTariff, tariffs and counts", async () => {
      (prisma.tariff.findFirst as jest.Mock).mockResolvedValueOnce(mockTariff);
      (prisma.tariff.count as jest.Mock).mockResolvedValueOnce(1);
      (prisma.tariffHistory.count as jest.Mock).mockResolvedValueOnce(2);

      const res = await request(app).get("/admin/tariff");

      expect(res).toHaveStatus(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("currentTariff");
      expect(res.body.count).toEqual({
        total: 3,
      });
      expect(prisma.tariff.findFirst).toHaveBeenCalled();
      expect(prisma.tariff.count).toHaveBeenCalled();
      expect(prisma.tariffHistory.count).toHaveBeenCalled();
    });

    it("handles DB error gracefully", async () => {
      (prisma.tariff.findFirst as jest.Mock).mockRejectedValueOnce(
        new Error("DB")
      );
      const res = await request(app).get("/admin/tariff");
      expect(res).toHaveStatus(500);
    });
  });

  describe("GET /admin/tariff/:id (fetchTariff)", () => {
    it("fetches active tariff when type is 'active'", async () => {
      (prisma.tariff.findUnique as jest.Mock).mockResolvedValueOnce(mockTariff);

      const res = await request(app)
        .get(`/admin/tariff/${mockTariff.id}`)
        .send({ type: "active" });

      expect(res).toHaveStatus(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.type).toBe("active");
      expect(prisma.tariff.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockTariff.id } })
      );
    });

    it("fetches history tariff when type is 'history'", async () => {
      (prisma.tariffHistory.findUnique as jest.Mock).mockResolvedValueOnce(
        mockTariffHistory
      );

      const res = await request(app)
        .get(`/admin/tariff/${mockTariffHistory.id}`)
        .send({ type: "history" });

      expect(res).toHaveStatus(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.type).toBe("history");
      expect(prisma.tariffHistory.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockTariffHistory.id } })
      );
    });

    it("returns 404 when tariff not found", async () => {
      (prisma.tariff.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .get(`/admin/tariff/${mockTariff.id}`)
        .send({ type: "active" });

      expect(res).toHaveStatus(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid id (UUID)", async () => {
      const res = await request(app)
        .get("/admin/tariff/invalid-id")
        .send({ type: "active" });
      expect(res).toHaveStatus(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("POST /admin/tariff", () => {
    it("creates tariff successfully when no current tariff exists", async () => {
      (prisma.tariff.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (prisma.tariff.create as jest.Mock).mockResolvedValueOnce({
        ...mockTariff,
        price: 120,
      });

      const res = await request(app).post("/admin/tariff").send({ price: 120 });

      expect(res).toHaveStatus(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.price).toBe(120);
      expect(prisma.tariff.create).toHaveBeenCalled();
    });

    it("creates tariff and moves previous current to history when current exists", async () => {
      const existing = {
        ...mockTariff,
        price: 50,
        createdAt: new Date("2023-01-01"),
      };
      (prisma.tariff.findFirst as jest.Mock).mockResolvedValueOnce(existing);

      const newTariff = { ...mockTariff, id: "new-id", price: 200 };
      (prisma.tariff.create as jest.Mock).mockResolvedValueOnce(newTariff);
      (prisma.tariffHistory.create as jest.Mock).mockResolvedValueOnce({
        ...mockTariffHistory,
      });
      (prisma.tariff.delete as jest.Mock).mockResolvedValueOnce(existing);

      const res = await request(app).post("/admin/tariff").send({ price: 200 });

      expect(res).toHaveStatus(201);
      expect(res.body.data).toBeDefined();
      expect(prisma.tariffHistory.create).toHaveBeenCalled();
      expect(prisma.tariff.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: existing.id } })
      );
    });

    it("returns 400 for invalid body", async () => {
      const res = await request(app).post("/admin/tariff").send({});
      expect(res).toHaveStatus(400);
    });
  });
});
