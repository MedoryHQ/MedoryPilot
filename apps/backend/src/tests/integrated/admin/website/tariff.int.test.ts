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
  fromDate: new Date("2024-01-01"),
  endDate: null,
  isCurrent: true,
  parentId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockHistoryRow = {
  id: "22222222-2222-2222-2222-222222222222",
  price: 80,
  fromDate: new Date("2023-01-01"),
  endDate: new Date("2023-12-31"),
  isCurrent: false,
  parentId: "11111111-1111-1111-1111-111111111111",
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
    it("returns combined active/history and counts", async () => {
      (prisma.tariff.count as jest.Mock).mockResolvedValueOnce(1);
      (prisma.tariff.count as jest.Mock).mockResolvedValueOnce(2);

      (prisma.tariff.findMany as jest.Mock)
        .mockResolvedValueOnce([mockTariff])
        .mockResolvedValueOnce([mockHistoryRow, mockHistoryRow]);

      const res = await request(app).get("/admin/tariff");

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.count).toEqual({ total: 3 });
      expect(prisma.tariff.count).toHaveBeenCalledTimes(2);
      expect(prisma.tariff.findMany).toHaveBeenCalledTimes(2);
    });

    it("handles DB error gracefully", async () => {
      (prisma.tariff.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB")
      );
      const res = await request(app).get("/admin/tariff");
      expect(res.status).toBe(500);
    });
  });

  describe("GET /admin/tariff/:id (fetchTariff)", () => {
    it("fetches active tariff when type is 'active'", async () => {
      (prisma.tariff.findUnique as jest.Mock).mockResolvedValueOnce(mockTariff);

      const res = await request(app)
        .get(`/admin/tariff/${mockTariff.id}`)
        .send({ type: "active" });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.type).toBe("active");
      expect(prisma.tariff.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockTariff.id } })
      );
    });

    it("fetches history tariff when type is 'history'", async () => {
      const historyRow = { ...mockHistoryRow };
      (prisma.tariff.findUnique as jest.Mock).mockResolvedValueOnce(historyRow);

      const res = await request(app)
        .get(`/admin/tariff/${historyRow.id}`)
        .send({ type: "history" });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.type).toBe("history");
      expect(prisma.tariff.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: historyRow.id } })
      );
    });

    it("returns 404 when tariff not found", async () => {
      (prisma.tariff.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .get(`/admin/tariff/${mockTariff.id}`)
        .send({ type: "active" });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
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

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.price).toBe(120);
      expect(prisma.tariff.create).toHaveBeenCalled();
    });

    it("creates tariff and marks previous as history when current exists", async () => {
      const existing = {
        ...mockTariff,
        price: 50,
        createdAt: new Date("2023-01-01"),
      };
      (prisma.tariff.findFirst as jest.Mock).mockResolvedValueOnce(existing);

      const newTariff = { ...mockTariff, id: "new-id", price: 200 };
      (prisma.tariff.update as jest.Mock).mockResolvedValueOnce({
        ...existing,
        isCurrent: false,
        endDate: new Date(),
      });
      (prisma.tariff.create as jest.Mock).mockResolvedValueOnce(newTariff);

      const res = await request(app).post("/admin/tariff").send({ price: 200 });

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(prisma.tariff.update).toHaveBeenCalled();
      expect(prisma.tariff.create).toHaveBeenCalled();
    });

    it("returns 400 for invalid body", async () => {
      const res = await request(app).post("/admin/tariff").send({});
      expect(res.status).toBe(400);
    });
  });

  describe("PUT /admin/tariff/:id", () => {
    it("updates tariff successfully", async () => {
      (prisma.tariff.findUnique as jest.Mock).mockResolvedValueOnce(mockTariff);
      (prisma.tariff.update as jest.Mock).mockResolvedValueOnce({
        ...mockTariff,
        price: 150,
      });

      const res = await request(app)
        .put(`/admin/tariff/${mockTariff.id}`)
        .send({ price: 150 });

      expect(res.status).toBe(200);
      expect(res.body.data.price).toBe(150);
      expect(prisma.tariff.update).toHaveBeenCalled();
    });

    it("returns 404 when tariff not found", async () => {
      (prisma.tariff.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put(`/admin/tariff/${mockTariff.id}`)
        .send({ price: 100 });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid body", async () => {
      const res = await request(app)
        .put(`/admin/tariff/${mockTariff.id}`)
        .send({ price: "not-a-number" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("DELETE /admin/tariff/:id", () => {
    it("deletes active tariff and promotes child if present", async () => {
      const active = { ...mockTariff, isCurrent: true };
      const child = {
        id: "child-id",
        price: 60,
        isCurrent: false,
        parentId: active.id,
        fromDate: new Date("2023-06-01"),
        createdAt: new Date("2023-06-01"),
        updatedAt: new Date(),
      };

      (prisma.tariff.findUnique as jest.Mock).mockResolvedValueOnce(active);
      (prisma.tariff.findFirst as jest.Mock).mockResolvedValueOnce(child);
      (prisma.tariff.delete as jest.Mock).mockResolvedValueOnce(active);
      (prisma.tariff.update as jest.Mock).mockResolvedValueOnce({
        ...child,
        isCurrent: true,
        parentId: null,
        endDate: null,
      });

      const res = await request(app)
        .delete(`/admin/tariff/${active.id}`)
        .send({ type: "active" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
      expect(prisma.tariff.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: active.id } })
      );
      expect(prisma.tariff.update).toHaveBeenCalled();
    });

    it("deletes history tariff when type is 'history'", async () => {
      const historyRow = { ...mockHistoryRow, isCurrent: false };
      (prisma.tariff.findUnique as jest.Mock).mockResolvedValueOnce(historyRow);
      (prisma.tariff.delete as jest.Mock).mockResolvedValueOnce(historyRow);

      const res = await request(app)
        .delete(`/admin/tariff/${historyRow.id}`)
        .send({ type: "history" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
      expect(prisma.tariff.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: historyRow.id } })
      );
    });

    it("returns 404 when deletion target not found", async () => {
      (prisma.tariff.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .delete(`/admin/tariff/${mockTariff.id}`)
        .send({ type: "active" });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid id", async () => {
      const res = await request(app)
        .delete("/admin/tariff/INVALID_ID!!")
        .send({ type: "active" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });
});
