import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import {
  logCustomerCatchyError as logCatchyError,
  logCustomerWarn as logWarn,
  sendError,
} from "@/utils";

export const fetchHeader = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const header = await prisma.header.findFirst({
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
    if (!header) {
      logWarn("Header fetch failed: header not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "header_fetch_failed",
      });
      return sendError(req, res, 404, "headerNotFound");
    }
    const tariff = await prisma.tariff.findFirst({
      where: {
        isCurrent: true,
      },
    });

    return res.status(200).json({ data: header, tariff });
  } catch (error) {
    logCatchyError("fetch_header_exception", error, {
      ip: (req as any).hashedIp,
      event: "customer_fetch_header_exception",
    });
    next(error);
  }
};
