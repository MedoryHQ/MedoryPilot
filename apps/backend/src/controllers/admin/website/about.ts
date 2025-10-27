import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import {
  createTranslations,
  getResponseMessage,
  sendError,
  logAdminError as logCatchyError,
  logAdminInfo as logInfo,
  logAdminWarn as logWarn,
} from "@/utils";
import { CreateAboutDTO, UpdateAboutDTO } from "@/types/admin";
import { Prisma } from "@prisma/client";

export const fetchAbout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const about = await prisma.about.findFirst({
      include: {
        image: true,
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

    if (!about) {
      logWarn("About fetch failed: about not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "about_fetch_failed",
      });
      return sendError(req, res, 404, "aboutNotFound");
    }

    return res.status(200).json({ data: about });
  } catch (error) {
    logCatchyError("fetch_about_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_about_exception",
    });
    next(error);
  }
};
