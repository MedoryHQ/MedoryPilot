import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import {
  createTranslations,
  getResponseMessage,
  sendError,
  logAdminError as logCatchyError,
  logAdminInfo as logInfo,
  logAdminWarn as logWarn,
  generateWhereInput,
  getPaginationAndFilters,
} from "@/utils";
import { Prisma } from "@prisma/client";
import { CreateCategoryDTO, UpdateCategoryDTO } from "@/types/admin";

export const fetchCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, orderBy, search } = getPaginationAndFilters(req);

    const where = generateWhereInput<Prisma.CategoryWhereInput>(search, {
      "translations.some.name": "insensitive",
    });

    const [categories, count] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take,
        orderBy,
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
      prisma.category.count({ where }),
    ]);

    return res.status(200).json({ data: categories, count });
  } catch (error) {
    logCatchyError("fetch_category_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_category_exception",
    });
    next(error);
  }
};

export const fetchCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
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

    if (!category) {
      logWarn("Category fetch failed: category not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "category_fetch_failed",
      });
      return sendError(req, res, 404, "categoryNotFound");
    }

    return res.status(200).json({ data: category });
  } catch (error) {
    logCatchyError("fetch_category_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_category_exception",
    });
    next(error);
  }
};
