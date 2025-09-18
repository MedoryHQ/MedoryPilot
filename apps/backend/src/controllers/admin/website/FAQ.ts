import { prisma } from "@/config";
import {
  createTranslations,
  generateWhereInput,
  getPaginationAndFilters,
  getResponseMessage,
  sendError,
} from "@/utils";
import { NextFunction, Response, Request } from "express";
import {
  logAdminError as logCatchyError,
  logAdminInfo as logInfo,
  logAdminWarn as logWarn,
} from "@/utils";
import { Prisma } from "@prisma/client";
import { CreateFaqDTO, UpdateFaqDTO } from "@/types/admin";

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

    const FAQ = await prisma.fAQ.findUnique({
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

export const deleteFAQ = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    logInfo("FAQ delete attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "FAQ_delete_attempt",
    });

    const FAQ = await prisma.fAQ.delete({
      where: {
        id,
      },
    });

    if (!FAQ) {
      logWarn("FAQ delete failed: fAQ not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "FAQ_delete_failed",
      });
      return sendError(req, res, 404, "faqNotFound");
    }

    logInfo("FAQ deleted successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "fAQ_deleted",
    });

    return res.status(200).json({
      message: getResponseMessage("FAQDeleted"),
    });
  } catch (error) {
    logCatchyError("delete_FAQ_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_delete_FAQ_exception",
    });
    next(error);
  }
};

export const createFAQ = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { translations, order } = req.body as CreateFaqDTO;

    logInfo("FAQ create attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "FAQ_create_attempt",
    });

    const translationsToCreate = Prisma.validator<
      Prisma.FAQTranslationCreateWithoutFaqInput[]
    >()(createTranslations(translations) as any);

    const FAQ = await prisma.fAQ.create({
      data: {
        ...(order ? { order } : {}),
        translations: { create: translationsToCreate },
      },
    });

    logInfo("FAQ created successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "FAQ_created",
    });

    return res.status(201).json({
      data: FAQ,
    });
  } catch (error) {
    logCatchyError("create_FAQs_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_create_FAQs_exception",
    });
    next(error);
  }
};

export const updateFAQ = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const { translations, order } = req.body as UpdateFaqDTO;

    logInfo("FAQ update attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "FAQ_update_attempt",
    });

    const translationsToCreate = Prisma.validator<
      Prisma.FAQTranslationCreateWithoutFaqInput[]
    >()(createTranslations(translations) as any);

    const findFAQ = await prisma.fAQ.findUnique({
      where: {
        id,
      },
    });

    if (!findFAQ) {
      logWarn("FAQ update failed: FAQ not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "FAQ_update_failed",
      });
      return sendError(req, res, 404, "faqNotFound");
    }

    const FAQ = await prisma.fAQ.update({
      where: {
        id,
      },
      data: {
        ...(order ? { order } : {}),
        translations: {
          deleteMany: {},
          create: translationsToCreate,
        },
      },
    });

    logInfo("FAQ updated successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "FAQ_updated",
    });

    return res.json({
      data: FAQ,
    });
  } catch (error) {
    logCatchyError("update_FAQs_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_update_FAQs_exception",
    });
    next(error);
  }
};
