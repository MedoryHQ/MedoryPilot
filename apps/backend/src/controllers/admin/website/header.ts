import { prisma } from "@/config";
import {
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
    logCatchyError("fetch_header_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_header_exception",
    });
    next(error);
  }
};
