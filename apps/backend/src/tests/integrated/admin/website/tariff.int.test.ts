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
      updateMany: jest.fn(),
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
    tariffDeleted: {
      en: "Tariff deleted successfully",
      ka: "ტარიფი წარმატებით წაიშალა",
    },
    tariffNotFound: {
      en: "Tariff not found",
      ka: "ტარიფი ვერ მოიძებნა",
    },
  };

  return {
    ...actual,
    logAdminWarn: jest.fn(),
    logAdminInfo: jest.fn(),
    logAdminError: jest.fn(),
    sendError: jest.fn((req: any, res: any, status: number, key: string) =>
      res.status(status).json({ error: (errorMessages as any)[key] ?? key })
    ),
    getResponseMessage: jest.fn((key: string) => key),
    GLOBAL_ERROR_MESSAGE: "GLOBAL_ERROR",
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
  price: 100,
  isCurrent: true,
  fromDate: new Date().toISOString(),
  endDate: null,
  parentId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
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
      (prisma.tariff.findMany as jest.Mock).mockResolvedValueOnce([mockTariff]);
      (prisma.tariff.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/tariff");

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.count.total).toBe(1);
      expect(prisma.tariff.findMany).toHaveBeenCalled();
      expect(prisma.tariff.count).toHaveBeenCalled();
    });

    it("handles DB error gracefully", async () => {
      (prisma.tariff.count as jest.Mock).mockResolvedValueOnce(1);
      (prisma.tariff.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB")
      );
      const res = await request(app).get("/admin/tariff");
      expect(res.status).toBe(500);
    });
  });

  describe("GET /tariff/:id", () => {
    it("returns a tariff when found", async () => {
      (prisma.tariff.findUnique as jest.Mock).mockResolvedValueOnce(mockTariff);

      const res = await request(app).get(`/tariff/${mockTariff.id}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("id", mockTariff.id);
      expect(prisma.tariff.findUnique).toHaveBeenCalled();
    });

    it("returns 404 when not found", async () => {
      (prisma.tariff.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get(`/tariff/${mockTariff.id}`);

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
      const active = { ...mockTariff };

      (prisma.tariff.findUnique as jest.Mock).mockResolvedValueOnce(active);
      (prisma.tariff.delete as jest.Mock).mockResolvedValueOnce(active);
      (prisma.tariff.update as jest.Mock).mockResolvedValueOnce({
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

    it("returns 404 when nothing deleted", async () => {
      (prisma.tariff.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).delete(`/tariff/${mockTariff.id}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid id", async () => {
      const res = await request(app).delete("/tariff/INVALID_ID!!");

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });
});
