import { prisma } from "@/config";
import { getResponseMessage, sendError } from "@/utils";
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

export const deleteContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    logInfo("Contact delete attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "contact_delete_attempt",
    });

    const contact = await prisma.contact.deleteMany();

    if (!contact.count) {
      logWarn("Contact delete failed: contact not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "contact_delete_failed",
      });
      return sendError(req, res, 404, "contactNotFound");
    }

    logInfo("Contact deleted successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "contact_deleted",
    });

    return res.status(200).json({
      message: getResponseMessage("contactDeleted"),
    });
  } catch (error) {
    logCatchyError("delete_contact_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_delete_contact_exception",
    });
    next(error);
  }
};
