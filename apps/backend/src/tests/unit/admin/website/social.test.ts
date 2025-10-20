import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

jest.mock("@/config", () => ({
  prisma: {
    social: {
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
    socialNotFound: {
      en: "Social not found",
      ka: "სოციალური ქსელი ვერ მოიძებნა",
    },
    socialDeleted: {
      en: "Social deleted successfully",
      ka: "სოციალური ქსელი წარმატებით წაიშალა",
    },
  };

  return {
    ...actual,
    getPaginationAndFilters: jest.fn((req: any) => {
      const page = Number(req.query.page) || 1;
      const take = Number(req.query.take) || 10;
      const orderBy = req.query.orderBy
        ? { order: req.query.orderBy }
        : { order: "asc" };
      return { skip: (page - 1) * take, take, orderBy };
    }),
    parseFilters: jest.fn(() => ({})),
    generateWhereInput: jest.fn((search: any, fields: any, extra: any) => ({})),
    getResponseMessage: jest.fn(
      (key: string) => (errorMessages as any)[key] ?? key
    ),
    sendError: jest.fn((req: any, res: any, status: number, key: string) => {
      res.status(status).json({ error: (errorMessages as any)[key] ?? key });
    }),
    logCatchyError: jest.fn(),
    logAdminError: jest.fn(),
    logAdminInfo: jest.fn(),
    logAdminWarn: jest.fn(),
    errorMessages,
  };
});

import { prisma } from "@/config";
import { authMatchers } from "@/tests/helpers/authMatchers";
import { adminSocialRouter } from "@/routes/admin/website/social";

expect.extend(authMatchers);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/admin/social", adminSocialRouter);

const mockSocial = {
  id: "33333333-3333-3333-3333-333333333333",
  url: "https://example.com",
  name: "example",
  icon: null,
  footerId: "44444444-4444-4444-4444-444444444444",
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Admin Social routes — /admin/social", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /admin/social", () => {
    it("returns list of socials with count", async () => {
      (prisma.social.count as jest.Mock).mockResolvedValueOnce(1);
      (prisma.social.findMany as jest.Mock).mockResolvedValueOnce([mockSocial]);

      const res = await request(app).get("/admin/social");

      expect(res).toHaveStatus(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toEqual(1);
      expect(prisma.social.findMany).toHaveBeenCalled();
      expect(prisma.social.count).toHaveBeenCalled();
    });

    it("handles DB error gracefully", async () => {
      (prisma.social.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );
      const res = await request(app).get("/admin/social");
      expect(res).toHaveStatus(500);
    });
  });

  describe("GET /admin/social/:id", () => {
    it("returns single social when found", async () => {
      (prisma.social.findUnique as jest.Mock).mockResolvedValueOnce(mockSocial);

      const res = await request(app).get(`/admin/social/${mockSocial.id}`);

      expect(res).toHaveStatus(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toEqual(mockSocial.id);
      expect(prisma.social.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockSocial.id },
          include: { icon: true },
        })
      );
    });

    it("returns 404 when social not found", async () => {
      (prisma.social.findUnique as jest.Mock).mockResolvedValueOnce(null);
      const res = await request(app).get(`/admin/social/${mockSocial.id}`);
      expect(res).toHaveStatus(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid UUID", async () => {
      const res = await request(app).get("/admin/social/invalid-uuid");
      expect(res).toHaveStatus(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("POST /admin/social", () => {
    it("creates social successfully without footer", async () => {
      const createPayload = {
        url: "https://site.com",
        name: "site",
        icon: { path: "/i.png", name: "i.png", size: 12 },
      };

      (prisma.social.create as jest.Mock).mockResolvedValueOnce({
        ...mockSocial,
        ...createPayload,
      });

      const res = await request(app).post("/admin/social").send(createPayload);

      expect(res).toHaveStatus(201);
      expect(res.body.data).toBeDefined();
      expect(prisma.social.create).toHaveBeenCalled();
    });

    it("creates social successfully with footerId connection", async () => {
      const createPayload = {
        url: "https://site.com",
        name: "site",
        footerId: mockSocial.footerId,
      };

      (prisma.social.create as jest.Mock).mockResolvedValueOnce({
        ...mockSocial,
        ...createPayload,
      });

      const res = await request(app).post("/admin/social").send(createPayload);

      expect(res).toHaveStatus(201);
      expect(res.body.data).toBeDefined();
      expect(prisma.social.create).toHaveBeenCalled();

      const callArg = (prisma.social.create as jest.Mock).mock.calls[0][0];
      expect(callArg).toHaveProperty("data");
      if (createPayload.footerId) {
        expect(callArg.data).toHaveProperty("footer");
        expect(callArg.data.footer).toEqual(
          expect.objectContaining({ connect: { id: createPayload.footerId } })
        );
      }
    });

    it("returns 400 when required fields missing or invalid", async () => {
      const res = await request(app)
        .post("/admin/social")
        .send({ url: "", name: "", footerId: "not-uuid" });
      expect(res).toHaveStatus(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("PUT /admin/social/:id", () => {
    it("updates social successfully", async () => {
      const updatePayload = {
        url: "https://updated.com",
        name: "updated",
        icon: { path: "/ni.png", name: "ni.png", size: 10 },
      };

      (prisma.social.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockSocial,
        icon: null,
      });
      (prisma.social.update as jest.Mock).mockResolvedValueOnce({
        ...mockSocial,
        ...updatePayload,
      });

      const res = await request(app)
        .put(`/admin/social/${mockSocial.id}`)
        .send(updatePayload);

      expect(res).toHaveStatus(200);
      expect(res.body.data).toBeDefined();
      expect(prisma.social.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockSocial.id },
          include: { icon: true },
        })
      );
      expect(prisma.social.update).toHaveBeenCalled();
    });

    it("returns 404 when updating non-existing social", async () => {
      (prisma.social.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put(`/admin/social/${mockSocial.id}`)
        .send({
          url: "https://x",
          name: "x",
        });

      expect(res).toHaveStatus(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid body", async () => {
      const res = await request(app)
        .put(`/admin/social/${mockSocial.id}`)
        .send({ url: "", name: "" });
      expect(res).toHaveStatus(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("DELETE /admin/social/:id", () => {
    it("deletes social successfully", async () => {
      (prisma.social.delete as jest.Mock).mockResolvedValueOnce(mockSocial);

      const res = await request(app).delete(`/admin/social/${mockSocial.id}`);

      expect(res).toHaveStatus(200);
      expect(res.body).toHaveProperty("message");
      expect(prisma.social.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockSocial.id } })
      );
    });

    it("handles delete DB error (500)", async () => {
      (prisma.social.delete as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );
      const res = await request(app).delete(`/admin/social/${mockSocial.id}`);
      expect(res).toHaveStatus(500);
    });

    it("returns 400 for invalid UUID", async () => {
      const res = await request(app).delete("/admin/social/not-uuid");
      expect(res).toHaveStatus(400);
      expect(res.body).toHaveProperty("errors");
    });
  });
});
