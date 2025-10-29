import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@/config";
import { authMatchers } from "@/tests/helpers/authMatchers";
import { videoRouter } from "@/routes/customer/website/video";

jest.mock("@/config", () => ({
  prisma: {
    video: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
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
    sendError: jest.fn((req, res, status, key) =>
      res.status(status).json({ error: key })
    ),
    logCustomerCatchyError: jest.fn(),
    logCustomerWarn: jest.fn(),
  };
});

expect.extend(authMatchers);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/video", videoRouter);

const mockVideo = {
  id: "55555555-5555-5555-5555-555555555555",
  translations: [
    { name: "Video 1", language: { code: "en" } },
    { name: "ვიდეო 1", language: { code: "ka" } },
  ],
  thumbnail: null,
  link: "https://example.com/video",
  date: "2024-01-01",
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Customer video routes — /video", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /video", () => {
    it("returns list of videos with count", async () => {
      (prisma.video.findMany as jest.Mock).mockResolvedValueOnce([mockVideo]);
      (prisma.video.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/video");

      expect(res).toHaveStatus(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toEqual(1);
      expect(prisma.video.findMany).toHaveBeenCalled();
      expect(prisma.video.count).toHaveBeenCalled();
    });
  });

  describe("GET /video/:id", () => {
    it("returns single video when found", async () => {
      (prisma.video.findUnique as jest.Mock).mockResolvedValueOnce(mockVideo);

      const res = await request(app).get(`/video/${mockVideo.id}`);

      expect(res).toHaveStatus(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toEqual(mockVideo.id);
    });

    it("returns 404 when not found", async () => {
      (prisma.video.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get(`/video/${mockVideo.id}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "videoNotFound");
    });

    it("returns 400 for invalid UUID", async () => {
      const res = await request(app).get("/video/invalid-uuid");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });
});
