import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@/config";
import { authMatchers } from "@/tests/helpers/authMatchers";
import { experienceRouter } from "@/routes/customer/website/experience";

jest.mock("@/config", () => ({
  prisma: {
    experience: {
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
app.use("/experience", experienceRouter);

const mockExperience = {
  id: "44444444-4444-4444-4444-444444444444",
  translations: [
    {
      name: "Company A",
      position: "Developer",
      description: "Did stuff",
      language: { code: "en" },
    },
    {
      name: "კომპანია A",
      position: "დეველოპერი",
      description: "ვისწავლე ბევრი",
      language: { code: "ka" },
    },
  ],
  icon: null,
  link: null,
  location: null,
  fromDate: "2019-01-01",
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Customer experience routes — /experience", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /experience", () => {
    it("returns list of experiences with count", async () => {
      (prisma.experience.findMany as jest.Mock).mockResolvedValueOnce([
        mockExperience,
      ]);
      (prisma.experience.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/experience");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toEqual(1);
      expect(prisma.experience.findMany).toHaveBeenCalled();
      expect(prisma.experience.count).toHaveBeenCalled();
    });

    it("handles DB error gracefully", async () => {
      (prisma.experience.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );

      const res = await request(app).get("/experience");

      expect(res.statusCode).toBe(500);
    });
  });
});
