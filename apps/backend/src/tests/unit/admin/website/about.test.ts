import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

jest.mock("@/config", () => ({
  prisma: {
    about: {
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
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

jest.mock("@/middlewares/admin", () => ({
  adminAuthenticate: (req: any, res: any, next: any) => next(),
  isAdminVerified: (req: any, res: any, next: any) => next(),
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
  const errorMessages = {
    ...((actual as any).errorMessages ?? {}),
    aboutNotFound: {
      en: "About not found",
      ka: "ჩემს შესახებ ინფორმაცია ვერ მოიძებნა",
    },
    aboutDeleted: {
      en: "About deleted successfully",
      ka: "ჩემს შესახებ ინფორმაცია წარმატებით წაიშალა",
    },
    aboutAlreadyExists: {
      en: "About already exists",
      ka: "ჩემს შესახებ ინფორმაცია უკვე არსებობს",
    },
  };

  return {
    ...actual,
    createTranslations: jest.fn((translations: any) =>
      Object.entries(translations).map(([lang, payload]: any) => ({
        language: { connect: { code: lang } },
        headline: payload.headline,
        description: payload.description,
      }))
    ),
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

import { adminAboutRouter } from "@/routes/admin/website/about";
import { prisma } from "@/config";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/admin/about", adminAboutRouter);

const mockAbout = {
  id: "11111111-1111-1111-1111-111111111111",
  translations: [
    { id: "t1", headline: "H1", description: "D1", language: { code: "en" } },
    {
      id: "t2",
      headline: "H1 ka",
      description: "D1 ka",
      language: { code: "ka" },
    },
  ],
  image: null,
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Admin About routes — /admin/about", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /admin/about", () => {
    it("returns about when found", async () => {
      (prisma.about.findFirst as jest.Mock).mockResolvedValueOnce(mockAbout);

      const res = await request(app).get("/admin/about");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toEqual(mockAbout);
      expect(prisma.about.findFirst).toHaveBeenCalled();
    });

    it("returns 404 when about not found", async () => {
      (prisma.about.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get("/admin/about");

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("handles DB error with 500", async () => {
      (prisma.about.findFirst as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );

      const res = await request(app).get("/admin/about");

      expect(res.statusCode).toBe(500);
    });
  });

  describe("DELETE /admin/about", () => {
    it("deletes about successfully when count > 0", async () => {
      (prisma.about.deleteMany as jest.Mock).mockResolvedValueOnce({
        count: 1,
      });

      const res = await request(app).delete("/admin/about");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toBeDefined();
      expect(prisma.about.deleteMany).toHaveBeenCalled();
    });

    it("returns 404 when nothing to delete", async () => {
      (prisma.about.deleteMany as jest.Mock).mockResolvedValueOnce({
        count: 0,
      });

      const res = await request(app).delete("/admin/about");

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("handles DB error with 500", async () => {
      (prisma.about.deleteMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );

      const res = await request(app).delete("/admin/about");

      expect(res.statusCode).toBe(500);
    });
  });

  describe("POST /admin/about", () => {
    it("creates about successfully when none exists", async () => {
      (prisma.about.count as jest.Mock).mockResolvedValueOnce(0);
      (prisma.about.create as jest.Mock).mockResolvedValueOnce(mockAbout);

      const payload = {
        translations: {
          en: { headline: "Hello", description: "Desc" },
          ka: { headline: "გამარჯობა", description: "აღწერა" },
        },
        image: null,
      };

      const res = await request(app).post("/admin/about").send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("data");
      expect(prisma.about.count).toHaveBeenCalled();
      expect(prisma.about.create).toHaveBeenCalled();
    });

    it("returns 400 when about already exists", async () => {
      (prisma.about.count as jest.Mock).mockResolvedValueOnce(1);

      const payload = {
        translations: {
          en: { headline: "Hello", description: "Desc" },
          ka: { headline: "გამარჯობა", description: "აღწერა" },
        },
        image: null,
      };

      const res = await request(app).post("/admin/about").send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 when translations invalid/missing (validation)", async () => {
      const res = await request(app)
        .post("/admin/about")
        .send({ translations: {} });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("handles DB error with 500", async () => {
      (prisma.about.count as jest.Mock).mockResolvedValueOnce(0);
      (prisma.about.create as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );

      const payload = {
        translations: {
          en: { headline: "Hello", description: "Desc" },
          ka: { headline: "გამარჯობა", description: "აღწერა" },
        },
        image: null,
      };

      const res = await request(app).post("/admin/about").send(payload);

      expect(res.statusCode).toBe(500);
    });
  });

  describe("PUT /admin/about/:id", () => {
    it("updates about successfully", async () => {
      const id = mockAbout.id;
      (prisma.about.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockAbout,
        image: null,
      });
      (prisma.about.update as jest.Mock).mockResolvedValueOnce({
        ...mockAbout,
        translations: [
          {
            id: "t1",
            headline: "Updated",
            description: "D",
            language: { code: "en" },
          },
        ],
      });

      const payload = {
        translations: {
          en: { headline: "Updated", description: "D" },
          ka: { headline: "განახლება", description: "dka" },
        },
        image: null,
      };

      const res = await request(app).put(`/admin/about/${id}`).send(payload);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(prisma.about.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id },
          include: { image: true },
        })
      );
      expect(prisma.about.update).toHaveBeenCalled();
    });

    it("returns 404 when updating non-existing about", async () => {
      const id = mockAbout.id;
      (prisma.about.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put(`/admin/about/${id}`)
        .send({
          translations: {
            en: { headline: "x", description: "d" },
            ka: { headline: "x", description: "d" },
          },
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for invalid UUID param", async () => {
      const res = await request(app)
        .put("/admin/about/not-a-uuid")
        .send({
          translations: {
            en: { headline: "x", description: "d" },
            ka: { headline: "x", description: "d" },
          },
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("handles DB error with 500", async () => {
      const id = mockAbout.id;
      (prisma.about.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockAbout,
        image: null,
      });
      (prisma.about.update as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );

      const res = await request(app)
        .put(`/admin/about/${id}`)
        .send({
          translations: {
            en: { headline: "x", description: "d" },
            ka: { headline: "x", description: "d" },
          },
        });

      expect(res.statusCode).toBe(500);
    });
  });
});
