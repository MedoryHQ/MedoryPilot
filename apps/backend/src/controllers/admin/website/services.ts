import { prisma } from "@/config";
import { generateWhereInput, getPaginationAndFilters } from "@/utils";
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
