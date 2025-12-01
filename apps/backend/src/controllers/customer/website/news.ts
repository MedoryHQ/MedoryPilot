import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import {
  generateWhereInput,
  getPaginationAndFilters,
  sendError,
  logCustomerCatchyError as logCatchyError,
  logCustomerWarn as logWarn,
  parseBooleanQuery,
} from "@/utils";
import { Prisma } from "@prisma/client";

export const fetchNewses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, orderBy, search } = getPaginationAndFilters(req);

    const { showInLanding } = req.query as { showInLanding: string };
    const isLanding = parseBooleanQuery(showInLanding);

    const where = generateWhereInput<Prisma.NewsWhereInput>(
      search,
      {
        "translations.some.name": "insensitive",
        "translations.some.content": "insensitive",
        "translations.some.description": "insensitive",
        slug: "insensitive",
      },
      {
        AND: [
          typeof isLanding === "boolean"
            ? {
                showInLanding: isLanding,
              }
            : {},
        ],
      }
    );

    const [newses, count] = await Promise.all([
      prisma.news.findMany({
        skip,
        take,
        orderBy,
        where,
        select: {
          background: true,
          metaDescription: true,
          metaImage: true,
          metaKeywords: true,
          metaTitle: true,
          order: true,
          showInLanding: true,
          slug: true,
          translations: {
            select: {
              name: true,
              description: true,
              content: true,
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
      event: "fetch_newses_exception",
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
    const { slug } = req.params;

    const news = await prisma.news.findUnique({
      where: {
        slug,
      },
      select: {
        background: true,
        metaDescription: true,
        metaImage: true,
        metaKeywords: true,
        metaTitle: true,
        order: true,
        showInLanding: true,
        slug: true,
        translations: {
          select: {
            content: true,
            name: true,
            description: true,
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
      event: "fetch_news_exception",
    });
    next(error);
  }
};
