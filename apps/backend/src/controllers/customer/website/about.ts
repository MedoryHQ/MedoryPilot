import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import {
  logCustomerCatchyError as logCatchyError,
  logCustomerWarn as logWarn,
  sendError,
} from "@/utils";

export const fetchAbout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const about = await prisma.about.findFirst({
      select: {
        image: true,
        translations: {
          select: {
            description: true,
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
      event: "customer_fetch_about_exception",
    });
    next(error);
  }
};
