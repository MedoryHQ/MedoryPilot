import { prisma } from "@/config";
import { generateWhereInput, getPaginationAndFilters } from "@/utils";
import { NextFunction, Response, Request } from "express";
import { logAdminError as logCatchyError } from "@/utils";
import { Prisma } from "@prisma/client";

export const fetchHeaders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, orderBy, search } = getPaginationAndFilters(req);

    const where = generateWhereInput<Prisma.HeaderWhereInput>(search, {
      "translations.some.name": "insensitive",
      "translations.some.position": "insensitive",
      "translations.some.headline": "insensitive",
      "translations.some.description": "insensitive",
    });

    const [headers, count] = await Promise.all([
      prisma.header.findMany({
        skip,
        take,
        orderBy,
        where,
        include: {
          logo: true,
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
      prisma.header.count({ where }),
    ]);

    return res.status(200).json({ data: headers, count });
  } catch (error) {
    logCatchyError("fetch_headers_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_headers_exception",
    });
    next(error);
  }
};
