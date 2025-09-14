import { prisma } from "@/config";
import { NextFunction, Request, Response } from "express";
import { logAdminError as logCatchyError } from "@/utils";

const overviewQueries = {
  headers: () => prisma.header.count(),
  introduce: () => prisma.introduce.count(),
  newses: () => prisma.news.count(),
  services: () => prisma.service.count(),
  faqs: () => prisma.fAQ.count(),
  blogs: () => prisma.blog.count(),
  categories: () => prisma.category.count(),
  contacts: () => prisma.contact.count(),
  footers: () => prisma.footer.count(),
  socials: () => prisma.social.count(),
  pages: () => prisma.pageComponent.count(),
  tariffs: async () => {
    const [currentCount, historyCount] = await Promise.all([
      prisma.tariff.count(),
      prisma.tariffHistory.count(),
    ]);
    return currentCount + historyCount;
  },
};

export const fetchOverviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const results = await Promise.all(
      Object.entries(overviewQueries).map(async ([key, query]) => [
        key,
        await query(),
      ])
    );

    const data = Object.fromEntries(results);

    return res.status(200).json({ data });
  } catch (error) {
    logCatchyError("fetch_overviews_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_overviews_exception",
    });
    next(error);
  }
};
