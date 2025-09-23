import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@/config";
import { adminContactRouter } from "@/routes/admin/website/contact";

jest.mock("@/config", () => ({
  prisma: {
    contact: {
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
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
    fetchContactValidation: [],
  };
});

jest.mock("@/utils", () => {
  const actual = jest.requireActual("@/utils");
  const errorMessages = {
    ...((actual as any).errorMessages ?? {}),
    contactDeleted: {
      en: "Contact deleted successfully",
      ka: "კონტაქტი წარმატებით წაიშალა",
    },
    contactNotFound: {
      en: "Contact not found",
      ka: "კონტაქტი ვერ მოიძებნა",
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
app.use("/contact", adminContactRouter);

const mockContact = {
  id: "11111111-1111-1111-1111-111111111111",
  location: "Tbilisi, Georgia",
  background: null,
  translations: [
    { title: "Hello", description: "World", language: { code: "en" } },
    { title: "გამარჯობა", description: "მსოფლიო", language: { code: "ka" } },
  ],
};

const updatePayload = {
  location: "Batumi, Georgia",
  background: null,
  translations: {
    en: { title: "Goodbye", description: "World" },
    ka: { title: "კარგად", description: "მსოფლიო" },
  },
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Admin Contact API — /contact", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /contact", () => {
    it("returns contact when found", async () => {
      (prisma.contact.findFirst as jest.Mock).mockResolvedValueOnce(
        mockContact
      );

      const res = await request(app).get("/contact");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("id", mockContact.id);
      expect(prisma.contact.findFirst).toHaveBeenCalled();
    });

    it("returns 404 when no contact", async () => {
      (prisma.contact.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get("/contact");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("handles DB error gracefully", async () => {
      (prisma.contact.findFirst as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );

      const res = await request(app).get("/contact");

      expect(res.status).toBe(500);
    });
  });
});
