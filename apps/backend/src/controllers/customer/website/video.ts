import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import {
  logCustomerError as logCatchyError,
  logCustomerWarn as logWarn,
  sendError,
} from "@/utils";

export const fetchVideos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [videos, count] = await Promise.all([
      prisma.video.findMany({
        include: {
          thumbnail: true,
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
      }),
      prisma.video.count(),
    ]);

    return res.status(200).json({ data: videos, count });
  } catch (error) {
    logCatchyError("Fetch videos exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "customer_fetch_videos_exception",
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
      event: "customer_fetch_video_exception",
    });
    next(error);
  }
};
