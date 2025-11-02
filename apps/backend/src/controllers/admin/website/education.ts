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
import { CreateEducationDTO, UpdateEducationDTO } from "@/types/admin";

export const fetchEducations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, search, orderBy } = getPaginationAndFilters(req);
    const filters = parseFilters(req);
    const { icon, dateRange, link } = filters as {
      icon?: any;
      link?: string;
      dateRange?: {
        from?: string;
        to?: string;
      };
    };

    const parsedFrom = parseDate(dateRange?.from);
    const parsedEnd = parseDate(dateRange?.to);

    let dateFilterCondition: Prisma.EducationWhereInput | undefined;

    if (parsedFrom && parsedEnd) {
      dateFilterCondition = {
        AND: [
          {
            OR: [{ endDate: { gte: parsedFrom } }, { endDate: null }],
          },
          {
            fromDate: { lte: parsedEnd },
          },
        ],
      };
    } else if (parsedFrom) {
      dateFilterCondition = {
        OR: [{ endDate: { gte: parsedFrom } }, { endDate: null }],
      };
    } else if (parsedEnd) {
      dateFilterCondition = {
        fromDate: { lte: parsedEnd },
      };
    } else {
      dateFilterCondition = undefined;
    }

    const andConditions: Prisma.EducationWhereInput[] = [];

    if (typeof icon === "boolean") {
      if (icon) andConditions.push({ icon: { isNot: null } });
      else andConditions.push({ icon: { is: null } });
    }

    if (typeof link === "boolean") {
      if (link) andConditions.push({ link: { not: null } });
      else andConditions.push({ link: null });
    }

    if (dateFilterCondition) {
      andConditions.push(dateFilterCondition);
    }

    const where = generateWhereInput<Prisma.EducationWhereInput>(
      search,
      {
        link: "insensitive",
        "translations.some.name": "insensitive",
        "translations.some.degree": "insensitive",
        "translations.some.description": "insensitive",
      },
      {
        AND: andConditions,
      }
    );

    const [educations, count] = await Promise.all([
      prisma.education.findMany({
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
      prisma.education.count({ where }),
    ]);

    return res.status(200).json({ data: educations, count });
  } catch (error) {
    logCatchyError("Fetch educations exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_educations_exception",
    });
    next(error);
  }
};

export const fetchEducation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const education = await prisma.education.findUnique({
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

    if (!education) {
      logWarn("Education fetch failed: education not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "education_fetch_failed",
      });
      return sendError(req, res, 404, "educationNotFound");
    }

    return res.status(200).json({ data: education });
  } catch (error) {
    logCatchyError("fetch_education_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_education_exception",
    });
    next(error);
  }
};

export const deleteEducation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    logInfo("Education delete attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "education_delete_attempt",
    });

    const education = await prisma.education.delete({
      where: {
        id,
      },
    });

    if (!education) {
      logWarn("Education delete failed: education not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "education_delete_failed",
      });
      return sendError(req, res, 404, "educationNotFound");
    }

    logInfo("Education deleted successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "education_deleted",
    });

    return res.status(200).json({
      message: getResponseMessage("educationDeleted"),
    });
  } catch (error) {
    logCatchyError("delete_education_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_delete_education_exception",
    });
    next(error);
  }
};

export const createEducation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { translations, icon, link, fromDate, endDate } =
      req.body as CreateEducationDTO;

    logInfo("Education create attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "education_create_attempt",
    });

    const translationsToCreate = Prisma.validator<
      Prisma.EducationTranslationCreateWithoutEducationInput[]
    >()(createTranslations(translations) as any);

    const iconToCreate = icon
      ? {
          path: icon.path,
          name: icon.name,
          size: icon.size,
        }
      : undefined;

    const education = await prisma.education.create({
      data: {
        translations: { create: translationsToCreate },
        ...(iconToCreate && { icon: { create: iconToCreate } }),
        ...(link && { link }),
        ...(endDate && { endDate }),
        fromDate,
      },
    });

    logInfo("Education created successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "education_created",
    });

    return res.status(201).json({
      data: education,
    });
  } catch (error) {
    logCatchyError("Create education exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_create_education_exception",
    });
    next(error);
  }
};

export const updateEducation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { translations, icon, link, fromDate, endDate } =
      req.body as UpdateEducationDTO;

    logInfo("Education update attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "education_update_attempt",
    });

    const translationsToCreate = Prisma.validator<
      Prisma.EducationTranslationCreateWithoutEducationInput[]
    >()(createTranslations(translations) as any);

    const iconToCreate = icon
      ? {
          path: icon.path,
          name: icon.name,
          size: icon.size,
        }
      : undefined;

    const findEducation = await prisma.education.findUnique({
      where: { id },
      include: { icon: true },
    });

    if (!findEducation) {
      logWarn("Education update failed: education not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,
        event: "education_update_failed",
      });
      return sendError(req, res, 404, "educationNotFound");
    }

    const education = await prisma.education.update({
      where: { id },
      data: {
        translations: {
          deleteMany: {},
          create: translationsToCreate,
        },
        fromDate,
        ...(endDate && { endDate }),
        ...(link && { link }),
        icon: iconToCreate
          ? {
              delete: findEducation.icon ? {} : undefined,
              create: iconToCreate,
            }
          : findEducation.icon
          ? { delete: {} }
          : undefined,
      },
      include: { translations: true, icon: true },
    });

    logInfo("Education updated successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "education_updated",
    });

    return res.json({ data: education });
  } catch (error) {
    logCatchyError("Update education exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_update_education_exception",
    });
    next(error);
  }
};
