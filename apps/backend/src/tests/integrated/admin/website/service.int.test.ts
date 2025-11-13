import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

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
    file: {
      create: jest.fn(),
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

import { prisma } from "@/config";
import { adminServiceRouter } from "@/routes/admin/website/service";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/service", adminServiceRouter);

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
};

const createPayload = {
  translations: {
    en: { title: "New", description: "desc" },
    ka: { title: "ახალი", description: "მოკლე" },
  },
  icon: { path: "/p.png", name: "p.png", size: 123 },
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

  describe("GET /service/:id", () => {
    it("returns single service when found", async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValueOnce(
        mockService
      );

      const res = await request(app).get(`/service/${mockService.id}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toEqual(mockService.id);
      expect(prisma.service.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockService.id } })
      );
    });

    it("returns 404 when not found", async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValueOnce(null);
      const res = await request(app).get(`/service/${mockService.id}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid UUID", async () => {
      const res = await request(app).get("/service/invalid-uuid");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("POST /service", () => {
    it("creates service successfully", async () => {
      (prisma.service.create as jest.Mock).mockResolvedValueOnce({
        ...mockService,
        translations: createPayload.translations,
      });

      const res = await request(app).post("/service").send(createPayload);

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(prisma.service.create).toHaveBeenCalled();
    });

    it("returns 400 when translations missing or invalid", async () => {
      const res = await request(app)
        .post("/service")
        .send({ translations: {} });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("PUT /service/:id", () => {
    it("updates service successfully", async () => {
      const updatePayload = {
        translations: {
          en: { title: "Up", description: "d" },
          ka: { title: "განახლება", description: "dka" },
        },
        icon: { path: "/i.png", name: "i.png", size: 50 },
      };

      (prisma.service.findUnique as jest.Mock).mockResolvedValueOnce(
        mockService
      );
      (prisma.service.update as jest.Mock).mockResolvedValueOnce({
        ...mockService,
        translations: updatePayload.translations,
      });
      (prisma.file.create as jest.Mock).mockResolvedValueOnce({
        id: "file-id",
      });
      const res = await request(app)
        .put(`/service/${mockService.id}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(prisma.service.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockService.id },
          include: { icon: true },
        })
      );
      expect(prisma.service.update).toHaveBeenCalled();
    });

    it("returns 404 when updating non-existing service", async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put(`/service/${mockService.id}`)
        .send({
          translations: {
            en: { title: "t", description: "d" },
            ka: { title: "t", description: "d" },
          },
        });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid body", async () => {
      const res = await request(app)
        .put(`/service/${mockService.id}`)
        .send({ translations: {} });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("DELETE /service/:id", () => {
    it("deletes service successfully", async () => {
      (prisma.service.delete as jest.Mock).mockResolvedValueOnce(mockService);

      const res = await request(app).delete(`/service/${mockService.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
      expect(prisma.service.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockService.id } })
      );
    });

    it("handles delete DB error (500)", async () => {
      (prisma.service.delete as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );
      const res = await request(app).delete(`/service/${mockService.id}`);
      expect(res.status).toBe(500);
    });

    it("returns 400 for invalid UUID", async () => {
      const res = await request(app).delete("/service/not-uuid");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });
});
