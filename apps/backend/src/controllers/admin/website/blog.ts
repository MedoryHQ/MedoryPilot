import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import {
  createTranslations,
  getPaginationAndFilters,
  getResponseMessage,
  sendError,
  logAdminError as logCatchyError,
  logAdminInfo as logInfo,
  logAdminWarn as logWarn,
  parseBooleanQuery,
  generateWhereInput,
  parseFilters,
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
    const filters = parseFilters(req);

    const {
      categories,
      showInLanding,
      starredUsers,
      withMeta,
      background,
      stars,
    } = filters as {
      categories?: string[];
      starredUsers?: string[];
      showInLanding?: boolean | string;
      withMeta?: boolean | string;
      background?: boolean | string;
      stars?: {
        min?: number;
        max?: number;
      };
    };

    const isLanding = parseBooleanQuery(showInLanding);
    const meta = parseBooleanQuery(withMeta);
    const hasBackground = parseBooleanQuery(background);
    const applyMinStars =
      stars?.min && Number(stars.min) > 0 && Number(stars?.min) <= 5;

    const applyMaxStars =
      stars?.max && Number(stars.max) > 0 && Number(stars.max) <= 5;

    const where = generateWhereInput<Prisma.BlogWhereInput>(
      search,
      {
        "translations.some.title": "insensitive",
        "translations.some.content": "insensitive",
        slug: "insensitive",
      },
      {
        AND: [
          categories
            ? {
                categories: {
                  some: {
                    id: { in: categories },
                  },
                },
              }
            : {},
          starredUsers
            ? {
                stars: {
                  some: {
                    userId: { in: starredUsers },
                  },
                },
              }
            : {},
          typeof isLanding === "boolean"
            ? {
                showInLanding: isLanding,
              }
            : {},
          typeof meta === "boolean"
            ? meta
              ? {
                  metaImage: {
                    isNot: null,
                  },
                  metaDescription: {
                    not: null,
                  },
                  metaKeywords: {
                    not: null,
                  },
                  metaTitle: {
                    not: null,
                  },
                }
              : {
                  metaImage: null,
                  metaDescription: null,
                  metaKeywords: null,
                }
            : {},
          typeof hasBackground === "boolean"
            ? background
              ? { background: { isNot: null } }
              : { background: { is: null } }
            : {},
          applyMinStars
            ? {
                averageStar: {
                  gte: Number(stars.min),
                },
              }
            : {},
          applyMaxStars
            ? {
                averageStar: {
                  lte: Number(stars.max),
                },
              }
            : {},
        ],
      }
    );

    const [blogs, count] = await Promise.all([
      prisma.blog.findMany({
        skip,
        take,
        orderBy,
        where,
        include: {
          background: true,
          metaImage: true,
          stars: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  fullName: true,
                },
              },
            },
          },
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

    return res.status(200).json({ data: blogs, count });
  } catch (error) {
    logCatchyError("fetch_blogs_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_blogs_exception",
    });
    next(error);
  }
};

export const fetchBlogsFilterOptions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { languageCode } = req.query as { languageCode: "en" | "ka" };
    const { skip, take, search } = getPaginationAndFilters(req);

    const where = generateWhereInput<Prisma.UserWhereInput>(
      search,
      {
        email: "insensitive",
        firstName: "insensitive",
        lastName: "insensitive",
        fullName: "insensitive",
        personalId: "insensitive",
        phoneNumber: "insensitive",
      }
      // {
      //   starredBlogs: {
      //     some: {},
      //   },
      // }
    );

    const [categories, users] = await prisma.$transaction([
      prisma.category.findMany({
        select: {
          id: true,
          translations: {
            where: {
              language: {
                code: languageCode,
              },
            },
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.user.findMany({
        skip,
        take,
        where,
        select: {
          id: true,
          fullName: true,
        },
      }),
    ]);

    const categoryOptions = categories.map((category) => ({
      label: category.translations[0]?.name,
      value: category.id,
    }));
    const userOptions = users.map((user) => ({
      label: user.fullName,
      value: user.id,
    }));

    return res.status(200).json({
      data: {
        categories: categoryOptions,
        users: userOptions,
      },
    });
  } catch (error) {
    logCatchyError("fetch_blogs_filter_options_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_blogs_filter_options_exception",
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
        metaImage: true,
        stars: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                fullName: true,
              },
            },
          },
        },
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
    const { translations, background, categories, metaImage, ...rest } =
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

    const metaImageToCreate = metaImage
      ? {
          path: metaImage.path,
          name: metaImage.name,
          size: metaImage.size,
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
        ...(metaImageToCreate
          ? { metaImage: { create: metaImageToCreate } }
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

    const { translations, background, categories, metaImage, ...rest } =
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

    const metaImageToCreate = metaImage
      ? {
          path: metaImage.path,
          name: metaImage.name,
          size: metaImage.size,
        }
      : undefined;

    const findBlog = await prisma.blog.findUnique({
      where: {
        slug,
      },
      include: {
        background: true,
        metaImage: true,
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

    const hasBackgroundProp = Object.prototype.hasOwnProperty.call(
      req.body,
      "background"
    );
    const hasMetaImageProp = Object.prototype.hasOwnProperty.call(
      req.body,
      "metaImage"
    );

    const backgroundNested =
      hasBackgroundProp && backgroundToCreate
        ? {
            upsert: {
              update: backgroundToCreate,
              create: backgroundToCreate,
            },
          }
        : hasBackgroundProp && background === null
        ? { delete: true }
        : undefined;

    const metaImageNested =
      hasMetaImageProp && metaImageToCreate
        ? {
            upsert: {
              update: metaImageToCreate,
              create: metaImageToCreate,
            },
          }
        : hasMetaImageProp && metaImage === null
        ? { delete: true }
        : undefined;

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
        ...(backgroundNested ? { background: backgroundNested } : {}),
        ...(metaImageNested ? { metaImage: metaImageNested } : {}),
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
