import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import {
  createTranslations,
  generateWhereInput,
  getPaginationAndFilters,
  getResponseMessage,
  sendError,
  logAdminError as logCatchyError,
  logAdminInfo as logInfo,
  logAdminWarn as logWarn,
} from "@/utils";
import { Prisma } from "@prisma/client";
import { CreateNewsDTO, UpdateNewsDTO } from "@/types/admin";

export const fetchNewses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, orderBy, search } = getPaginationAndFilters(req);

    const where = generateWhereInput<Prisma.NewsWhereInput>(search, {
      "translations.some.content": "insensitive",
      slug: "insensitive",
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
    const { slug } = req.params;

    const news = await prisma.news.findUnique({
      where: {
        slug,
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

export const deleteNews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    logInfo("News delete attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "news_delete_attempt",
    });

    const news = await prisma.news.delete({
      where: {
        slug,
      },
    });

    if (!news) {
      logWarn("News delete failed: news not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "news_delete_failed",
      });
      return sendError(req, res, 404, "newsNotFound");
    }

    logInfo("News deleted successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "news_deleted",
    });

    return res.status(200).json({
      message: getResponseMessage("newsDeleted"),
    });
  } catch (error) {
    logCatchyError("delete_news_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_delete_news_exception",
    });
    next(error);
  }
};

export const createNews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { translations, background, order, ...rest } =
      req.body as CreateNewsDTO;

    logInfo("News create attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "news_create_attempt",
    });

    const translationsToCreate = Prisma.validator<
      Prisma.NewsTranslationCreateWithoutNewsInput[]
    >()(createTranslations(translations) as any);

    const backgroundToCreate = background
      ? {
          path: background.path,
          name: background.name,
          size: background.size,
        }
      : undefined;

    const news = await prisma.news.create({
      data: {
        ...rest,
        ...(order !== undefined ? { order } : {}),
        translations: { create: translationsToCreate },
        ...(backgroundToCreate
          ? { background: { create: backgroundToCreate } }
          : {}),
      },
    });

    logInfo("News created successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "news_created",
    });

    return res.status(201).json({
      data: news,
    });
  } catch (error) {
    logCatchyError("Create news exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_create_news_exception",
    });
    next(error);
  }
};

export const updateNews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    const { translations, background, order, ...rest } =
      req.body as UpdateNewsDTO;

    logInfo("News update attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "news_update_attempt",
    });

    const translationsToCreate = Prisma.validator<
      Prisma.NewsTranslationCreateWithoutNewsInput[]
    >()(createTranslations(translations) as any);
    const backgroundToCreate = background
      ? {
          path: background.path,
          name: background.name,
          size: background.size,
        }
      : undefined;

    const findNews = await prisma.news.findUnique({
      where: {
        slug,
      },
      include: {
        background: true,
      },
    });

    if (!findNews) {
      logWarn("News update failed: news not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "news_update_failed",
      });
      return sendError(req, res, 404, "newsNotFound");
    }

    const news = await prisma.news.update({
      where: {
        slug,
      },
      data: {
        ...rest,
        ...(order !== undefined ? { order } : {}),
        translations: {
          deleteMany: {},
          create: translationsToCreate,
        },
        background: backgroundToCreate
          ? {
              delete: findNews.background ? {} : undefined,
              create: backgroundToCreate,
            }
          : findNews.background
          ? { delete: {} }
          : undefined,
      },
    });

    logInfo("News updated successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "news_updated",
    });

    return res.json({
      data: news,
    });
  } catch (error) {
    logCatchyError("Update news exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_update_news_exception",
    });
    next(error);
  }
};
