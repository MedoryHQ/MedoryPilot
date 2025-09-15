import { prisma } from "@/config";
import { generateWhereInput, getPaginationAndFilters } from "@/utils";
import { NextFunction, Response, Request } from "express";
import { logAdminError as logCatchyError } from "@/utils";
import { Prisma } from "@prisma/client";

export const fetchFAQs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, search } = getPaginationAndFilters(req);

    const where = generateWhereInput<Prisma.FAQWhereInput>(search, {
      "translations.some.question": "insensitive",
      "translations.some.answer": "insensitive",
    });

    const [FAQs, count] = await Promise.all([
      prisma.fAQ.findMany({
        skip,
        take,
        orderBy: {
          order: "asc",
        },
        where,
        select: {
          order: true,
          translations: {
            select: {
              answer: true,
              question: true,
              language: {
                select: {
                  code: true,
                },
              },
            },
          },
        },
      }),
      prisma.fAQ.count({ where }),
    ]);

    return res.status(200).json({ data: FAQs, count });
  } catch (error) {
    logCatchyError("Fetch FAQs exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_FAQs_exception",
    });
    next(error);
  }
};
