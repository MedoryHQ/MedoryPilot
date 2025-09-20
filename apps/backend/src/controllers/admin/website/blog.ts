import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import {
  createTranslations,
  generateWhereInput,
  getPaginationAndFilters,
  getResponseMessage,
  sendError,
  logAdminError as logCatchyError,
  logAdminInfo as logInfo,
  logAdminWarn as logWarn,
} from "@/utils";
import { Prisma } from "@prisma/client";
import { CreateBlogDTO, UpdateBlogDTO } from "@/types/admin";

export const fetchBlogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, orderBy, search } = getPaginationAndFilters(req);

    const where = generateWhereInput<Prisma.BlogWhereInput>(search, {
      "translations.some.title": "insensitive",
      "translations.some.content": "insensitive",
      slug: "insensitive",
    });

    const [bloges, count] = await Promise.all([
      prisma.blog.findMany({
        skip,
        take,
        orderBy,
        where,
        include: {
          background: true,
          categories: {
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
          },
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
      prisma.blog.count({ where }),
    ]);

    return res.status(200).json({ data: bloges, count });
  } catch (error) {
    logCatchyError("fetch_bloges_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_bloges_exception",
    });
    next(error);
  }
};

export const fetchBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    const blog = await prisma.blog.findUnique({
      where: {
        slug,
      },
      include: {
        background: true,
        categories: {
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
        },
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

    if (!blog) {
      logWarn("Blog fetch failed: blog not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "blog_fetch_failed",
      });
      return sendError(req, res, 404, "blogNotFound");
    }

    return res.status(200).json({ data: blog });
  } catch (error) {
    logCatchyError("fetch_blog_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_blog_exception",
    });
    next(error);
  }
};

export const deleteBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    logInfo("Blog delete attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "blog_delete_attempt",
    });

    const blog = await prisma.blog.delete({
      where: {
        slug,
      },
    });

    if (!blog) {
      logWarn("Blog delete failed: blog not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "blog_delete_failed",
      });
      return sendError(req, res, 404, "blogNotFound");
    }

    logInfo("Blog deleted successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "blog_deleted",
    });

    return res.status(200).json({
      message: getResponseMessage("blogDeleted"),
    });
  } catch (error) {
    logCatchyError("delete_blog_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_delete_blog_exception",
    });
    next(error);
  }
};

export const createBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { translations, background, categories, ...rest } =
      req.body as CreateBlogDTO;

    logInfo("Blog create attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "blog_create_attempt",
    });

    const translationsToCreate = Prisma.validator<
      Prisma.BlogTranslationCreateWithoutBlogInput[]
    >()(createTranslations(translations) as any);

    const backgroundToCreate = background
      ? {
          path: background.path,
          name: background.name,
          size: background.size,
        }
      : undefined;

    const blog = await prisma.blog.create({
      data: {
        ...rest,
        categories: {
          connect: categories.map((id) => ({
            id,
          })),
        },
        translations: { create: translationsToCreate },
        ...(backgroundToCreate
          ? { background: { create: backgroundToCreate } }
          : {}),
      },
    });

    logInfo("Blog created successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "blog_created",
    });

    return res.status(201).json({
      data: blog,
    });
  } catch (error) {
    logCatchyError("Create blog exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_create_blog_exception",
    });
    next(error);
  }
};

export const updateBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    const { translations, background, categories, ...rest } =
      req.body as UpdateBlogDTO;

    logInfo("Blog update attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "blog_update_attempt",
    });

    const translationsToCreate = Prisma.validator<
      Prisma.BlogTranslationCreateWithoutBlogInput[]
    >()(createTranslations(translations) as any);
    const backgroundToCreate = background
      ? {
          path: background.path,
          name: background.name,
          size: background.size,
        }
      : undefined;

    const findBlog = await prisma.blog.findUnique({
      where: {
        slug,
      },
      include: {
        background: true,
      },
    });

    if (!findBlog) {
      logWarn("Blog update failed: blog not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "blog_update_failed",
      });
      return sendError(req, res, 404, "blogNotFound");
    }

    const blog = await prisma.blog.update({
      where: {
        slug,
      },
      data: {
        ...rest,
        categories: {
          set: categories.map((id) => ({
            id,
          })),
        },
        translations: {
          deleteMany: {},
          create: translationsToCreate,
        },
        background: backgroundToCreate
          ? {
              delete: findBlog.background ? {} : undefined,
              create: backgroundToCreate,
            }
          : findBlog.background
          ? { delete: {} }
          : undefined,
      },
    });

    logInfo("Blog updated successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "blog_updated",
    });

    return res.json({
      data: blog,
    });
  } catch (error) {
    logCatchyError("Update blog exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_update_blog_exception",
    });
    next(error);
  }
};
