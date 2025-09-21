import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@/config";
import { authMatchers } from "@/tests/helpers/authMatchers";
import { socialRouter } from "@/routes/customer/website/social";

jest.mock("@/config", () => ({
  prisma: {
    social: {
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
app.use("/social", socialRouter);

const mockSocial = {
  id: "33333333-3333-3333-3333-333333333333",
  url: "https://example.com",
  name: "example",
  icon: null,
  footerId: "44444444-4444-4444-4444-444444444444",
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe.skip("Customer social routes — /social", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /social", () => {
    it("returns list of socials with count", async () => {
      (prisma.social.findMany as jest.Mock).mockResolvedValueOnce([mockSocial]);
      (prisma.social.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/social");

      expect(res).toHaveStatus(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toEqual(1);
      expect(prisma.social.findMany).toHaveBeenCalled();
      expect(prisma.social.count).toHaveBeenCalled();
    });

    it("handles DB error gracefully", async () => {
      (prisma.social.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );
      const res = await request(app).get("/social");
      expect(res).toHaveStatus(500);
    });
  });
});
