import { prisma } from "@/config";
import {
  createTranslations,
  generateWhereInput,
  getPaginationAndFilters,
  getResponseMessage,
  sendError,
} from "@/utils";
import { NextFunction, Response, Request } from "express";
import {
  logAdminError as logCatchyError,
  logAdminInfo as logInfo,
  logAdminWarn as logWarn,
} from "@/utils";
import { Prisma } from "@prisma/client";
import { CreateHeaderDTO, UpdateHeaderDTO } from "@/types/admin";

export const fetchHeaders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, orderBy, search } = getPaginationAndFilters(req);

    const where = generateWhereInput<Prisma.HeaderWhereInput>(search, {
      "translations.some.name": "insensitive",
      "translations.some.position": "insensitive",
      "translations.some.headline": "insensitive",
      "translations.some.description": "insensitive",
    });

    const [headers, count] = await Promise.all([
      prisma.header.findMany({
        skip,
        take,
        orderBy,
        where,
        include: {
          logo: true,
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
      prisma.header.count({ where }),
    ]);

    return res.status(200).json({ data: headers, count });
  } catch (error) {
    logCatchyError("fetch_headers_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_headers_exception",
    });
    next(error);
  }
};

export const fetchHeader = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const header = await prisma.header.findMany({
      where: {
        id,
      },
      include: {
        logo: true,
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

    return res.status(200).json({ data: header });
  } catch (error) {
    logCatchyError("fetch_header_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_header_exception",
    });
    next(error);
  }
};

export const deleteHeader = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    logInfo("Header delete attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "header_delete_attempt",
    });

    const header = await prisma.header.delete({
      where: {
        id,
      },
    });

    if (!header) {
      logWarn("Header delete failed: header not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "header_delete_failed",
      });
      return sendError(req, res, 404, "headerNotFound");
    }

    logInfo("Header deleted successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "header_deleted",
    });

    return res.status(200).json({
      message: getResponseMessage("headerDeleted"),
    });
  } catch (error) {
    logCatchyError("delete_header_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_delete_header_exception",
    });
    next(error);
  }
};

export const createHeader = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { translations, logo, active } = req.body as CreateHeaderDTO;

    logInfo("Header create attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "header_create_attempt",
    });

    const translationsToCreate = createTranslations(translations);
    const logoToCreate = logo
      ? {
          path: logo.path,
          name: logo.name,
          size: logo.size,
        }
      : undefined;

    const header = await prisma.header.create({
      data: {
        active: !!active,
        // @ts-expect-error translationsToCreate is not compatible with Prisma type
        translations: { create: translationsToCreate },
        logo: {
          create: logoToCreate,
        },
      },
    });

    logInfo("Header created successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "header_created",
    });

    return res.json({
      data: header,
    });
  } catch (error) {
    logCatchyError("create_headers_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_create_headers_exception",
    });
    next(error);
  }
};

export const updateHeader = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const { translations, logo, active } = req.body as UpdateHeaderDTO;

    logInfo("Header update attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "header_update_attempt",
    });

    const translationsToCreate = createTranslations(translations);
    const logoToCreate = logo
      ? {
          path: logo.path,
          name: logo.name,
          size: logo.size,
        }
      : undefined;

    const findHeader = await prisma.header.findUnique({
      where: {
        id,
      },
      include: {
        logo: true,
      },
    });

    if (!findHeader) {
      logWarn("Header update failed: header not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "header_update_failed",
      });
      return sendError(req, res, 404, "headerNotFound");
    }

    const header = await prisma.header.update({
      where: {
        id,
      },
      data: {
        translations: {
          deleteMany: {},
          // @ts-expect-error translationsToCreate is not compatible with Prisma type
          create: translationsToCreate,
        },
        logo: logoToCreate
          ? {
              delete: findHeader.logo ? {} : undefined,
              create: logoToCreate,
            }
          : findHeader.logo
          ? { delete: {} }
          : undefined,
        ...(active ? { active: true } : {}),
      },
    });

    logInfo("Header updated successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "header_updated",
    });

    return res.json({
      data: header,
    });
  } catch (error) {
    logCatchyError("update_headers_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_update_headers_exception",
    });
    next(error);
  }
};
