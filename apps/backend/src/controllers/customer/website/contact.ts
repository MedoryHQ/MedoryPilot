import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import {
  logCustomerCatchyError as logCatchyError,
  logCustomerWarn as logWarn,
  sendError,
} from "@/utils";

export const fetchContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contact = await prisma.contact.findFirst({
      select: {
        background: true,
        location: true,
        translations: {
          select: {
            description: true,
            title: true,
            language: {
              select: {
                code: true,
              },
            },
          },
        },
      },
    });

    if (!contact) {
      logWarn("Contact fetch failed: contact not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "contact_fetch_failed",
      });
      return sendError(req, res, 404, "contactNotFound");
    }
    return res.status(200).json({ data: contact });
  } catch (error) {
    logCatchyError("fetch_contact_exception", error, {
      ip: (req as any).hashedIp,
      event: "customer_fetch_contact_exception",
    });
    next(error);
  }
};
