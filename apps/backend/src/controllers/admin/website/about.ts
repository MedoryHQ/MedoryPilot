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

export const deleteAbout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logInfo("About delete attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "about_delete_attempt",
    });

    const about = await prisma.about.deleteMany();

    if (!about.count) {
      logWarn("About delete failed: about not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "about_delete_failed",
      });
      return sendError(req, res, 404, "aboutNotFound");
    }

    logInfo("About deleted successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "about_deleted",
    });

    return res.status(200).json({
      message: getResponseMessage("aboutDeleted"),
    });
  } catch (error) {
    logCatchyError("delete_about_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_delete_about_exception",
    });
    next(error);
  }
};

export const createAbout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { translations, image } = req.body as CreateAboutDTO;

    logInfo("About create attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "about_create_attempt",
    });

    const aboutExistance = await prisma.about.count();

    if (aboutExistance) {
      logWarn("About create failed: about already exist", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,
        event: "about_create_failed",
      });
      return sendError(req, res, 400, "aboutAlreadyExists");
    }

    const translationsToCreate = Prisma.validator<
      Prisma.AboutTranslationCreateWithoutAboutInput[]
    >()(createTranslations(translations) as any);

    const imageToCreate = image
      ? {
          path: image.path,
          name: image.name,
          size: image.size,
        }
      : undefined;

    const about = await prisma.about.create({
      data: {
        translations: { create: translationsToCreate },
        image: {
          create: imageToCreate,
        },
      },
    });

    logInfo("About created successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "about_created",
    });

    return res.status(201).json({
      data: about,
    });
  } catch (error) {
    logCatchyError("Create about exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_create_about_exception",
    });
    next(error);
  }
};

export const updateAbout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const { translations, image } = req.body as UpdateAboutDTO;

    logInfo("About update attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "about_update_attempt",
    });

    const translationsToCreate = Prisma.validator<
      Prisma.AboutTranslationCreateWithoutAboutInput[]
    >()(createTranslations(translations) as any);
    const imageToCreate = image
      ? {
          path: image.path,
          name: image.name,
          size: image.size,
        }
      : undefined;

    const findAbout = await prisma.about.findUnique({
      where: {
        id,
      },
      include: {
        image: true,
      },
    });

    if (!findAbout) {
      logWarn("About update failed: about not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "about_update_failed",
      });
      return sendError(req, res, 404, "aboutNotFound");
    }

    const about = await prisma.about.update({
      where: {
        id,
      },
      data: {
        translations: {
          deleteMany: {},
          create: translationsToCreate,
        },
        image: imageToCreate
          ? {
              delete: findAbout.image ? {} : undefined,
              create: imageToCreate,
            }
          : findAbout.image
          ? { delete: {} }
          : undefined,
      },
    });

    logInfo("About updated successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "about_updated",
    });

    return res.json({
      data: about,
    });
  } catch (error) {
    logCatchyError("Update about exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_update_about_exception",
    });
    next(error);
  }
};
