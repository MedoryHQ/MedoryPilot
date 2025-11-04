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
  parseDate,
} from "@/utils";
import { Prisma } from "@prisma/client";
import { CreateExperienceDTO, UpdateExperienceDTO } from "@/types/admin";

export const fetchExperiences = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, search, orderBy } = getPaginationAndFilters(req);
    const filters = parseFilters(req);
    const { icon, dateRange, link, location } = filters as {
      icon?: any;
      link?: string;
      location?: string;
      dateRange?: {
        from?: string;
        to?: string;
      };
    };

    const parsedFrom = parseDate(dateRange?.from);
    const parsedEnd = parseDate(dateRange?.to);

    const where = generateWhereInput<Prisma.ExperienceWhereInput>(
      search,
      {
        link: "insensitive",
        location: "insensitive",
        "translations.some.name": "insensitive",
        "translations.some.position": "insensitive",
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
            ...(typeof link === "boolean"
              ? link
                ? { link: { not: null } }
                : { link: null }
              : {}),
          },
          {
            ...(typeof location === "boolean"
              ? location
                ? { location: { not: null } }
                : { location: null }
              : {}),
          },
          {
            ...(parsedFrom ? { fromDate: { gte: parsedFrom } } : {}),
            ...(parsedEnd ? { endDate: { gte: parsedEnd } } : {}),
          },
        ],
      }
    );

    const [experiences, count] = await Promise.all([
      prisma.experience.findMany({
        skip,
        take,
        orderBy,
        where,
        include: {
          icon: true,
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
      prisma.experience.count({ where }),
    ]);

    return res.status(200).json({ data: experiences, count });
  } catch (error) {
    logCatchyError("Fetch experiences exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_experiences_exception",
    });
    next(error);
  }
};

export const fetchExperience = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const experience = await prisma.experience.findUnique({
      where: {
        id,
      },
      include: {
        icon: true,
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

    if (!experience) {
      logWarn("Experience fetch failed: experience not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "experience_fetch_failed",
      });
      return sendError(req, res, 404, "experienceNotFound");
    }

    return res.status(200).json({ data: experience });
  } catch (error) {
    logCatchyError("fetch_experience_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_experience_exception",
    });
    next(error);
  }
};

export const deleteExperience = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    logInfo("Experience delete attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "experience_delete_attempt",
    });

    const experience = await prisma.experience.delete({
      where: {
        id,
      },
    });

    if (!experience) {
      logWarn("Experience delete failed: experience not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "experience_delete_failed",
      });
      return sendError(req, res, 404, "experienceNotFound");
    }

    logInfo("Experience deleted successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "experience_deleted",
    });

    return res.status(200).json({
      message: getResponseMessage("experienceDeleted"),
    });
  } catch (error) {
    logCatchyError("delete_experience_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_delete_experience_exception",
    });
    next(error);
  }
};

export const createExperience = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { translations, icon, link, fromDate, endDate, location } =
      req.body as CreateExperienceDTO;

    logInfo("Experience create attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "experience_create_attempt",
    });

    const translationsToCreate = Prisma.validator<
      Prisma.ExperienceTranslationCreateWithoutExperienceInput[]
    >()(createTranslations(translations) as any);

    const iconToCreate = icon
      ? {
          path: icon.path,
          name: icon.name,
          size: icon.size,
        }
      : undefined;

    const experience = await prisma.experience.create({
      data: {
        translations: { create: translationsToCreate },
        icon: {
          create: iconToCreate,
        },
        ...(link && { link }),
        ...(location && { location }),
        ...(endDate && { endDate }),
        fromDate,
      },
    });

    logInfo("Experience created successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "experience_created",
    });

    return res.status(201).json({
      data: experience,
    });
  } catch (error) {
    logCatchyError("Create experience exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_create_experience_exception",
    });
    next(error);
  }
};

export const updateExperience = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { translations, icon, link, fromDate, endDate, location } =
      req.body as UpdateExperienceDTO;

    logInfo("Experience update attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "experience_update_attempt",
    });

    const translationsToCreate = Prisma.validator<
      Prisma.ExperienceTranslationCreateWithoutExperienceInput[]
    >()(createTranslations(translations) as any);

    const iconToCreate = icon
      ? {
          path: icon.path,
          name: icon.name,
          size: icon.size,
        }
      : undefined;

    const findExperience = await prisma.experience.findUnique({
      where: { id },
      include: { icon: true },
    });

    if (!findExperience) {
      logWarn("Experience update failed: experience not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,
        event: "experience_update_failed",
      });
      return sendError(req, res, 404, "experienceNotFound");
    }

    const experience = await prisma.experience.update({
      where: { id },
      data: {
        translations: {
          deleteMany: {},
          create: translationsToCreate,
        },
        fromDate,
        ...(endDate && { endDate }),
        ...(link && { link }),
        ...(location && { location }),
        icon: iconToCreate
          ? {
              delete: findExperience.icon ? {} : undefined,
              create: iconToCreate,
            }
          : findExperience.icon
          ? { delete: {} }
          : undefined,
      },
      include: { translations: true, icon: true },
    });

    logInfo("Experience updated successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "experience_updated",
    });

    return res.json({ data: experience });
  } catch (error) {
    logCatchyError("Update experience exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_update_experience_exception",
    });
    next(error);
  }
};
