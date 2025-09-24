import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { adminContactRouter } from "@/routes/admin/website/contact";
import { prisma } from "@/config";
import { errorMessages } from "@/utils";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/contact", adminContactRouter);

jest.mock("@/config", () => ({
  prisma: {
    contact: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
  getEnvVariable: jest.fn(() => "test"),
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

jest.mock("@/middlewares/admin", () => ({
  isAdminVerified: (_req: any, _res: any, next: any) => next(),
  adminAuthenticate: (_req: any, _res: any, next: any) => next(),
}));

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
    sendError: jest.fn((req: any, res: any, status: number, key: string) =>
      res.status(status).json({ error: (errorMessages as any)[key] ?? key })
    ),
    getResponseMessage: jest.fn((key: string) => key),
    GLOBAL_ERROR_MESSAGE: "GLOBAL_ERROR",
    errorMessages,
    logAdminError: jest.fn(),
    logAdminInfo: jest.fn(),
    logAdminWarn: jest.fn(),
  };
});

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

describe("Admin Contact (integration-style) — /contact", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /contact", () => {
    it("returns contact if found", async () => {
      (prisma.contact.findFirst as jest.Mock).mockResolvedValueOnce(
        mockContact
      );

      const res = await request(app).get("/contact");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("id", mockContact.id);
      expect(prisma.contact.findFirst).toHaveBeenCalledTimes(1);
    });

    it("returns 404 if not found", async () => {
      (prisma.contact.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get("/contact");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", errorMessages.contactNotFound);
    });
  });

  describe("POST /contact", () => {
    it("creates a new contact", async () => {
      (prisma.contact.create as jest.Mock).mockResolvedValueOnce(mockContact);

      const res = await request(app)
        .post("/contact")
        .send({
          location: "Tbilisi",
          translations: {
            en: { title: "Hello", description: "World" },
            ka: { title: "გამარჯობა", description: "მსოფლიო" },
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("id", mockContact.id);
      expect(prisma.contact.create).toHaveBeenCalledTimes(1);
    });

    it("fails with 400 if translations missing", async () => {
      const res = await request(app).post("/contact").send({
        location: "No Translations",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("PUT /contact/:id", () => {
    it("updates a contact", async () => {
      (prisma.contact.findUnique as jest.Mock).mockResolvedValueOnce(
        mockContact
      );
      (prisma.contact.update as jest.Mock).mockResolvedValueOnce({
        ...mockContact,
        location: "Updated",
      });

      const res = await request(app)
        .put(`/contact/${mockContact.id}`)
        .send({
          location: "Updated",
          translations: {
            en: { title: "Bye", description: "World" },
            ka: { title: "ნახვამდის", description: "მსოფლიო" },
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("location", "Updated");
      expect(prisma.contact.update).toHaveBeenCalledTimes(1);
    });

    it("returns 404 if contact not found", async () => {
      (prisma.contact.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put(`/contact/${mockContact.id}`)
        .send(updatePayload);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", errorMessages.contactNotFound);
    });

    it("returns 400 for invalid UUID id", async () => {
      const res = await request(app)
        .put("/contact/not-a-uuid")
        .send(updatePayload);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("DELETE /contact", () => {
    it("deletes contact if found", async () => {
      (prisma.contact.deleteMany as jest.Mock).mockResolvedValueOnce({
        count: 1,
      });

      const res = await request(app).delete("/contact");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
    });

    it("returns 404 if nothing deleted", async () => {
      (prisma.contact.deleteMany as jest.Mock).mockResolvedValueOnce({
        count: 0,
      });

      const res = await request(app).delete("/contact");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", errorMessages.contactNotFound);
    });
  });
});
