import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@/config";
import { authMatchers } from "@/tests/helpers/authMatchers";
import { contactRouter } from "@/routes/customer/website/contact";

jest.mock("@/config", () => ({
  prisma: {
    contact: {
      findFirst: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
  getEnvVariable: jest.fn(() => {
    return "test";
  }),
}));

jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
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
  return {
    ...actual,
    logCustomerWarn: jest.fn(),
    logCustomerCatchyError: jest.fn(),
    sendError: jest.fn((req, res, status, key) =>
      res.status(status).json({ error: key })
    ),
    generateWhereInput: jest.fn((search: any, fields: any) => ({})),
    getPaginationAndFilters: jest.fn((req: any) => {
      const page = Number(req.query.page) || 1;
      const take = Number(req.query.take) || 10;
      return {
        skip: (page - 1) * take,
        take,
        orderBy: { order: "asc" },
        search: req.query.search,
      };
    }),
  };
});

expect.extend(authMatchers);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/contact", contactRouter);

const mockContact = {
  id: "11111111-1111-1111-1111-111111111111",
  location: "Tbilisi, Georgia",
  background: null,
  translations: [
    { title: "Hello", description: "World", language: { code: "en" } },
    { title: "გამარჯობა", description: "მსოფლიო", language: { code: "ka" } },
  ],
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Customer contact routes — /contact", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /contact", () => {
    it("returns the contact when found", async () => {
      (prisma.contact.findFirst as jest.Mock).mockResolvedValueOnce(
        mockContact
      );

      const res = await request(app).get("/contact");

      expect(res).toHaveStatus(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.translations).toHaveLength(2);
      expect(prisma.contact.findFirst).toHaveBeenCalled();
    });

    it("returns 404 when contact not found", async () => {
      (prisma.contact.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get("/contact");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "contactNotFound");
    });

    it("handles DB error gracefully", async () => {
      (prisma.contact.findFirst as jest.Mock).mockRejectedValueOnce(
        new Error("DB")
      );

      const res = await request(app).get("/contact");
      expect(res).toHaveStatus(500);
    });
  });
});
