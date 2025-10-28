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
    const { icon, fromDate, endDate, link, location } = filters;

    const parsedFrom = parseDate(fromDate);
    const parsedEnd = parseDate(endDate);

    const where = generateWhereInput<Prisma.ExperienceWhereInput>(
      search,
      {
        link: "insensitive",
        location: "insensitive",
        "translations.some.title": "insensitive",
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
