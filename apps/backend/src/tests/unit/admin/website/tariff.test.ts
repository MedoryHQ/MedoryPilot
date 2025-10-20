import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@/config";
import { adminTariffRouter } from "@/routes/admin/website/tariff";

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
    validationHandler: (req: any, res: any, next: any) => next(),
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

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/tariff", adminTariffRouter);

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

describe("Admin Tariff API — /tariff", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /tariff", () => {
    it("returns tariffs and count", async () => {
      (prisma.tariff.findMany as jest.Mock).mockResolvedValueOnce([mockTariff]);
      (prisma.tariff.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/tariff");

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.count.total).toBe(1);
      expect(prisma.tariff.findMany).toHaveBeenCalled();
      expect(prisma.tariff.count).toHaveBeenCalled();
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

  describe("POST /tariff", () => {
    it("creates a tariff successfully", async () => {
      (prisma.tariff.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (prisma.tariff.create as jest.Mock).mockResolvedValueOnce(mockTariff);

      const res = await request(app).post("/tariff").send({ price: 200 });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("id", mockTariff.id);
      expect(prisma.tariff.create).toHaveBeenCalled();
    });
  });

  describe("PUT /tariff/:id", () => {
    it("updates a tariff successfully", async () => {
      (prisma.tariff.findUnique as jest.Mock).mockResolvedValueOnce(mockTariff);
      (prisma.tariff.update as jest.Mock).mockResolvedValueOnce({
        ...mockTariff,
        price: 300,
      });

      const res = await request(app)
        .put(`/tariff/${mockTariff.id}`)
        .send({ price: 300 });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("price", 300);
      expect(prisma.tariff.update).toHaveBeenCalled();
    });

    it("returns 404 when tariff not found", async () => {
      (prisma.tariff.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put(`/tariff/${mockTariff.id}`)
        .send({ price: 300 });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("DELETE /tariff/:id", () => {
    it("deletes a tariff when found", async () => {
      (prisma.tariff.findUnique as jest.Mock).mockResolvedValueOnce(mockTariff);
      (prisma.tariff.delete as jest.Mock).mockResolvedValueOnce(mockTariff);

      const res = await request(app).delete(`/tariff/${mockTariff.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
      expect(prisma.tariff.delete).toHaveBeenCalled();
    });

    it("returns 404 when nothing deleted", async () => {
      (prisma.tariff.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).delete(`/tariff/${mockTariff.id}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });
  });
});
