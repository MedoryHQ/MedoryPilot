import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

jest.mock("@/config", () => ({
  prisma: {
    hero: { count: jest.fn() },
    introduce: { count: jest.fn() },
    news: { count: jest.fn() },
    service: { count: jest.fn() },
    fAQ: { count: jest.fn() },
    blog: { count: jest.fn() },
    category: { count: jest.fn() },
    contact: { count: jest.fn() },
    footer: { count: jest.fn() },
    social: { count: jest.fn() },
    pageComponent: { count: jest.fn() },
    tariff: { count: jest.fn() },
    about: { count: jest.fn() },
    education: { count: jest.fn() },
    experience: { count: jest.fn() },
    video: { count: jest.fn() },
    $disconnect: jest.fn(),
  },
}));

jest.mock("@/middlewares/admin", () => ({
  isAdminVerified: (req: any, res: any, next: any) => next(),
  adminAuthenticate: (req: any, res: any, next: any) => next(),
}));

jest.mock("@/utils", () => ({
  logAdminError: jest.fn(),
  GLOBAL_ERROR_MESSAGE: "GLOBAL_ERROR",
}));

import { prisma } from "@/config";
import { adminOverviewRouter } from "@/routes/admin/website/overview";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/admin/overview", adminOverviewRouter);

afterAll(async () => {
  try {
    await prisma.$disconnect();
  } catch {}
});

describe("Admin Overview routes — /admin/overview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /admin/overview", () => {
    it("returns overview counts successfully", async () => {
      (prisma.hero.count as jest.Mock).mockResolvedValueOnce(5);
      (prisma.introduce.count as jest.Mock).mockResolvedValueOnce(1);
      (prisma.news.count as jest.Mock).mockResolvedValueOnce(10);
      (prisma.service.count as jest.Mock).mockResolvedValueOnce(7);
      (prisma.fAQ.count as jest.Mock).mockResolvedValueOnce(3);
      (prisma.blog.count as jest.Mock).mockResolvedValueOnce(4);
      (prisma.category.count as jest.Mock).mockResolvedValueOnce(2);
      (prisma.contact.count as jest.Mock).mockResolvedValueOnce(1);
      (prisma.footer.count as jest.Mock).mockResolvedValueOnce(1);
      (prisma.social.count as jest.Mock).mockResolvedValueOnce(6);
      (prisma.pageComponent.count as jest.Mock).mockResolvedValueOnce(9);
      (prisma.tariff.count as jest.Mock).mockResolvedValueOnce(5);
      (prisma.about.count as jest.Mock).mockResolvedValueOnce(1);
      (prisma.education.count as jest.Mock).mockResolvedValueOnce(2);
      (prisma.experience.count as jest.Mock).mockResolvedValueOnce(4);
      (prisma.video.count as jest.Mock).mockResolvedValueOnce(11);

      const res = await request(app).get("/admin/overview");

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual({
        heros: 5,
        introduce: 1,
        newses: 10,
        services: 7,
        faqs: 3,
        blogs: 4,
        categories: 2,
        contact: 1,
        footer: 1,
        socials: 6,
        pages: 9,
        tariffs: 5,
        about: 1,
        educations: 2,
        experiences: 4,
        videos: 11,
      });

      expect(prisma.hero.count).toHaveBeenCalled();
      expect(prisma.introduce.count).toHaveBeenCalled();
      expect(prisma.news.count).toHaveBeenCalled();
      expect(prisma.service.count).toHaveBeenCalled();
      expect(prisma.fAQ.count).toHaveBeenCalled();
      expect(prisma.blog.count).toHaveBeenCalled();
      expect(prisma.category.count).toHaveBeenCalled();
      expect(prisma.contact.count).toHaveBeenCalled();
      expect(prisma.footer.count).toHaveBeenCalled();
      expect(prisma.social.count).toHaveBeenCalled();
      expect(prisma.pageComponent.count).toHaveBeenCalled();
      expect(prisma.tariff.count).toHaveBeenCalled();
      expect(prisma.about.count).toHaveBeenCalled();
      expect(prisma.education.count).toHaveBeenCalled();
      expect(prisma.experience.count).toHaveBeenCalled();
      expect(prisma.video.count).toHaveBeenCalled();
    });

    it("handles DB errors gracefully", async () => {
      (prisma.hero.count as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );

      const res = await request(app).get("/admin/overview");

      expect(res.status).toBe(500);
      expect(require("@/utils").logAdminError).toHaveBeenCalled();
    });
  });
});
