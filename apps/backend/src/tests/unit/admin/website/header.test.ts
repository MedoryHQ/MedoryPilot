import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@/config";
import { adminHeaderRouter } from "@/routes/admin/website/header";

jest.mock("@/config", () => ({
  prisma: {
    header: {
      findFirst: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
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
app.use("/header", adminHeaderRouter);

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

describe("Admin Header API — /header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /header", () => {
    it("returns header when found", async () => {
      (prisma.header.findFirst as jest.Mock).mockResolvedValueOnce(mockHeader);

      const res = await request(app).get("/header");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("id", mockHeader.id);
      expect(prisma.header.findFirst).toHaveBeenCalled();
    });

    it("returns 404 when not found", async () => {
      (prisma.header.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get("/header");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("handles DB error", async () => {
      (prisma.header.findFirst as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );

      const res = await request(app).get("/header");

      expect(res.status).toBe(500);
    });
  });
});
