import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import {
  getResponseMessage,
  logAdminError as logCatchyError,
  logAdminInfo as logInfo,
  logAdminWarn as logWarn,
  sendError,
} from "@/utils";
import { CreateFooterDTO } from "@/types/admin";

export const fetchFooter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const footer = await prisma.footer.findFirst({
      include: {
        pages: {
          include: {
            translations: {
              include: {
                language: {
                  select: { code: true },
                },
              },
            },
          },
        },
        socials: {
          include: {
            icon: true,
          },
        },
      },
    });

    return res.status(200).json({ data: footer });
  } catch (error) {
    logCatchyError("fetch_footers_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_footers_exception",
    });
    next(error);
  }
};

export const deleteFooter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    logInfo("Footer delete attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "footer_delete_attempt",
    });

    const footer = await prisma.footer.delete({
      where: {
        id,
      },
    });

    if (!footer) {
      logWarn("Footer delete failed: footer not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "footer_delete_failed",
      });
      return sendError(req, res, 404, "footerNotFound");
    }

    logInfo("Footer deleted successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "footer_deleted",
    });

    return res.status(200).json({
      message: getResponseMessage("footerDeleted"),
    });
  } catch (error) {
    logCatchyError("delete_footer_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_delete_footer_exception",
    });
    next(error);
  }
};

export const createFooter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pages, socials, ...rest } = req.body as CreateFooterDTO;

    logInfo("Footer create attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "footer_create_attempt",
    });

    const footerExistance = await prisma.footer.count();
    if (footerExistance) {
      logWarn("Footer create failed: footer already exist", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,
        event: "footer_create_failed",
      });
      return sendError(req, res, 400, "footerAlreadyExists");
    }

    const footer = await prisma.footer.create({
      data: {
        ...rest,
        socials: {
          connect: socials.map((id) => ({
            id,
          })),
        },
        pages: {
          connect: pages.map((id) => ({
            id,
          })),
        },
      },
    });

    logInfo("Footer created successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "footer_created",
    });

    return res.status(201).json({
      data: footer,
    });
  } catch (error) {
    logCatchyError("create_footers_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_create_footers_exception",
    });
    next(error);
  }
};
