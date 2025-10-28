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
import { CreateEducationDTO, UpdateEducationDTO } from "@/types/admin";

export const fetchEducations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, search, orderBy } = getPaginationAndFilters(req);
    const filters = parseFilters(req);
    const { icon, fromDate, endDate, link } = filters;

    const parseDate = (v: any): Date | null => {
      if (v === undefined || v === null || v === "") return null;
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    };

    const parsedFrom = parseDate(fromDate);
    const parsedEnd = parseDate(endDate);

    const where = generateWhereInput<Prisma.EducationWhereInput>(
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
            ...(typeof link === "boolean"
              ? link
                ? { link: { not: null } }
                : { link: null }
              : {}),
          },
          {
            ...(parsedFrom ? { fromDate: { gte: parsedFrom } } : {}),
            ...(parsedEnd ? { endDate: { gte: parsedEnd } } : {}),
          },
        ],
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
        icon: {
          create: iconToCreate,
        },
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

    let newIconFile: { id: string } | null = null;

    if (iconToCreate) {
      newIconFile = await prisma.file.create({
        data: { ...iconToCreate },
        select: { id: true },
      });
    }

    const updateData: any = {
      translations: {
        deleteMany: {},
        create: translationsToCreate,
      },
      fromDate,
      ...(link && { link }),
      ...(endDate && { endDate }),
    };

    if (newIconFile) {
      updateData.iconId = newIconFile.id;
    } else if (
      Object.prototype.hasOwnProperty.call(req.body, "icon") &&
      icon === null
    ) {
      updateData.iconId = null;
    }

    const education = await prisma.education.update({
      where: { id },
      data: updateData,
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
