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
          _count: {
            select: {
              blogs: true,
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

export const fetchCategoriesList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, orderBy, search } = getPaginationAndFilters(req);
    const where = generateWhereInput<Prisma.CategoryWhereInput>(search, {
      "translations.some.name": "insensitive",
    });
    const [categories] = await Promise.all([
      prisma.category.findMany({
        skip,
        take,
        orderBy,
        where,
        select: {
          id: true,
          translations: {
            select: {
              language: {
                select: {
                  code: true,
                },
              },
              name: true,
            },
          },
        },
      }),
      prisma.category.count({ where }),
    ]);

    const categoriesOptions = categories.map((category) => ({
      label: category?.translations[0]?.name,
      value: category.id,
    }));

    return res.status(200).json({ data: categoriesOptions });
  } catch (error) {
    logCatchyError("Fetch categories_list_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_categories_list_exception",
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

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    logInfo("Category delete attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "category_delete_attempt",
    });

    const category = await prisma.category.delete({
      where: {
        id,
      },
    });

    if (!category) {
      logWarn("Category delete failed: category not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "category_delete_failed",
      });
      return sendError(req, res, 404, "categoryNotFound");
    }

    logInfo("Category deleted successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "category_deleted",
    });

    return res.status(200).json({
      message: getResponseMessage("categoryDeleted"),
    });
  } catch (error) {
    logCatchyError("delete_category_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_delete_category_exception",
    });
    next(error);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { translations } = req.body as CreateCategoryDTO;

    logInfo("Category create attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "category_create_attempt",
    });

    const translationsToCreate = Prisma.validator<
      Prisma.CategoryTranslationCreateWithoutCategoryInput[]
    >()(createTranslations(translations) as any);

    const category = await prisma.category.create({
      data: {
        translations: { create: translationsToCreate },
      },
    });

    logInfo("Category created successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "category_created",
    });

    return res.status(201).json({
      data: category,
    });
  } catch (error) {
    logCatchyError("Create category exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_create_category_exception",
    });
    next(error);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const { translations } = req.body as UpdateCategoryDTO;

    logInfo("Category update attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "category_update_attempt",
    });

    const translationsToCreate = Prisma.validator<
      Prisma.CategoryTranslationCreateWithoutCategoryInput[]
    >()(createTranslations(translations) as any);
    const findCategory = await prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!findCategory) {
      logWarn("Category update failed: category not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "category_update_failed",
      });
      return sendError(req, res, 404, "categoryNotFound");
    }

    const category = await prisma.category.update({
      where: {
        id,
      },
      data: {
        translations: {
          deleteMany: {},
          create: translationsToCreate,
        },
      },
    });

    logInfo("Category updated successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "category_updated",
    });

    return res.json({
      data: category,
    });
  } catch (error) {
    logCatchyError("Update category exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_update_category_exception",
    });
    next(error);
  }
};
