import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

jest.mock("@/config", () => ({
  prisma: {
    introduce: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
  getEnvVariable: jest.fn(() => "test"),
}));

jest.mock("@/middlewares/admin", () => ({
  isAdminVerified: (_req: any, _res: any, next: any) => next(),
  adminAuthenticate: (_req: any, _res: any, next: any) => next(),
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

jest.mock("@/validations/admin", () => {
  const actual = jest.requireActual("@/validations/admin");
  return {
    ...actual,
    fetchIntroduceValidation: [],
  };
});

jest.mock("@/utils", () => {
  const actual = jest.requireActual("@/utils");
  const errorMessages = {
    ...((actual as any).errorMessages ?? {}),
    introduceNotFound: {
      en: "Introduce not found",
      ka: "შესავალი ვერ მოიძებნა",
    },
    introduceDeleted: {
      en: "Introduce deleted successfully",
      ka: "შესავალი წარმატებით წაიშალა",
    },
  };

  return {
    ...actual,
    getResponseMessage: jest.fn(
      (key: string) => (errorMessages as any)[key] ?? key
    ),
    sendError: jest.fn((req: any, res: any, status: number, key: string) =>
      res.status(status).json({ error: (errorMessages as any)[key] ?? key })
    ),
    logAdminError: jest.fn(),
    logAdminInfo: jest.fn(),
    logAdminWarn: jest.fn(),
    errorMessages,
  };
});

import { prisma } from "@/config";
import { adminIntroduceRouter } from "@/routes/admin/website/introduce";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/introduce", adminIntroduceRouter);

const mockIntroduce = {
  id: "11111111-1111-1111-1111-111111111111",
  translations: [
    {
      id: "t-en",
      headline: "Hello",
      description: "Desc",
      language: { code: "en" },
    },
    {
      id: "t-ka",
      headline: "გამარჯობა",
      description: "აღწერა",
      language: { code: "ka" },
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Admin Introduce (integration-style) — /introduce", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /introduce", () => {
    it("returns the introduce when found", async () => {
      (prisma.introduce.findFirst as jest.Mock).mockResolvedValueOnce(
        mockIntroduce
      );

      const res = await request(app).get("/introduce");

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.translations)).toBe(true);
      expect(res.body.data.translations).toHaveLength(2);
      expect(prisma.introduce.findFirst).toHaveBeenCalledTimes(1);
    });

    it("returns 404 when introduce not found", async () => {
      (prisma.introduce.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get("/introduce");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("handles DB error gracefully (500)", async () => {
      (prisma.introduce.findFirst as jest.Mock).mockRejectedValueOnce(
        new Error("DB")
      );

      const res = await request(app).get("/introduce");
      expect(res.status).toBe(500);
    });
  });

  describe("POST /introduce", () => {
    const validPayload = {
      translations: {
        en: { headline: "Hello", description: "English desc" },
        ka: { headline: "გამარჯობა", description: "ქართული აღწერა" },
      },
    };

    it("creates introduce successfully", async () => {
      (prisma.introduce.create as jest.Mock).mockResolvedValueOnce(
        mockIntroduce
      );

      const res = await request(app).post("/introduce").send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(prisma.introduce.create).toHaveBeenCalledTimes(1);

      const callArg = (prisma.introduce.create as jest.Mock).mock.calls[0][0];
      expect(callArg).toHaveProperty("data");
      expect(callArg.data).toHaveProperty("translations");
    });

    it("returns 400 when translations missing or invalid", async () => {
      const res = await request(app)
        .post("/introduce")
        .send({ translations: {} });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("handles DB create error (500)", async () => {
      (prisma.introduce.create as jest.Mock).mockRejectedValueOnce(
        new Error("DB create")
      );

      const res = await request(app).post("/introduce").send(validPayload);
      expect(res.status).toBe(500);
    });
  });

  describe("PUT /introduce/:id", () => {
    const updatePayload = {
      translations: {
        en: { headline: "Updated", description: "Updated en" },
        ka: { headline: "განახლებულია", description: "Updated ka" },
      },
    };

    it("updates introduce successfully", async () => {
      (prisma.introduce.findUnique as jest.Mock).mockResolvedValueOnce(
        mockIntroduce
      );
      (prisma.introduce.update as jest.Mock).mockResolvedValueOnce({
        ...mockIntroduce,
        translations: updatePayload.translations,
      });

      const res = await request(app)
        .put(`/introduce/${mockIntroduce.id}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(prisma.introduce.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockIntroduce.id } })
      );
      expect(prisma.introduce.update).toHaveBeenCalledTimes(1);

      const updateArg = (prisma.introduce.update as jest.Mock).mock.calls[0][0];
      expect(updateArg).toHaveProperty("where");
      expect(updateArg).toHaveProperty("data");
      expect(updateArg.where).toEqual({ id: mockIntroduce.id });
    });

    it("returns 404 if introduce not found", async () => {
      (prisma.introduce.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put(`/introduce/${mockIntroduce.id}`)
        .send(updatePayload);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid body", async () => {
      const res = await request(app)
        .put(`/introduce/${mockIntroduce.id}`)
        .send({ translations: {} });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("handles DB update error (500)", async () => {
      (prisma.introduce.findUnique as jest.Mock).mockResolvedValueOnce(
        mockIntroduce
      );
      (prisma.introduce.update as jest.Mock).mockRejectedValueOnce(
        new Error("DB update")
      );

      const res = await request(app)
        .put(`/introduce/${mockIntroduce.id}`)
        .send(updatePayload);

      expect(res.status).toBe(500);
    });
  });

  describe("DELETE /introduce/:id", () => {
    it("deletes introduce successfully", async () => {
      (prisma.introduce.delete as jest.Mock).mockResolvedValueOnce(
        mockIntroduce
      );

      const res = await request(app).delete(`/introduce/${mockIntroduce.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
      expect(prisma.introduce.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockIntroduce.id } })
      );
    });

    it("returns 404 when delete target not found", async () => {
      (prisma.introduce.delete as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).delete(`/introduce/${mockIntroduce.id}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid id (UUID)", async () => {
      const res = await request(app).delete("/introduce/INVALID_ID!!");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("handles DB delete error (500)", async () => {
      (prisma.introduce.delete as jest.Mock).mockRejectedValueOnce(
        new Error("DB")
      );

      const res = await request(app).delete(`/introduce/${mockIntroduce.id}`);
      expect(res.status).toBe(500);
    });
  });
});
