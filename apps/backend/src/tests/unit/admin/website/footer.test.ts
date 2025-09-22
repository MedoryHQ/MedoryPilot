import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

jest.mock("@/config", () => ({
  prisma: {
    footer: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
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
import { adminFooterRouter } from "@/routes/admin/website/footer";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/admin/footer", adminFooterRouter);

const mockFooter = {
  id: "11111111-1111-1111-1111-111111111111",
  phone: "+995555555555",
  email: "email.test@gmail.com",
  pages: [],
  socials: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

afterAll(async () => {
  try {
    await prisma.$disconnect();
  } catch {}
});

describe("Admin Footer routes — /admin/footer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /admin/footer", () => {
    it("returns footer successfully", async () => {
      (prisma.footer.findFirst as jest.Mock).mockResolvedValueOnce(mockFooter);

      const res = await request(app).get("/admin/footer");

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockFooter);
      expect(prisma.footer.findFirst).toHaveBeenCalled();
    });

    it("handles DB error gracefully", async () => {
      (prisma.footer.findFirst as jest.Mock).mockRejectedValueOnce(
        new Error("DB Error")
      );

      const res = await request(app).get("/admin/footer");

      expect(res.status).toBe(500);
    });
  });
});
