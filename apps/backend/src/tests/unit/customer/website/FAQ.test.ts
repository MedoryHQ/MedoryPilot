import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@/config";
import { authMatchers } from "@/tests/helpers/authMatchers";
import { FAQRouter } from "@/routes/customer/website/FAQ";

jest.mock("@/config", () => ({
  prisma: {
    fAQ: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
  getEnvVariable: jest.fn(() => {
    return "test";
  }),
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

    logCustomerCatchyError: jest.fn(),
  };
});

expect.extend(authMatchers);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/faq", FAQRouter);

const mockFAQ = {
  id: "11111111-1111-1111-1111-111111111111",
  order: 1,
  translations: [
    {
      id: "t1",
      question: "Q?",
      answer: "A.",
      language: { code: "en" },
    },
  ],
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Customer FAQ routes — /faq", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /faq", () => {
    it("returns list of FAQs with count", async () => {
      (prisma.fAQ.findMany as jest.Mock).mockResolvedValueOnce([mockFAQ]);
      (prisma.fAQ.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/faq");

      expect(res).toHaveStatus(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toEqual(1);
      expect(prisma.fAQ.findMany).toHaveBeenCalled();
      expect(prisma.fAQ.count).toHaveBeenCalled();
    });

    it("handles DB error gracefully", async () => {
      (prisma.fAQ.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );
      const res = await request(app).get("/faq");
      expect(res).toHaveStatus(500);
    });
  });
});
