import { prisma } from "@/config";
import { generateWhereInput, getPaginationAndFilters } from "@/utils";
import { NextFunction, Response, Request } from "express";
import {
  logAdminError as logCatchyError,
  logAdminInfo as logInfo,
  logAdminWarn as logWarn,
} from "@/utils";
import { Prisma } from "@prisma/client";

export const fetchPageComponents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, orderBy, search } = getPaginationAndFilters(req);

    const where = generateWhereInput<Prisma.PageComponentWhereInput>(search, {
      "translations.some.name": "insensitive",
      "translations.some.content": "insensitive",
    });

    const [pageComponents, count] = await Promise.all([
      prisma.pageComponent.findMany({
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
      prisma.pageComponent.count({ where }),
    ]);

    return res.status(200).json({ data: pageComponents, count });
  } catch (error) {
    logCatchyError("fetch_pageComponents_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_pageComponents_exception",
    });
    next(error);
  }
};
