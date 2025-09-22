import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@/config";
import { authMatchers } from "@/tests/helpers/authMatchers";
import { footerRouter } from "@/routes/customer/website/footer";

jest.mock("@/config", () => ({
  prisma: {
    footer: {
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
app.use("/footer", footerRouter);

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
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Customer footer routes — /footer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /footer", () => {
    it("returns the footer when found", async () => {
      (prisma.footer.findFirst as jest.Mock).mockResolvedValueOnce(mockFooter);

      const res = await request(app).get("/footer");

      expect(res).toHaveStatus(200);
      expect(res.body.data).toBeDefined();
      expect(prisma.footer.findFirst).toHaveBeenCalled();
    });

    it("returns 404 when footer not found", async () => {
      (prisma.footer.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get("/footer");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "footerNotFound");
    });

    it("handles DB error gracefully", async () => {
      (prisma.footer.findFirst as jest.Mock).mockRejectedValueOnce(
        new Error("DB")
      );

      const res = await request(app).get("/footer");
      expect(res).toHaveStatus(500);
    });
  });
});
