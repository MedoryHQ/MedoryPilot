import { prisma } from "@/config";
import { sendError } from "@/utils";
import { NextFunction, Response, Request } from "express";
import {
  logAdminError as logCatchyError,
  logAdminInfo as logInfo,
  logAdminWarn as logWarn,
} from "@/utils";

export const fetchContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contact = await prisma.contact.findFirst({
      include: {
        background: true,
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
      id: (req as any).userId,
      event: "admin_fetch_contact_exception",
    });
    next(error);
  }
};
