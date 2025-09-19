import { prisma } from "@/config";
import {
  generateWhereInput,
  getPaginationAndFilters,
  sendError,
} from "@/utils";
import { NextFunction, Response, Request } from "express";
import {
  logAdminError as logCatchyError,
  logAdminInfo as logInfo,
  logAdminWarn as logWarn,
} from "@/utils";
import { Prisma } from "@prisma/client";

export const fetchSocials = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, orderBy } = getPaginationAndFilters(req);

    const [socials, count] = await Promise.all([
      prisma.social.findMany({
        skip,
        take,
        orderBy,
        include: {
          icon: true,
        },
      }),
      prisma.social.count(),
    ]);

    return res.status(200).json({ data: socials, count });
  } catch (error) {
    logCatchyError("Fetch socials exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_socials_exception",
    });
    next(error);
  }
};

export const fetchSocial = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const social = await prisma.social.findUnique({
      where: {
        id,
      },
      include: {
        icon: true,
      },
    });

    if (!social) {
      logWarn("Social fetch failed: social not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "social_fetch_failed",
      });
      return sendError(req, res, 404, "socialNotFound");
    }

    return res.status(200).json({ data: social });
  } catch (error) {
    logCatchyError("fetch_social_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_social_exception",
    });
    next(error);
  }
};
