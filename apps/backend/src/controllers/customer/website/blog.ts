import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import {
  generateWhereInput,
  getPaginationAndFilters,
  sendError,
  logCustomerCatchyError as logCatchyError,
  logCustomerWarn as logWarn,
  parseQueryParams,
  parseBooleanQuery,
} from "@/utils";
import { Prisma } from "@prisma/client";

export const fetchBlogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, orderBy, search } = getPaginationAndFilters(req);

    const filters = parseQueryParams(req, ["categories"]);

    const { categories } = filters;

    const { showIsLanding } = req.query as { showIsLanding: "true" | "false" };
    const isLanding = parseBooleanQuery(showIsLanding);

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
          typeof isLanding === "boolean"
            ? {
                showInLanding: isLanding,
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
        select: {
          background: true,
          landingOrder: true,
          metaDescription: true,
          metaImage: true,
          metaKeywords: true,
          metaTitle: true,
          slug: true,
          showInLanding: true,
          averageStar: true,
          categories: {
            select: {
              translations: {
                select: {
                  name: true,
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
            select: {
              title: true,
              content: true,
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
      select: {
        background: true,
        landingOrder: true,
        metaDescription: true,
        metaImage: true,
        metaKeywords: true,
        metaTitle: true,
        slug: true,
        averageStar: true,
        showInLanding: true,
        categories: {
          select: {
            translations: {
              select: {
                name: true,
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
          select: {
            title: true,
            content: true,
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
