import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@/config";
import { authMatchers } from "@/tests/helpers/authMatchers";
import { headerRouter } from "@/routes/customer/website/header";

jest.mock("@/config", () => ({
  prisma: {
    header: {
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
app.use("/header", headerRouter);

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

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Customer header routes — /header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /header", () => {
    it("returns the header when found", async () => {
      (prisma.header.findFirst as jest.Mock).mockResolvedValueOnce(mockHeader);

      const res = await request(app).get("/header");

      expect(res).toHaveStatus(200);
      expect(res.body.data).toBeDefined();
      expect(prisma.header.findFirst).toHaveBeenCalled();
    });

    it("returns 404 when header not found", async () => {
      (prisma.header.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get("/header");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "headerNotFound");
    });

    it("handles DB error gracefully", async () => {
      (prisma.header.findFirst as jest.Mock).mockRejectedValueOnce(
        new Error("DB")
      );

      const res = await request(app).get("/header");
      expect(res).toHaveStatus(500);
    });
  });
});
