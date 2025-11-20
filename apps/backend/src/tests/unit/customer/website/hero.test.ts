import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@/config";
import { authMatchers } from "@/tests/helpers/authMatchers";
import { heroRouter } from "@/routes/customer/website/hero";

jest.mock("@/config", () => ({
  prisma: {
    hero: {
      findFirst: jest.fn(),
    },
    tariff: {
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
app.use("/hero", heroRouter);

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

const mockTariff = {
  id: "11111111-1111-1111-1111-111111111111",
  price: 100,
  isCurrent: true,
  fromDate: new Date().toISOString(),
  endDate: null,
  parentId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Customer hero routes — /hero", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /hero", () => {
    it("returns the hero when found", async () => {
      (prisma.hero.findFirst as jest.Mock).mockResolvedValueOnce(mockHero);
      (prisma.tariff.findFirst as jest.Mock).mockResolvedValueOnce(mockTariff);

      const res = await request(app).get("/hero");

      expect(res).toHaveStatus(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.tariff).toBeDefined();
      expect(prisma.hero.findFirst).toHaveBeenCalled();
    });

    it("returns 404 when hero not found", async () => {
      (prisma.hero.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (prisma.tariff.findFirst as jest.Mock).mockResolvedValueOnce(mockTariff);

      const res = await request(app).get("/hero");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "heroNotFound");
    });

    it("handles DB error gracefully", async () => {
      (prisma.hero.findFirst as jest.Mock).mockRejectedValueOnce(
        new Error("DB")
      );

      const res = await request(app).get("/hero");
      expect(res).toHaveStatus(500);
    });
  });
});
