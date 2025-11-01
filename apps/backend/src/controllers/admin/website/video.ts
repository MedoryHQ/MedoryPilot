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
        link: "insensitive",
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

export const fetchVideo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const video = await prisma.video.findUnique({
      where: {
        id,
      },
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
    });

    if (!video) {
      logWarn("Video fetch failed: video not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "video_fetch_failed",
      });
      return sendError(req, res, 404, "videoNotFound");
    }

    return res.status(200).json({ data: video });
  } catch (error) {
    logCatchyError("fetch_video_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_video_exception",
    });
    next(error);
  }
};

export const deleteVideo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    logInfo("Video delete attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "video_delete_attempt",
    });

    const video = await prisma.video.delete({
      where: {
        id,
      },
    });

    if (!video) {
      logWarn("Video delete failed: video not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "video_delete_failed",
      });
      return sendError(req, res, 404, "videoNotFound");
    }

    logInfo("Video deleted successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "video_deleted",
    });

    return res.status(200).json({
      message: getResponseMessage("videoDeleted"),
    });
  } catch (error) {
    logCatchyError("delete_video_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_delete_video_exception",
    });
    next(error);
  }
};

export const createVideo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { translations, thumbnail, date, link } = req.body as CreateVideoDTO;

    logInfo("Video create attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "video_create_attempt",
    });

    const translationsToCreate = Prisma.validator<
      Prisma.VideoTranslationCreateWithoutVideoInput[]
    >()(createTranslations(translations) as any);

    const thumbnailToCreate = thumbnail
      ? {
          path: thumbnail.path,
          name: thumbnail.name,
          size: thumbnail.size,
        }
      : undefined;

    const video = await prisma.video.create({
      data: {
        translations: { create: translationsToCreate },
        thumbnail: {
          create: thumbnailToCreate,
        },
        link,
        ...(date && { date }),
      },
    });

    logInfo("Video created successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "video_created",
    });

    return res.status(201).json({
      data: video,
    });
  } catch (error) {
    logCatchyError("Create video exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_create_video_exception",
    });
    next(error);
  }
};

export const updateVideo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { translations, thumbnail, link, date } = req.body as UpdateVideoDTO;

    logInfo("Video update attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "video_update_attempt",
    });

    const translationsToCreate = Prisma.validator<
      Prisma.VideoTranslationCreateWithoutVideoInput[]
    >()(createTranslations(translations) as any);

    const thumbnailToCreate = thumbnail
      ? {
          path: thumbnail.path,
          name: thumbnail.name,
          size: thumbnail.size,
        }
      : undefined;

    const findVideo = await prisma.video.findUnique({
      where: { id },
      include: { thumbnail: true },
    });

    if (!findVideo) {
      logWarn("Video update failed: video not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,
        event: "video_update_failed",
      });
      return sendError(req, res, 404, "videoNotFound");
    }

    const video = await prisma.video.update({
      where: { id },
      data: {
        translations: {
          deleteMany: {},
          create: translationsToCreate,
        },
        link,
        ...(date && { date }),
        thumbnail: thumbnailToCreate
          ? {
              delete: findVideo.thumbnail ? {} : undefined,
              create: thumbnailToCreate,
            }
          : findVideo.thumbnail
          ? { delete: {} }
          : undefined,
      },
      include: { translations: true, thumbnail: true },
    });

    logInfo("Video updated successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "video_updated",
    });

    return res.json({ data: video });
  } catch (error) {
    logCatchyError("Update video exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_update_video_exception",
    });
    next(error);
  }
};
