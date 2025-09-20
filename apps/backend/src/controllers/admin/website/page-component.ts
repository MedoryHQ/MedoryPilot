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
import { CreatePageComponentDTO, UpdatePageComponentDTO } from "@/types/admin";

export const fetchPageComponents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, orderBy, search } = getPaginationAndFilters(req);

    const where = generateWhereInput<Prisma.PageComponentWhereInput>(search, {
      "translations.some.name": "insensitive",
      "translations.some.content": "insensitive",
      slug: "insensitive",
    });

    const [pageComponents, count] = await Promise.all([
      prisma.pageComponent.findMany({
        skip,
        take,
        orderBy,
        where,
        include: {
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
      prisma.pageComponent.count({ where }),
    ]);

    return res.status(200).json({ data: pageComponents, count });
  } catch (error) {
    logCatchyError("fetch_pageComponents_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_pageComponents_exception",
    });
    next(error);
  }
};

export const fetchPageComponent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    const pageComponent = await prisma.pageComponent.findUnique({
      where: {
        slug,
      },
      include: {
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

    if (!pageComponent) {
      logWarn("PageComponent fetch failed: pageComponent not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "pageComponent_fetch_failed",
      });
      return sendError(req, res, 404, "pageNotFound");
    }

    return res.status(200).json({ data: pageComponent });
  } catch (error) {
    logCatchyError("fetch_pageComponent_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_pageComponent_exception",
    });
    next(error);
  }
};

export const deletePageComponent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    logInfo("PageComponent delete attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "pageComponent_delete_attempt",
    });

    const pageComponent = await prisma.pageComponent.delete({
      where: {
        slug,
      },
    });

    if (!pageComponent) {
      logWarn("PageComponent delete failed: pageComponent not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "pageComponent_delete_failed",
      });
      return sendError(req, res, 404, "pageNotFound");
    }

    logInfo("PageComponent deleted successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "pageComponent_deleted",
    });

    return res.status(200).json({
      message: getResponseMessage("pageDeleted"),
    });
  } catch (error) {
    logCatchyError("delete_pageComponent_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_delete_pageComponent_exception",
    });
    next(error);
  }
};

export const createPageComponent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { translations, footerOrder, footerId, ...rest } =
      req.body as CreatePageComponentDTO;

    logInfo("PageComponent create attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "pageComponent_create_attempt",
    });

    const translationsToCreate = Prisma.validator<
      Prisma.PageComponentTranslationCreateWithoutPageComponentInput[]
    >()(createTranslations(translations) as any);

    const pageComponent = await prisma.pageComponent.create({
      data: {
        ...rest,
        ...(footerOrder ? { footerOrder } : {}),
        ...(footerId
          ? {
              footer: {
                connect: { id: footerId },
              },
            }
          : {}),
        translations: { create: translationsToCreate },
      },
    });

    logInfo("PageComponent created successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "pageComponent_created",
    });

    return res.status(201).json({
      data: pageComponent,
    });
  } catch (error) {
    logCatchyError("Create pageComponent exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_create_pageComponent_exception",
    });
    next(error);
  }
};

export const updatePageComponent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    const { translations, footerOrder, footerId, ...rest } =
      req.body as UpdatePageComponentDTO;

    logInfo("PageComponent update attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "pageComponent_update_attempt",
    });

    const translationsToCreate = Prisma.validator<
      Prisma.PageComponentTranslationCreateWithoutPageComponentInput[]
    >()(createTranslations(translations) as any);

    const findPageComponent = await prisma.pageComponent.findUnique({
      where: {
        slug,
      },
    });

    if (!findPageComponent) {
      logWarn("PageComponent update failed: pageComponent not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "pageComponent_update_failed",
      });
      return sendError(req, res, 404, "pageNotFound");
    }

    const pageComponent = await prisma.pageComponent.update({
      where: {
        slug,
      },
      data: {
        ...rest,
        ...(footerId !== undefined
          ? footerId
            ? { footer: { connect: { id: footerId } } }
            : { footer: { disconnect: true } }
          : {}),
        ...(footerOrder ? { footerOrder } : {}),
        translations: {
          deleteMany: {},
          create: translationsToCreate,
        },
      },
    });

    logInfo("PageComponent updated successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "pageComponent_updated",
    });

    return res.json({
      data: pageComponent,
    });
  } catch (error) {
    logCatchyError("Update pageComponent exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_update_pageComponent_exception",
    });
    next(error);
  }
};
