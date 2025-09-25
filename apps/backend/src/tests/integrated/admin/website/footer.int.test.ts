import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

jest.mock("@/config", () => ({
  prisma: {
    footer: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
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
    fetchFooterValidation: [],
  };
});

jest.mock("@/utils", () => {
  const actual = jest.requireActual("@/utils");
  const errorMessages = {
    ...((actual as any).errorMessages ?? {}),
    footerDeleted: {
      en: "Footer deleted successfully",
      ka: "Footer წარმატებით წაიშალა",
    },
    footerAlreadyExists: {
      en: "Footer already exists",
      ka: "Footer უკვე არსებობს",
    },
    invalidFooterId: {
      en: "Invalid footer id",
      ka: "Footer-ის id არასწორია",
    },
    footerNotFound: {
      en: "Footer not found",
      ka: "Footer ვერ მოიძებნა",
    },
  };

  return {
    ...actual,
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
import { adminFooterRouter } from "@/routes/admin/website/footer";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/admin/footer", adminFooterRouter);

const mockFooter = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  phone: "+995 555 123 456",
  email: "info@test.com",
  pages: [
    {
      id: "11111111-1111-1111-1111-111111111111",
      slug: "home",
      footerOrder: 1,
      translations: [
        { name: "Home", content: "Home content", language: { code: "en" } },
      ],
    },
  ],
  socials: [
    {
      id: "22222222-2222-2222-2222-222222222222",
      url: "https://t.test",
      name: "test",
      icon: null,
    },
  ],
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Admin Footer (integration-style) — /admin/footer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /admin/footer", () => {
    it("returns the footer when exists", async () => {
      (prisma.footer.findFirst as jest.Mock).mockResolvedValueOnce(mockFooter);

      const res = await request(app).get("/admin/footer");

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data).toHaveProperty("id", mockFooter.id);
      expect(prisma.footer.findFirst).toHaveBeenCalled();
    });

    it("returns null data when no footer exists", async () => {
      (prisma.footer.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get("/admin/footer");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data", null);
    });

    it("handles DB error gracefully (500)", async () => {
      (prisma.footer.findFirst as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );
      const res = await request(app).get("/admin/footer");
      expect(res.status).toBe(500);
    });
  });
});
