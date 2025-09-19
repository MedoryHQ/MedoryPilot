import { prisma } from "@/config";
import {
  generateWhereInput,
  getPaginationAndFilters,
  logCustomerCatchyError as logCatchyError,
  logCustomerWarn as logWarn,
} from "@/utils";
import { NextFunction, Response, Request } from "express";
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
        select: {
          footerOrder: true,
          metaDescription: true,
          metaImage: true,
          metaKeywords: true,
          metaTitle: true,
          slug: true,
          translations: {
            select: {
              content: true,
              name: true,
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
