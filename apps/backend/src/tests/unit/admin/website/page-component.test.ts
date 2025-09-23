import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "@/config";
import { adminPageComponentRouter } from "@/routes/admin/website/page-component";
import { authMatchers } from "@/tests/helpers/authMatchers";

jest.mock("@/config", () => ({
  prisma: {
    pageComponent: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
  getEnvVariable: jest.fn(() => "test"),
}));

jest.mock("@/middlewares/global/validationHandler", () => ({
  validationHandler: (req: any, res: any, next: any) => {
    const { validationResult } = require("express-validator");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return next();
  },
}));

jest.mock("@/middlewares/admin", () => ({
  isAdminVerified: (req: any, res: any, next: any) => next(),
  adminAuthenticate: (req: any, res: any, next: any) => next(),
}));

jest.mock("@/utils", () => {
  const actual = jest.requireActual("@/utils");
  const errorMessages = {
    ...((actual as any).errorMessages ?? {}),
    pageNotFound: {
      en: "Page not found",
      ka: "გვერდი ვერ მოიძებნა",
    },
    pageDeleted: {
      en: "Page deleted successfully",
      ka: "გვერდი წარმატებით წაიშალა",
    },
  };
  return {
    ...actual,
    generateWhereInput: jest.fn(() => ({})),
    getPaginationAndFilters: jest.fn(() => ({
      skip: 0,
      take: 10,
      orderBy: { slug: "asc" },
      search: undefined,
    })),
    getResponseMessage: jest.fn(
      (key: string) => (errorMessages as any)[key] ?? key
    ),
    sendError: jest.fn((req: any, res: any, status: number, key: string) =>
      res.status(status).json({ error: (errorMessages as any)[key] ?? key })
    ),
    logAdminError: jest.fn(),
    logAdminInfo: jest.fn(),
    logAdminWarn: jest.fn(),
    createTranslations: jest.fn(() => [
      {
        name: "Test",
        content: "Content",
        language: { connect: { code: "en" } },
      },
      {
        name: "ტესტი",
        content: "კონტენტი",
        language: { connect: { code: "ka" } },
      },
    ]),
  };
});

expect.extend(authMatchers);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/admin/page-component", adminPageComponentRouter);

const mockPageComponent = {
  slug: "test-component",
  footerOrder: 1,
  translations: [
    { name: "Test", content: "Content", language: { code: "en" } },
    { name: "ტესტი", content: "კონტენტი", language: { code: "ka" } },
  ],
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Admin PageComponent routes — /admin/page-component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /", () => {
    it("returns list of pageComponents with count", async () => {
      (prisma.pageComponent.findMany as jest.Mock).mockResolvedValueOnce([
        mockPageComponent,
      ]);
      (prisma.pageComponent.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/admin/page-component");

      expect(res).toHaveStatus(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toBe(1);
    });

    it("handles DB error", async () => {
      (prisma.pageComponent.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );
      const res = await request(app).get("/admin/page-component");
      expect(res).toHaveStatus(500);
    });
  });

  describe("GET /:slug", () => {
    it("returns a pageComponent when found", async () => {
      (prisma.pageComponent.findUnique as jest.Mock).mockResolvedValueOnce(
        mockPageComponent
      );
      const res = await request(app).get(
        `/admin/page-component/${mockPageComponent.slug}`
      );
      expect(res).toHaveStatus(200);
      expect(res.body.data.slug).toBe(mockPageComponent.slug);
    });

    it("returns 404 when not found", async () => {
      (prisma.pageComponent.findUnique as jest.Mock).mockResolvedValueOnce(
        null
      );
      const res = await request(app).get("/admin/page-component/missing");
      expect(res).toHaveStatus(404);
    });
  });

  describe("POST /", () => {
    it("creates a pageComponent", async () => {
      (prisma.pageComponent.create as jest.Mock).mockResolvedValueOnce(
        mockPageComponent
      );
      const res = await request(app)
        .post("/admin/page-component")
        .send({
          slug: "test-component",
          translations: {
            en: { name: "Test", content: "Content" },
            ka: { name: "ტესტი", content: "კონტენტი" },
          },
        });
      expect(res).toHaveStatus(201);
      expect(res.body.data.slug).toBe("test-component");
    });

    it("returns 400 for invalid slug", async () => {
      const res = await request(app)
        .post("/admin/page-component")
        .send({ slug: "INVALID SLUG" });
      expect(res).toHaveStatus(400);
    });
  });

  describe("PUT /:slug", () => {
    it("updates a pageComponent", async () => {
      (prisma.pageComponent.findUnique as jest.Mock).mockResolvedValueOnce(
        mockPageComponent
      );
      (prisma.pageComponent.update as jest.Mock).mockResolvedValueOnce(
        mockPageComponent
      );
      const res = await request(app)
        .put(`/admin/page-component/${mockPageComponent.slug}`)
        .send({
          slug: "test-component",
          translations: {
            en: { name: "Updated", content: "Content" },
            ka: { name: "განახლებული", content: "კონტენტი" },
          },
        });
      expect(res).toHaveStatus(200);
      expect(res.body.data.slug).toBe("test-component");
    });

    it("returns 404 if not found", async () => {
      (prisma.pageComponent.findUnique as jest.Mock).mockResolvedValueOnce(
        null
      );
      const res = await request(app)
        .put(`/admin/page-component/missing`)
        .send({
          slug: "missing",
          translations: {
            en: { name: "Updated", content: "Content" },
            ka: { name: "განახლებული", content: "კონტენტი" },
          },
        });
      expect(res).toHaveStatus(404);
    });
  });
});
