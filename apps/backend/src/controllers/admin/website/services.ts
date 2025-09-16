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

export const fetchServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, search, orderBy } = getPaginationAndFilters(req);

    const where = generateWhereInput<Prisma.ServiceWhereInput>(search, {
      "translations.some.title": "insensitive",
      "translations.some.description": "insensitive",
    });

    const [services, count] = await Promise.all([
      prisma.service.findMany({
        skip,
        take,
        orderBy,
        where,
        include: {
          icon: true,
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
      prisma.service.count({ where }),
    ]);

    return res.status(200).json({ data: services, count });
  } catch (error) {
    logCatchyError("Fetch services exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_services_exception",
    });
    next(error);
  }
};

export const fetchService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: {
        id,
      },
      include: {
        icon: true,
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

    if (!service) {
      logWarn("Service fetch failed: service not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "service_fetch_failed",
      });
      return sendError(req, res, 404, "serviceNotFound");
    }

    return res.status(200).json({ data: service });
  } catch (error) {
    logCatchyError("fetch_service_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_service_exception",
    });
    next(error);
  }
};

export const deleteService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    logInfo("Service delete attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "service_delete_attempt",
    });

    const service = await prisma.service.delete({
      where: {
        id,
      },
    });

    if (!service) {
      logWarn("Service delete failed: service not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "service_delete_failed",
      });
      return sendError(req, res, 404, "serviceNotFound");
    }

    logInfo("Service deleted successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "service_deleted",
    });

    return res.status(200).json({
      message: getResponseMessage("serviceDeleted"),
    });
  } catch (error) {
    logCatchyError("delete_service_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_delete_service_exception",
    });
    next(error);
  }
};
