import { prisma } from "@/config";
import {
  generateWhereInput,
  getPaginationAndFilters,
  sendError,
} from "@/utils";
import { NextFunction, Response, Request } from "express";
import {
  logAdminError as logCatchyError,
  logAdminInfo as logInfo,
  logAdminWarn as logWarn,
} from "@/utils";
import { Prisma } from "@prisma/client";

export const fetchFAQs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, orderBy, search } = getPaginationAndFilters(req);

    const where = generateWhereInput<Prisma.FAQWhereInput>(search, {
      "translations.some.question": "insensitive",
      "translations.some.answer": "insensitive",
    });

    const [FAQs, count] = await Promise.all([
      prisma.fAQ.findMany({
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

export const fetchFAQ = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const FAQ = await prisma.fAQ.findMany({
      where: {
        id,
      },
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
    });

    if (!FAQ) {
      logWarn("Faq fetch failed: faq not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "faq_fetch_failed",
      });
      return sendError(req, res, 404, "faqNotFound");
    }

    return res.status(200).json({ data: FAQ });
  } catch (error) {
    logCatchyError("fetch_faq_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_faq_exception",
    });
    next(error);
  }
};
