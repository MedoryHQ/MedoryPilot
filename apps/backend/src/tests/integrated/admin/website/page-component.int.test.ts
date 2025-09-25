import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

jest.mock("@/config", () => ({
  prisma: {
    pageComponent: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
  getEnvVariable: jest.fn(() => "test"),
}));

jest.mock("@/middlewares/admin", () => ({
  isAdminVerified: (req: any, _res: any, next: any) => next(),
  adminAuthenticate: (req: any, _res: any, next: any) => next(),
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
    fetchPageComponentValidation: [],
  };
});

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
import { adminPageComponentRouter } from "@/routes/admin/website/page-component";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/admin/page-component", adminPageComponentRouter);

const mockPageComponent = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  slug: "home-component",
  footerId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  footerOrder: 2,
  translations: [
    {
      name: "Homepage block",
      content: "Some content",
      language: { code: "en" },
    },
    { name: "მთავარი ბლოკი", content: "ტექსტი", language: { code: "ka" } },
  ],
};

afterAll(async () => {
  try {
    await (require("@/config").prisma?.$disconnect?.() ?? Promise.resolve());
  } catch {}
});

describe("Admin PageComponent (integration-style) — /admin/page-component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /admin/page-component", () => {
    it("returns list with count", async () => {
      (prisma.pageComponent.findMany as jest.Mock).mockResolvedValueOnce([
        mockPageComponent,
      ]);
      (prisma.pageComponent.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get("/admin/page-component");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toBe(1);
      expect(prisma.pageComponent.findMany).toHaveBeenCalled();
      expect(prisma.pageComponent.count).toHaveBeenCalled();
    });

    it("returns empty list when no items", async () => {
      (prisma.pageComponent.findMany as jest.Mock).mockResolvedValueOnce([]);
      (prisma.pageComponent.count as jest.Mock).mockResolvedValueOnce(0);

      const res = await request(app).get("/admin/page-component");

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it("handles DB errors", async () => {
      (prisma.pageComponent.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("DB err")
      );
      const res = await request(app).get("/admin/page-component");
      expect(res.status).toBe(500);
    });
  });

  describe("GET /admin/page-component/:slug", () => {
    it("returns single page component when found", async () => {
      (prisma.pageComponent.findUnique as jest.Mock).mockResolvedValueOnce(
        mockPageComponent
      );

      const res = await request(app).get(
        `/admin/page-component/${mockPageComponent.slug}`
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("slug", mockPageComponent.slug);
      expect(prisma.pageComponent.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { slug: mockPageComponent.slug } })
      );
    });

    it("returns 404 when not found", async () => {
      (prisma.pageComponent.findUnique as jest.Mock).mockResolvedValueOnce(
        null
      );

      const res = await request(app).get(
        `/admin/page-component/${mockPageComponent.slug}`
      );
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 494 for invalid slug", async () => {
      const res = await request(app).get(
        "/admin/page-component/INVALID SLUG!!"
      );
      expect(res.status).toBe(404);
    });
  });

  describe("POST /admin/page-component", () => {
    const createPayload = {
      slug: "new-page-component",
      footerId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
      footerOrder: 1,
      translations: {
        en: { name: "Block", content: "Content" },
        ka: { name: "ბლოკი", content: "ვერძი" },
      },
    };

    it("creates new page component (with footer connect)", async () => {
      (prisma.pageComponent.create as jest.Mock).mockResolvedValueOnce({
        ...mockPageComponent,
        slug: createPayload.slug,
        footerId: createPayload.footerId,
      });

      const res = await request(app)
        .post("/admin/page-component")
        .send(createPayload);
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("slug", createPayload.slug);
      expect(prisma.pageComponent.create).toHaveBeenCalled();

      const createCall = (prisma.pageComponent.create as jest.Mock).mock
        .calls[0][0];
      expect(createCall).toHaveProperty("data");
      expect(createCall.data).toHaveProperty("translations");
      expect(createCall.data).toHaveProperty("footer");
      expect(createCall.data.footer).toEqual(
        expect.objectContaining({ connect: { id: createPayload.footerId } })
      );
    });

    it("creates new page component without footer", async () => {
      const payload = { ...createPayload };
      delete (payload as any).footerId;

      (prisma.pageComponent.create as jest.Mock).mockResolvedValueOnce({
        ...mockPageComponent,
        slug: payload.slug,
        footerId: null,
      });

      const res = await request(app)
        .post("/admin/page-component")
        .send(payload);
      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(prisma.pageComponent.create).toHaveBeenCalled();
      const createCall = (prisma.pageComponent.create as jest.Mock).mock
        .calls[0][0];
      expect(createCall.data).not.toHaveProperty("footer.connect");
    });

    it("returns 400 when translations invalid/missing", async () => {
      const res = await request(app)
        .post("/admin/page-component")
        .send({ slug: "x", translations: {} });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("handles DB create error (500)", async () => {
      (prisma.pageComponent.create as jest.Mock).mockRejectedValueOnce(
        new Error("DB create err")
      );
      const res = await request(app)
        .post("/admin/page-component")
        .send(createPayload);
      expect(res.status).toBe(500);
    });
  });

  describe("PUT /admin/page-component/:slug", () => {
    const updatePayload = {
      slug: "updated-component",
      translations: {
        en: { name: "Updated", content: "Updated content" },
        ka: { name: "განახლებული", content: "განახლებული ტექსტი" },
      },
    };

    it("updates page component and disconnects footer when footerId is explicitly null", async () => {
      (prisma.pageComponent.findUnique as jest.Mock).mockResolvedValueOnce(
        mockPageComponent
      );
      (prisma.pageComponent.update as jest.Mock).mockResolvedValueOnce({
        ...mockPageComponent,
        ...updatePayload,
        footerId: null,
      });

      const res = await request(app)
        .put(`/admin/page-component/${mockPageComponent.slug}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(prisma.pageComponent.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { slug: mockPageComponent.slug } })
      );
    });

    it("updates page component and connects footer when footerId provided", async () => {
      const newFooterId = "dddddddd-dddd-dddd-dddd-dddddddddddd";
      const payload = { ...updatePayload, footerId: newFooterId };

      (prisma.pageComponent.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockPageComponent,
        footerId: null,
      });
      (prisma.pageComponent.update as jest.Mock).mockResolvedValueOnce({
        ...mockPageComponent,
        ...payload,
        footerId: newFooterId,
      });

      const res = await request(app)
        .put(`/admin/page-component/${mockPageComponent.slug}`)
        .send(payload);

      expect(res.status).toBe(200);
      const updateCall = (prisma.pageComponent.update as jest.Mock).mock
        .calls[0][0];
      expect(updateCall.data.footer).toEqual(
        expect.objectContaining({ connect: { id: newFooterId } })
      );
    });

    it("returns 404 when trying to update non-existing component", async () => {
      (prisma.pageComponent.findUnique as jest.Mock).mockResolvedValueOnce(
        null
      );
      const res = await request(app)
        .put(`/admin/page-component/${mockPageComponent.slug}`)
        .send(updatePayload);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 on invalid body", async () => {
      const res = await request(app)
        .put(`/admin/page-component/${mockPageComponent.slug}`)
        .send({ slug: "" });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("handles DB update error (500)", async () => {
      (prisma.pageComponent.findUnique as jest.Mock).mockResolvedValueOnce(
        mockPageComponent
      );
      (prisma.pageComponent.update as jest.Mock).mockRejectedValueOnce(
        new Error("DB update error")
      );
      const res = await request(app)
        .put(`/admin/page-component/${mockPageComponent.slug}`)
        .send(updatePayload);
      expect(res.status).toBe(500);
    });
  });

  describe("DELETE /admin/page-component/:slug", () => {
    it("deletes page component successfully", async () => {
      (prisma.pageComponent.delete as jest.Mock).mockResolvedValueOnce(
        mockPageComponent
      );

      const res = await request(app).delete(
        `/admin/page-component/${mockPageComponent.slug}`
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
      expect(prisma.pageComponent.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { slug: mockPageComponent.slug } })
      );
    });

    it("returns 404 when delete target not found", async () => {
      (prisma.pageComponent.delete as jest.Mock).mockResolvedValueOnce(null);
      const res = await request(app).delete(
        `/admin/page-component/${mockPageComponent.slug}`
      );
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("handles DB delete error (500)", async () => {
      (prisma.pageComponent.delete as jest.Mock).mockRejectedValueOnce(
        new Error("DB delete error")
      );
      const res = await request(app).delete(
        `/admin/page-component/${mockPageComponent.slug}`
      );
      expect(res.status).toBe(500);
    });

    it("returns 400 for invalid slug", async () => {
      const res = await request(app).delete(
        "/admin/page-component/INVALID SLUG!!"
      );
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });
});
