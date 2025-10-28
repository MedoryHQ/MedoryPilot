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
  parseFilters,
} from "@/utils";
import { Prisma } from "@prisma/client";
import { CreateVideoDTO, UpdateVideoDTO } from "@/types/admin";

export const fetchVideos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, search, orderBy } = getPaginationAndFilters(req);
    const filters = parseFilters(req);
    const { thumbnail } = filters;

    const where = generateWhereInput<Prisma.VideoWhereInput>(
      search,
      {
        "translations.some.title": "insensitive",
      },
      {
        AND: [
          {
            ...(typeof thumbnail === "boolean"
              ? thumbnail
                ? { thumbnail: { isNot: null } }
                : { thumbnail: { is: null } }
              : {}),
          },
        ],
      }
    );

    const [videos, count] = await Promise.all([
      prisma.video.findMany({
        skip,
        take,
        orderBy,
        where,
        include: {
          thumbnail: true,
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
      prisma.video.count({ where }),
    ]);

    return res.status(200).json({ data: videos, count });
  } catch (error) {
    logCatchyError("Fetch videos exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_videos_exception",
    });
    next(error);
  }
};
