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
  parseBooleanQuery,
  parseFilters,
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
    const filters = parseFilters(req);

    const { showInLanding, withMeta, background } = filters as {
      showInLanding?: boolean | string;
      withMeta?: boolean | string;
      background?: boolean | string;
    };

    const isLanding = parseBooleanQuery(showInLanding);
    const meta = parseBooleanQuery(withMeta);
    const hasBackground = parseBooleanQuery(background);

    const where = generateWhereInput<Prisma.NewsWhereInput>(
      search,
      {
        "translations.some.content": "insensitive",
        slug: "insensitive",
      },
      {
        AND: [
          typeof isLanding === "boolean"
            ? {
                showInLanding: isLanding,
              }
            : {},
          typeof meta === "boolean"
            ? meta
              ? {
                  metaImage: { isNot: null },
                  metaDescription: {
                    not: null,
                  },
                  metaKeywords: {
                    not: null,
                  },
                  metaTitle: {
                    not: null,
                  },
                }
              : {
                  metaImage: null,
                  metaDescription: null,
                  metaKeywords: null,
                }
            : {},
          typeof hasBackground === "boolean"
            ? background
              ? { background: { isNot: null } }
              : { background: { is: null } }
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
        include: {
          background: true,
          metaImage: true,
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
        metaImage: true,
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
    const { translations, background, order, metaImage, ...rest } =
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

    const metaImageToCreate = metaImage
      ? {
          path: metaImage.path,
          name: metaImage.name,
          size: metaImage.size,
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
        ...(metaImageToCreate
          ? { metaImage: { create: metaImageToCreate } }
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

    const { translations, background, metaImage, order, ...rest } =
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

    const metaImageToCreate = metaImage
      ? {
          path: metaImage.path,
          name: metaImage.name,
          size: metaImage.size,
        }
      : undefined;

    const findNews = await prisma.news.findUnique({
      where: { slug },
      include: {
        background: true,
        metaImage: true,
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

    const hasBackgroundProp = Object.prototype.hasOwnProperty.call(
      req.body,
      "background"
    );
    const hasMetaImageProp = Object.prototype.hasOwnProperty.call(
      req.body,
      "metaImage"
    );

    const backgroundNested =
      hasBackgroundProp && backgroundToCreate
        ? {
            upsert: {
              update: backgroundToCreate,
              create: backgroundToCreate,
            },
          }
        : hasBackgroundProp && background === null
        ? { delete: true }
        : undefined;

    const metaImageNested =
      hasMetaImageProp && metaImageToCreate
        ? {
            upsert: {
              update: metaImageToCreate,
              create: metaImageToCreate,
            },
          }
        : hasMetaImageProp && metaImage === null
        ? { delete: true }
        : undefined;

    const news = await prisma.news.update({
      where: { slug },
      data: {
        ...rest,
        ...(order !== undefined ? { order } : {}),
        translations: {
          deleteMany: {},
          create: translationsToCreate,
        },
        ...(backgroundNested ? { background: backgroundNested } : {}),
        ...(metaImageNested ? { metaImage: metaImageNested } : {}),
      },
      include: {
        background: true,
        metaImage: true,
        translations: {
          include: { language: { select: { code: true } } },
        },
      },
    });

    logInfo("News updated successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "news_updated",
    });

    return res.json({ data: news });
  } catch (error) {
    logCatchyError("Update news exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_update_news_exception",
    });
    next(error);
  }
};
