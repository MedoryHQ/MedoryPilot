import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@/config";
import { adminHeaderRouter } from "@/routes/admin/website/header";

jest.mock("@/config", () => ({
  prisma: {
    header: {
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
  isAdminVerified: (_req: any, _res: any, next: any) => next(),
  adminAuthenticate: (_req: any, _res: any, next: any) => next(),
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
    headerNotFound: {
      en: "Header not found",
      ka: "Header ვერ მოიძებნა",
    },
    headerDeleted: {
      en: "Header deleted successfully",
      ka: "Header წარმატებით წაიშალა",
    },
  };

  return {
    ...actual,
    sendError: jest.fn((req: any, res: any, status: number, key: string) =>
      res.status(status).json({ error: (errorMessages as any)[key] ?? key })
    ),
    getResponseMessage: jest.fn(
      (key: string) => (errorMessages as any)[key] ?? key
    ),
    GLOBAL_ERROR_MESSAGE: "GLOBAL_ERROR",
    logAdminError: jest.fn(),
    logAdminInfo: jest.fn(),
    logAdminWarn: jest.fn(),
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
      (prisma.header.findFirst as jest.Mock).mockResolvedValueOnce(mockHeader);

      const res = await request(app).get("/admin/header");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("id", mockHeader.id);
      expect(prisma.header.findFirst).toHaveBeenCalledTimes(1);
    });

    it("returns 404 when not found", async () => {
      (prisma.header.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get("/admin/header");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("handles DB error (500)", async () => {
      (prisma.header.findFirst as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );

      const res = await request(app).get("/admin/header");

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

      const callArg = (prisma.header.create as jest.Mock).mock.calls[0][0];
      expect(callArg).toHaveProperty("data");
      expect(callArg.data).toHaveProperty("active");
      expect(callArg.data).toHaveProperty("translations");
    });

    it("returns 400 when translations missing or invalid", async () => {
      const res = await request(app)
        .post("/admin/header")
        .send({ translations: {} });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("handles DB create error (500)", async () => {
      (prisma.header.create as jest.Mock).mockRejectedValueOnce(
        new Error("DB create")
      );

      const res = await request(app).post("/admin/header").send(createPayload);
      expect(res.status).toBe(500);
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
      expect(res.body).toHaveProperty("error");
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
});
