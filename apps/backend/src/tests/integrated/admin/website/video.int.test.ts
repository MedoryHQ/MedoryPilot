import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

jest.mock("@/config", () => ({
  prisma: {
    video: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    file: {
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
  getEnvVariable: jest.fn((key: string) => {
    if (key === "ADMIN_JWT_ACCESS_SECRET") return "accessSecret";
    if (key === "ADMIN_JWT_REFRESH_SECRET") return "refreshSecret";
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

jest.mock("@/middlewares/admin", () => ({
  isAdminVerified: (req: any, res: any, next: any) => next(),
  adminAuthenticate: (req: any, res: any, next: any) => next(),
}));

jest.mock("@/utils", () => {
  const actual = jest.requireActual("@/utils");
  const errorMessages = {
    ...((actual as any).errorMessages ?? {}),
    videoNotFound: {
      en: "Video not found",
      ka: "ვიდეო ვერ მოიძებნა",
    },
    videoDeleted: {
      en: "Video deleted successfully",
      ka: "ვიდეო წარმატებით წაიშალა",
    },
  };

  return {
    ...actual,
    createTranslations: jest.fn((translations: any) =>
      Object.entries(translations || {}).map(([lang, payload]: any) => ({
        language: { connect: { code: lang } },
        name: payload?.name ?? payload?.title,
      }))
    ),
    generateWhereInput: jest.fn(() => ({})),
    parseFilters: jest.fn(() => ({})),
    getPaginationAndFilters: jest.fn((req: any) => {
      const page = Number(req.query.page) || 1;
      const take = Number(req.query.take) || 10;
      const orderBy = req.query.orderBy
        ? { order: req.query.orderBy }
        : { order: "asc" };
      return {
        skip: (page - 1) * take,
        take,
        orderBy,
        search: req.query.search,
      };
    }),
    getResponseMessage: jest.fn(
      (key: string) => (errorMessages as any)[key] ?? key
    ),
    sendError: jest.fn((req: any, res: any, status: number, key: string) => {
      res.status(status).json({ error: (errorMessages as any)[key] ?? key });
    }),
    logAdminError: jest.fn(),
    logAdminInfo: jest.fn(),
    logAdminWarn: jest.fn(),
    errorMessages,
  };
});

import { prisma } from "@/config";
import { adminVideoRouter } from "@/routes/admin/website/video";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/admin/video", adminVideoRouter);

const mockVideo = {
  id: "55555555-5555-5555-5555-555555555555",
  translations: [
    { id: "t1", name: "Video 1", language: { code: "en" } },
    { id: "t2", name: "ვიდეო 1", language: { code: "ka" } },
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

describe("Admin Video (integration-style) — /admin/video", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /admin/video", () => {
    it("returns list of videos with count", async () => {
      (prisma.video.findMany as jest.Mock).mockResolvedValueOnce([mockVideo]);
      (prisma.video.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/admin/video");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toEqual(1);
      expect(prisma.video.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.video.count).toHaveBeenCalledTimes(1);
    });

    it("handles DB error gracefully", async () => {
      (prisma.video.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );

      const res = await request(app).get("/admin/video");

      expect(res.statusCode).toBe(500);
    });
  });

  describe("GET /admin/video/:id", () => {
    it("returns single video when found", async () => {
      (prisma.video.findUnique as jest.Mock).mockResolvedValueOnce(mockVideo);

      const res = await request(app).get(`/admin/video/${mockVideo.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toEqual(mockVideo.id);
      expect(prisma.video.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockVideo.id } })
      );
    });

    it("returns 404 when not found", async () => {
      (prisma.video.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get(`/admin/video/${mockVideo.id}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid UUID", async () => {
      const res = await request(app).get("/admin/video/invalid-uuid");
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("DELETE /admin/video/:id", () => {
    it("deletes video successfully", async () => {
      (prisma.video.delete as jest.Mock).mockResolvedValueOnce(mockVideo);

      const res = await request(app).delete(`/admin/video/${mockVideo.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message");
      expect(prisma.video.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockVideo.id } })
      );
    });

    it("returns 404 when prisma returns null", async () => {
      (prisma.video.delete as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).delete(`/admin/video/${mockVideo.id}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("handles delete DB error (500)", async () => {
      (prisma.video.delete as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );

      const res = await request(app).delete(`/admin/video/${mockVideo.id}`);

      expect(res.statusCode).toBe(500);
    });

    it("returns 400 for invalid UUID", async () => {
      const res = await request(app).delete("/admin/video/not-uuid");
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("POST /admin/video", () => {
    it("creates video successfully", async () => {
      (prisma.video.create as jest.Mock).mockResolvedValueOnce(mockVideo);

      const payload = {
        translations: {
          en: { name: "New Video" },
          ka: { name: "ახალი ვიდეო" },
        },
        thumbnail: null,
        link: "https://example.com/video",
        date: "2024-01-01",
      };

      const res = await request(app).post("/admin/video").send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(prisma.video.create).toHaveBeenCalledTimes(1);
    });

    it("returns 400 when translations missing/invalid", async () => {
      const res = await request(app)
        .post("/admin/video")
        .send({ translations: {} });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("handles DB error with 500", async () => {
      (prisma.video.create as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );

      const payload = {
        translations: {
          en: { name: "New Video" },
          ka: { name: "ახალი ვიდეო" },
        },
        thumbnail: null,
        link: "https://example.com/video",
        date: "2024-01-01",
      };

      const res = await request(app).post("/admin/video").send(payload);

      expect(res.statusCode).toBe(500);
    });
  });

  describe("PUT /admin/video/:id", () => {
    it("updates video successfully with new thumbnail", async () => {
      const id = mockVideo.id;
      (prisma.video.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockVideo,
        thumbnail: null,
      });
      (prisma.file.create as jest.Mock).mockResolvedValueOnce({
        id: "file-id",
      });
      (prisma.video.update as jest.Mock).mockResolvedValueOnce({
        ...mockVideo,
        translations: [{ id: "t1", name: "Updated", language: { code: "en" } }],
      });

      const payload = {
        translations: {
          en: { name: "Updated" },
          ka: { name: "განახლებული" },
        },
        thumbnail: { path: "/thumb.png", name: "thumb.png", size: 123 },
        link: "https://example.com/video",
        date: "2024-01-01",
      };

      const res = await request(app).put(`/admin/video/${id}`).send(payload);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(prisma.video.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id }, include: { thumbnail: true } })
      );
      expect(prisma.file.create).toHaveBeenCalledTimes(1);
      expect(prisma.video.update).toHaveBeenCalledTimes(1);
    });

    it("returns 404 when updating non-existing video", async () => {
      const id = mockVideo.id;
      (prisma.video.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put(`/admin/video/${id}`)
        .send({
          translations: {
            en: { name: "x" },
            ka: { name: "xka" },
          },
          date: "2024-01-01",
          link: "https://video.com",
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid UUID param", async () => {
      const res = await request(app)
        .put("/admin/video/not-a-uuid")
        .send({
          translations: {
            en: { name: "x" },
            ka: { name: "xka" },
          },
          date: "2024-01-01",
          link: "https://video.com",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("handles DB error with 500 on update", async () => {
      const id = mockVideo.id;
      (prisma.video.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockVideo,
        thumbnail: null,
      });
      (prisma.video.update as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );

      const res = await request(app)
        .put(`/admin/video/${id}`)
        .send({
          translations: {
            en: { name: "x" },
            ka: { name: "xka" },
          },
          date: "2024-01-01",
          link: "https://video.com",
        });

      expect(res.statusCode).toBe(500);
    });
  });
});
