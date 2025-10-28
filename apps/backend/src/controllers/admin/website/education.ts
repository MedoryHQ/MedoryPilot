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
