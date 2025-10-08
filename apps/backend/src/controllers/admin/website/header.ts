import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import {
  createTranslations,
  getResponseMessage,
  sendError,
  logAdminError as logCatchyError,
  logAdminInfo as logInfo,
  logAdminWarn as logWarn,
  generateWhereInput,
  getPaginationAndFilters,
  parseQueryParams,
  parseFilters,
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
    const filters = parseFilters(req);
    const { active, logo } = filters;

    const where = generateWhereInput<Prisma.HeaderWhereInput>(
      search,
      {
        "translations.some.name": "insensitive",
        "translations.some.position": "insensitive",
        "translations.some.headline": "insensitive",
        "translations.some.description": "insensitive",
      },
      {
        AND: [
          {
            ...(typeof active === "boolean"
              ? active
                ? { active: true }
                : { active: false }
              : {}),
          },
          {
            ...(typeof logo === "boolean"
              ? logo
                ? { logo: { isNot: null } }
                : { logo: { is: null } }
              : {}),
          },
        ],
      }
    );

    const [headers, count] = await Promise.all([
      prisma.header.findMany({
        where,
        skip,
        take,
        orderBy,
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
    logCatchyError("fetch_header_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_header_exception",
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

    const header = await prisma.header.findUnique({
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

    if (!header) {
      logWarn("Header fetch failed: header not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "header_fetch_failed",
      });
      return sendError(req, res, 404, "headerNotFound");
    }

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

    if (active) {
      const activeHeader = await prisma.header.count({
        where: { active: true },
      });
      if (activeHeader) {
        return sendError(req, res, 400, "onlyOneActiveHeaderAllowed");
      }
    }

    const translationsToCreate = Prisma.validator<
      Prisma.HeaderTranslationCreateWithoutHeaderInput[]
    >()(createTranslations(translations) as any);

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

    return res.status(201).json({
      data: header,
    });
  } catch (error) {
    logCatchyError("Create header exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_create_header_exception",
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

    if (active) {
      const activeHeader = await prisma.header.count({
        where: { active: true },
      });
      if (activeHeader) {
        return sendError(req, res, 400, "onlyOneActiveHeaderAllowed");
      }
    }

    const translationsToCreate = Prisma.validator<
      Prisma.HeaderTranslationCreateWithoutHeaderInput[]
    >()(createTranslations(translations) as any);
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
        ...(typeof active === "boolean" ? { active } : {}),
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
    logCatchyError("Update header exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_update_header_exception",
    });
    next(error);
  }
};
