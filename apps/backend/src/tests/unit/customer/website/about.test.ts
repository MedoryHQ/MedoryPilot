import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

jest.mock("@/config", () => ({
  prisma: {
    about: {
      findFirst: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
  getEnvVariable: jest.fn(() => "test"),
}));

jest.mock("@/utils", () => {
  const actual = jest.requireActual("@/utils");
  return {
    ...actual,
    logCustomerWarn: jest.fn(),
    logCustomerCatchyError: jest.fn(),
    sendError: jest.fn((req: any, res: any, status: number, key: string) =>
      res.status(status).json({ error: key })
    ),
  };
});

import { prisma } from "@/config";
import { aboutRouter } from "@/routes/customer/website/about";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/about", aboutRouter);

const mockAbout = {
  image: null,
  translations: [
    {
      headline: "Hello",
      description: "About me",
      language: { code: "en" },
    },
    {
      headline: "გამარჯობა",
      description: "ჩემს შესახებ",
      language: { code: "ka" },
    },
  ],
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Customer About routes — /about", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /about", () => {
    it("returns the about data when found", async () => {
      (prisma.about.findFirst as jest.Mock).mockResolvedValueOnce(mockAbout);

      const res = await request(app).get("/about");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.translations)).toBe(true);
      expect(res.body.data.translations).toHaveLength(2);
      expect(prisma.about.findFirst).toHaveBeenCalledTimes(1);
    });

    it("returns 404 when about not found", async () => {
      (prisma.about.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get("/about");

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "aboutNotFound");
    });

    it("handles DB error gracefully (500)", async () => {
      (prisma.about.findFirst as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );

      const res = await request(app).get("/about");

      expect(res.statusCode).toBe(500);
    });
  });
});
