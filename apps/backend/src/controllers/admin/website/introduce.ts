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

export const fetchIntroduces = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, search, orderBy } = getPaginationAndFilters(req);

    const where = generateWhereInput<Prisma.IntroduceWhereInput>(search, {
      "translations.some.headline": "insensitive",
      "translations.some.description": "insensitive",
    });

    const [introduces, count] = await Promise.all([
      prisma.introduce.findMany({
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
      prisma.introduce.count({ where }),
    ]);

    return res.status(200).json({ data: introduces, count });
  } catch (error) {
    logCatchyError("Fetch introduces exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_introduces_exception",
    });
    next(error);
  }
};

export const fetchIntroduce = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const introduce = await prisma.introduce.findMany({
      where: {
        id,
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

    if (!introduce) {
      logWarn("Introduce fetch failed: introduce not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "introduce_fetch_failed",
      });
      return sendError(req, res, 404, "introduceNotFound");
    }

    return res.status(200).json({ data: introduce });
  } catch (error) {
    logCatchyError("fetch_introduce_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_introduce_exception",
    });
    next(error);
  }
};

export const deleteIntroduce = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    logInfo("Introduce delete attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "introduce_delete_attempt",
    });

    const introduce = await prisma.introduce.delete({
      where: {
        id,
      },
    });

    if (!introduce) {
      logWarn("Introduce delete failed: introduce not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "introduce_delete_failed",
      });
      return sendError(req, res, 404, "introduceNotFound");
    }

    logInfo("Introduce deleted successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "introduce_deleted",
    });

    return res.status(200).json({
      message: getResponseMessage("introduceDeleted"),
    });
  } catch (error) {
    logCatchyError("delete_introduce_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_delete_introduce_exception",
    });
    next(error);
  }
};
