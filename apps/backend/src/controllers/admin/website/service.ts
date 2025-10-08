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
  parseFilters,
} from "@/utils";
import { Prisma } from "@prisma/client";
import { CreateServiceDTO, UpdateServiceDTO } from "@/types/admin";

export const fetchServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, search, orderBy } = getPaginationAndFilters(req);
    const filters = parseFilters(req);
    const { icon, background } = filters;

    const where = generateWhereInput<Prisma.ServiceWhereInput>(
      search,
      {
        "translations.some.title": "insensitive",
        "translations.some.description": "insensitive",
      },
      {
        AND: [
          {
            ...(typeof icon === "boolean"
              ? icon
                ? { icon: { isNot: null } }
                : { icon: { is: null } }
              : {}),
          },
          {
            ...(typeof background === "boolean"
              ? background
                ? { background: { isNot: null } }
                : { background: { is: null } }
              : {}),
          },
        ],
      }
    );

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
          _count: {
            select: { visits: true },
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

export const createService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { translations, background, icon } = req.body as CreateServiceDTO;

    logInfo("Service create attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "service_create_attempt",
    });

    const translationsToCreate = Prisma.validator<
      Prisma.ServiceTranslationCreateWithoutServiceInput[]
    >()(createTranslations(translations) as any);

    const iconToCreate = icon
      ? {
          path: icon.path,
          name: icon.name,
          size: icon.size,
        }
      : undefined;

    const backgroundToCreate = background
      ? {
          path: background.path,
          name: background.name,
          size: background.size,
        }
      : undefined;

    const service = await prisma.service.create({
      data: {
        translations: { create: translationsToCreate },
        icon: {
          create: iconToCreate,
        },
        background: {
          create: backgroundToCreate,
        },
      },
    });

    logInfo("Service created successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "service_created",
    });

    return res.status(201).json({
      data: service,
    });
  } catch (error) {
    logCatchyError("Create service exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_create_service_exception",
    });
    next(error);
  }
};

export const updateService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const { translations, background, icon } = req.body as UpdateServiceDTO;

    logInfo("Service update attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "service_update_attempt",
    });

    const translationsToCreate = Prisma.validator<
      Prisma.ServiceTranslationCreateWithoutServiceInput[]
    >()(createTranslations(translations) as any);

    const iconToCreate = icon
      ? {
          path: icon.path,
          name: icon.name,
          size: icon.size,
        }
      : undefined;

    const backgroundToCreate = background
      ? {
          path: background.path,
          name: background.name,
          size: background.size,
        }
      : undefined;

    const findService = await prisma.service.findUnique({
      where: {
        id,
      },
      include: {
        icon: true,
        background: true,
      },
    });

    if (!findService) {
      logWarn("Service update failed: service not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "service_update_failed",
      });
      return sendError(req, res, 404, "serviceNotFound");
    }

    const service = await prisma.service.update({
      where: {
        id,
      },
      data: {
        translations: {
          deleteMany: {},
          create: translationsToCreate,
        },
        icon: iconToCreate
          ? {
              delete: findService.icon ? {} : undefined,
              create: iconToCreate,
            }
          : findService.icon
          ? { delete: {} }
          : undefined,
        background: backgroundToCreate
          ? {
              delete: findService.background ? {} : undefined,
              create: backgroundToCreate,
            }
          : findService.background
          ? { delete: {} }
          : undefined,
      },
    });

    logInfo("Service updated successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "service_updated",
    });

    return res.json({
      data: service,
    });
  } catch (error) {
    logCatchyError("Update service exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_update_service_exception",
    });
    next(error);
  }
};
