import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@/config";
import { authMatchers } from "@/tests/helpers/authMatchers";
import { educationRouter } from "@/routes/customer/website/education";

jest.mock("@/config", () => ({
  prisma: {
    education: {
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
    logCustomerError: jest.fn(),
  };
});

expect.extend(authMatchers);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/education", educationRouter);

const mockEducation = {
  id: "33333333-3333-3333-3333-333333333333",
  translations: [
    {
      name: "Uni A",
      degree: "BSc",
      description: "Studied things",
      language: { code: "en" },
    },
    {
      name: "უნი A",
      degree: "ბაკალავრი",
      description: "სწავლა ბევრი",
      language: { code: "ka" },
    },
  ],
  icon: null,
  link: null,
  fromDate: "2020-01-01",
  endDate: null,
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Customer education routes — /education", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /education", () => {
    it("returns list of educations with count", async () => {
      (prisma.education.findMany as jest.Mock).mockResolvedValueOnce([
        mockEducation,
      ]);
      (prisma.education.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/education");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toEqual(1);
      expect(prisma.education.findMany).toHaveBeenCalled();
      expect(prisma.education.count).toHaveBeenCalled();
    });

    it("handles DB error gracefully", async () => {
      (prisma.education.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );

      const res = await request(app).get("/education");

      expect(res.statusCode).toBe(500);
    });
  });
});
