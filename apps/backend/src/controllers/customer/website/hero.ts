import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import {
  logCustomerCatchyError as logCatchyError,
  logCustomerWarn as logWarn,
  sendError,
} from "@/utils";

export const fetchHero = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hero = await prisma.hero.findFirst({
      where: {
        active: true,
      },
      select: {
        logo: true,
        visits: true,
        experience: true,
        translations: {
          select: {
            description: true,
            name: true,
            position: true,
            headline: true,
            language: {
              select: {
                code: true,
              },
            },
          },
        },
      },
    });
    if (!hero) {
      logWarn("Hero fetch failed: hero not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "hero_fetch_failed",
      });
      return sendError(req, res, 404, "heroNotFound");
    }
    const tariff = await prisma.tariff.findFirst({
      where: {
        isCurrent: true,
      },
    });

    return res.status(200).json({ data: hero, tariff });
  } catch (error) {
    logCatchyError("fetch_hero_exception", error, {
      ip: (req as any).hashedIp,
      event: "customer_fetch_hero_exception",
    });
    next(error);
  }
};
