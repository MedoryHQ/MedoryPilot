import { prisma } from "@/config";
import {
  generateWhereInput,
  getPaginationAndFilters,
  sendError,
} from "@/utils";
import { NextFunction, Response, Request } from "express";
import {
  logAdminError as logCatchyError,
  logAdminInfo as logInfo,
  logAdminWarn as logWarn,
} from "@/utils";
import { Prisma } from "@prisma/client";

export const fetchNewses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, orderBy, search } = getPaginationAndFilters(req);

    const where = generateWhereInput<Prisma.NewsWhereInput>(search, {
      "translations.some.content": "insensitive",
    });

    const [newses, count] = await Promise.all([
      prisma.news.findMany({
        skip,
        take,
        orderBy,
        where,
        include: {
          background: true,
          translations: {
            include: {
              language: {
                select: {
                  code: true,
                },
              },
            },
          },
        },
      }),
      prisma.news.count({ where }),
    ]);

    return res.status(200).json({ data: newses, count });
  } catch (error) {
    logCatchyError("fetch_newses_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_newses_exception",
    });
    next(error);
  }
};

export const fetchNews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const news = await prisma.news.findUnique({
      where: {
        id,
      },
      include: {
        background: true,
        translations: {
          include: {
            language: {
              select: {
                code: true,
              },
            },
          },
        },
      },
    });

    if (!news) {
      logWarn("News fetch failed: news not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "news_fetch_failed",
      });
      return sendError(req, res, 404, "newsNotFound");
    }

    return res.status(200).json({ data: news });
  } catch (error) {
    logCatchyError("fetch_news_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_news_exception",
    });
    next(error);
  }
};
