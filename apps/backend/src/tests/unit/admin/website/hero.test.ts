import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@/config";
import { adminHeroRouter } from "@/routes/admin/website/hero";

jest.mock("@/config", () => ({
  prisma: {
    hero: {
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
    fetchHeroValidation: [],
  };
});

jest.mock("@/utils", () => {
  const actual = jest.requireActual("@/utils");
  const errorMessages = {
    ...((actual as any).errorMessages ?? {}),
    heroDeleted: {
      en: "Hero deleted successfully",
      ka: "Hero წარმატებით წაიშალა",
    },
    heroNotFound: {
      en: "Hero not found",
      ka: "Hero ვერ მოიძებნა",
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
    logAdminWarn: jest.fn(),
    logAdminInfo: jest.fn(),
    logAdminError: jest.fn(),
    logCatchyError: jest.fn(),
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
app.use("/hero", adminHeroRouter);

const mockHero = {
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
  logo: { id: "logo_1", path: "/logo.png", name: "Logo", size: 123 },
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

describe("Admin Hero API — /hero", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /hero", () => {
    it("returns hero when found", async () => {
      (prisma.hero.findMany as jest.Mock).mockResolvedValueOnce([mockHero]);
      (prisma.hero.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/hero");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toEqual(1);
      expect(prisma.hero.findMany).toHaveBeenCalled();
      expect(prisma.hero.count).toHaveBeenCalled();
    });

    it("handles DB error", async () => {
      (prisma.hero.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );

      const res = await request(app).get("/hero");

      expect(res.status).toBe(500);
    });
  });

  describe("GET /hero/:id", () => {
    it("returns 404 when not found", async () => {
      (prisma.hero.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get("/hero/invalidUUID");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("handles DB error", async () => {
      (prisma.hero.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );

      const res = await request(app).get("/hero/some-id");

      expect(res.status).toBe(500);
    });
  });

  describe("DELETE /hero/:id", () => {
    it("deletes hero successfully", async () => {
      (prisma.hero.delete as jest.Mock).mockResolvedValueOnce(mockHero);

      const res = await request(app).delete(`/hero/${mockHero.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
      expect(prisma.hero.delete).toHaveBeenCalled();
    });

    it("returns 404 when not found", async () => {
      (prisma.hero.delete as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).delete(`/hero/${mockHero.id}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("handles DB error", async () => {
      (prisma.hero.delete as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );

      const res = await request(app).delete(`/hero/${mockHero.id}`);

      expect(res.status).toBe(500);
    });
  });

  describe("POST /hero", () => {
    it("creates hero successfully", async () => {
      (prisma.hero.create as jest.Mock).mockResolvedValueOnce(mockHero);

      const res = await request(app).post("/hero").send(createPayload);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("id", mockHero.id);
      expect(prisma.hero.create).toHaveBeenCalled();
    });

    it("handles DB error", async () => {
      (prisma.hero.create as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );

      const res = await request(app).post("/hero").send(createPayload);

      expect(res.status).toBe(500);
    });
  });

  describe("PUT /hero/:id", () => {
    it("updates hero successfully", async () => {
      (prisma.hero.findUnique as jest.Mock).mockResolvedValueOnce(mockHero);
      (prisma.hero.update as jest.Mock).mockResolvedValueOnce({
        ...mockHero,
        active: false,
      });

      const res = await request(app)
        .put(`/hero/${mockHero.id}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("active", false);
      expect(prisma.hero.update).toHaveBeenCalled();
    });

    it("returns 404 when hero not found", async () => {
      (prisma.hero.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put(`/hero/${mockHero.id}`)
        .send(updatePayload);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("handles DB error", async () => {
      (prisma.hero.findUnique as jest.Mock).mockResolvedValueOnce(mockHero);
      (prisma.hero.update as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );

      const res = await request(app)
        .put(`/hero/${mockHero.id}`)
        .send(updatePayload);

      expect(res.status).toBe(500);
    });
  });
});
