import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@/config";
import { adminHeaderRouter } from "@/routes/admin/website/header";

jest.mock("@/config", () => ({
  prisma: {
    header: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
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

jest.mock("@/validations/admin", () => {
  const actual = jest.requireActual("@/validations/admin");
  return {
    ...actual,
    fetchHeaderValidation: [],
  };
});

jest.mock("@/utils", () => {
  const actual = jest.requireActual("@/utils");
  const errorMessages = {
    ...((actual as any).errorMessages ?? {}),
    headerDeleted: {
      en: "Header deleted successfully",
      ka: "Header წარმატებით წაიშალა",
    },
    headerNotFound: {
      en: "Header not found",
      ka: "Header ვერ მოიძებნა",
    },
    onlyOneActiveHeaderAllowed: {
      en: "Only one active header is allowed",
      ka: "მხოლოდ ერთი აქტიური header არის დაშვებული",
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
      return {
        skip: (page - 1) * take,
        take,
        orderBy,
        search: req.query.search,
      };
    }),
    parseFilters: jest.fn(() => ({})),
    generateWhereInput: jest.fn((search: any, fields: any, extra: any) => ({})),
    createTranslations: jest.fn((translations: any) =>
      Object.entries(translations || {}).map(([code, payload]: any) => ({
        language: { connect: { code } },
        name: payload?.name,
        position: payload?.position,
        headline: payload?.headline,
        description: payload?.description,
      }))
    ),

    logAdminWarn: jest.fn(),
    logAdminInfo: jest.fn(),
    logAdminError: jest.fn(),
    logCatchyError: jest.fn(),
    sendError: jest.fn((req: any, res: any, status: number, key: string) =>
      res.status(status).json({ error: (errorMessages as any)[key] ?? key })
    ),
    getResponseMessage: jest.fn(
      (key: string) => (errorMessages as any)[key] ?? key
    ),
    GLOBAL_ERROR_MESSAGE: "GLOBAL_ERROR",
    errorMessages,
  };
});

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/admin/header", adminHeaderRouter);

const mockHeader = {
  id: "11111111-1111-1111-1111-111111111111",
  active: true,
  logo: { id: "222", path: "/logo.png", name: "Logo", size: 123 },
  translations: [
    {
      name: "John",
      position: "CEO",
      headline: "Leader",
      description: "Text",
      language: { code: "en" },
    },
    {
      name: "ჯონი",
      position: "დირექტორი",
      headline: "ლიდერი",
      description: "ტექსტი",
      language: { code: "ka" },
    },
  ],
};
const createPayload = {
  active: true,
  logo: { path: "/logo.png", name: "Logo", size: 123 },
  translations: {
    en: {
      name: "John",
      position: "CEO",
      headline: "Leader",
      description: "Text",
    },
    ka: {
      name: "ჯონი",
      position: "დირექტორი",
      headline: "ლიდერი",
      description: "ტექსტი",
    },
  },
};

const updatePayload = {
  active: false,
  logo: { path: "/new.png", name: "NewLogo", size: 456 },
  translations: {
    en: {
      name: "Jane",
      position: "CTO",
      headline: "Tech",
      description: "Updated",
    },
    ka: {
      name: "ჯეინ",
      position: "ტექ",
      headline: "ტექნოლოგია",
      description: "განახლებული",
    },
  },
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Admin Header (integration-style) — /admin/header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /admin/header", () => {
    it("returns header when found", async () => {
      (prisma.header.findMany as jest.Mock).mockResolvedValueOnce([mockHeader]);
      (prisma.header.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/admin/header");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toEqual(1);
      expect(prisma.header.findMany).toHaveBeenCalled();
      expect(prisma.header.count).toHaveBeenCalled();
    });

    it("handles DB error", async () => {
      (prisma.header.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );

      const res = await request(app).get("/admin/header");

      expect(res.status).toBe(500);
    });
  });

  describe("GET /header/:id", () => {
    it("returns 404 when not found", async () => {
      (prisma.header.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get("/admin/header/invalidUUID");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty(
        "error",
        require("@/utils").errorMessages.headerNotFound
      );
    });

    it("handles DB error", async () => {
      (prisma.header.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );

      const res = await request(app).get("/admin/header/some-id");

      expect(res.status).toBe(500);
    });
  });

  describe("POST /admin/header", () => {
    it("creates header successfully", async () => {
      (prisma.header.create as jest.Mock).mockResolvedValueOnce(mockHeader);

      const res = await request(app).post("/admin/header").send(createPayload);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("id", mockHeader.id);
      expect(prisma.header.create).toHaveBeenCalledTimes(1);
    });

    it("returns 400 when translations missing or invalid", async () => {
      (prisma.header.create as jest.Mock).mockResolvedValueOnce(mockHeader);

      const res = await request(app)
        .post("/admin/header")
        .send({ translations: {} });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("PUT /admin/header/:id", () => {
    it("updates header successfully", async () => {
      (prisma.header.findUnique as jest.Mock).mockResolvedValueOnce(mockHeader);
      (prisma.header.update as jest.Mock).mockResolvedValueOnce({
        ...mockHeader,
        active: false,
      });

      const res = await request(app)
        .put(`/admin/header/${mockHeader.id}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("active", false);
      expect(prisma.header.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockHeader.id },
          include: { logo: true },
        })
      );
      expect(prisma.header.update).toHaveBeenCalledTimes(1);

      const updateArg = (prisma.header.update as jest.Mock).mock.calls[0][0];
      expect(updateArg).toHaveProperty("where");
      expect(updateArg).toHaveProperty("data");
    });

    it("returns 404 when header not found", async () => {
      (prisma.header.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put(`/admin/header/${mockHeader.id}`)
        .send(updatePayload);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty(
        "error",
        require("@/utils").errorMessages.headerNotFound
      );
    });

    it("returns 400 for invalid UUID id", async () => {
      const res = await request(app)
        .put("/admin/header/not-a-uuid")
        .send(updatePayload);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("handles DB update error (500)", async () => {
      (prisma.header.findUnique as jest.Mock).mockResolvedValueOnce(mockHeader);
      (prisma.header.update as jest.Mock).mockRejectedValueOnce(
        new Error("DB update")
      );

      const res = await request(app)
        .put(`/admin/header/${mockHeader.id}`)
        .send(updatePayload);
      expect(res.status).toBe(500);
    });
  });

  describe("DELETE /admin/header/:id", () => {
    it("deletes header successfully", async () => {
      (prisma.header.delete as jest.Mock).mockResolvedValueOnce(mockHeader);

      const res = await request(app).delete(`/admin/header/${mockHeader.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
      expect(prisma.header.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockHeader.id } })
      );
    });

    it("returns 404 when header not found", async () => {
      (prisma.header.delete as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).delete(`/admin/header/${mockHeader.id}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty(
        "error",
        require("@/utils").errorMessages.headerNotFound
      );
    });

    it("handles DB delete error (500)", async () => {
      (prisma.header.delete as jest.Mock).mockRejectedValueOnce(
        new Error("DB delete")
      );

      const res = await request(app).delete(`/admin/header/${mockHeader.id}`);
      expect(res.status).toBe(500);
    });

    it("returns 400 for invalid UUID id", async () => {
      const res = await request(app).delete("/admin/header/invalid-id");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });
});
