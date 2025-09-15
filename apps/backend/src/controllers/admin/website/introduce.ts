import { prisma } from "@/config";
import { generateWhereInput, getPaginationAndFilters } from "@/utils";
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
