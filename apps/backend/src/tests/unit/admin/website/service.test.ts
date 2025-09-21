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
    serviceNotFound: {
      en: "Service not found",
      ka: "სერვისი ვერ მოიძებნა",
    },
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
        title: payload.title ?? payload.question,
        description: payload.description ?? payload.answer,
      }))
    ),
    generateWhereInput: jest.fn((search: any, fields: any) => ({})),
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
import { authMatchers } from "@/tests/helpers/authMatchers";
import { adminServiceRouter } from "@/routes/admin/website/service";

expect.extend(authMatchers);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/admin/service", adminServiceRouter);

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

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Admin Service routes — /admin/service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /admin/service", () => {
    it("returns list of services with count", async () => {
      (prisma.service.findMany as jest.Mock).mockResolvedValueOnce([
        mockService,
      ]);
      (prisma.service.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/admin/service");

      expect(res).toHaveStatus(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toEqual(1);
      expect(prisma.service.findMany).toHaveBeenCalled();
      expect(prisma.service.count).toHaveBeenCalled();
    });

    it("handles DB error gracefully", async () => {
      (prisma.service.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );
      const res = await request(app).get("/admin/service");
      expect(res).toHaveStatus(500);
    });
  });

  describe("GET /admin/service/:id", () => {
    it("returns single service when found", async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValueOnce(
        mockService
      );

      const res = await request(app).get(`/admin/service/${mockService.id}`);

      expect(res).toHaveStatus(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toEqual(mockService.id);
      expect(prisma.service.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockService.id } })
      );
    });

    it("returns 404 when not found", async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValueOnce(null);
      const res = await request(app).get(`/admin/service/${mockService.id}`);
      expect(res).toHaveStatus(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid UUID", async () => {
      const res = await request(app).get("/admin/service/invalid-uuid");
      expect(res).toHaveStatus(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("POST /admin/service", () => {
    it("creates service successfully", async () => {
      const createPayload = {
        translations: {
          en: { title: "New", description: "desc" },
          ka: { title: "ახალი", description: "მოკლე" },
        },
        icon: { path: "/p.png", name: "p.png", size: 123 },
        background: null,
      };

      (prisma.service.create as jest.Mock).mockResolvedValueOnce({
        ...mockService,
        translations: createPayload.translations,
      });

      const res = await request(app).post("/admin/service").send(createPayload);

      expect(res).toHaveStatus(201);
      expect(res.body.data).toBeDefined();
      expect(prisma.service.create).toHaveBeenCalled();
    });

    it("returns 400 when translations missing or invalid", async () => {
      const res = await request(app)
        .post("/admin/service")
        .send({ translations: {} });
      expect(res).toHaveStatus(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("PUT /admin/service/:id", () => {
    it("updates service successfully", async () => {
      const updatePayload = {
        translations: {
          en: { title: "Up", description: "d" },
          ka: { title: "განახლება", description: "dka" },
        },
        icon: { path: "/i.png", name: "i.png", size: 50 },
        background: null,
      };

      (prisma.service.findUnique as jest.Mock).mockResolvedValueOnce(
        mockService
      );
      (prisma.service.update as jest.Mock).mockResolvedValueOnce({
        ...mockService,
        translations: updatePayload.translations,
      });

      const res = await request(app)
        .put(`/admin/service/${mockService.id}`)
        .send(updatePayload);

      expect(res).toHaveStatus(200);
      expect(res.body.data).toBeDefined();
      expect(prisma.service.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockService.id },
          include: { icon: true, background: true },
        })
      );
      expect(prisma.service.update).toHaveBeenCalled();
    });

    it("returns 404 when updating non-existing service", async () => {
      (prisma.service.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put(`/admin/service/${mockService.id}`)
        .send({
          translations: {
            en: { title: "t", description: "d" },
            ka: { title: "t", description: "d" },
          },
        });

      expect(res).toHaveStatus(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid body", async () => {
      const res = await request(app)
        .put(`/admin/service/${mockService.id}`)
        .send({ translations: {} });
      expect(res).toHaveStatus(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("DELETE /admin/service/:id", () => {
    it("deletes service successfully", async () => {
      (prisma.service.delete as jest.Mock).mockResolvedValueOnce(mockService);

      const res = await request(app).delete(`/admin/service/${mockService.id}`);

      expect(res).toHaveStatus(200);
      expect(res.body).toHaveProperty("message");
      expect(prisma.service.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockService.id } })
      );
    });

    it("handles delete DB error (500)", async () => {
      (prisma.service.delete as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );
      const res = await request(app).delete(`/admin/service/${mockService.id}`);
      expect(res).toHaveStatus(500);
    });

    it("returns 400 for invalid UUID", async () => {
      const res = await request(app).delete("/admin/service/not-uuid");
      expect(res).toHaveStatus(400);
      expect(res.body).toHaveProperty("errors");
    });
  });
});
