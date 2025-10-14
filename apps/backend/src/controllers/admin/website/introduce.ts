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
import { Prisma } from "@prisma/client";
import { CreateIntroduceDTO, UpdateIntroduceDTO } from "@/types/admin";

export const fetchIntroduce = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const introduce = await prisma.introduce.findFirst({
      include: {
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

    if (!introduce) {
      logWarn("Introduce fetch failed: introduce not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "introduce_fetch_failed",
      });
      return sendError(req, res, 404, "introduceNotFound");
    }

    return res.status(200).json({ data: introduce });
  } catch (error) {
    logCatchyError("fetch_introduce_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_introduce_exception",
    });
    next(error);
  }
};

export const deleteIntroduce = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    logInfo("Introduce delete attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "introduce_delete_attempt",
    });

    const introduce = await prisma.introduce.delete({
      where: {
        id,
      },
    });

    if (!introduce) {
      logWarn("Introduce delete failed: introduce not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "introduce_delete_failed",
      });
      return sendError(req, res, 404, "introduceNotFound");
    }

    logInfo("Introduce deleted successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "introduce_deleted",
    });

    return res.status(200).json({
      message: getResponseMessage("introduceDeleted"),
    });
  } catch (error) {
    logCatchyError("delete_introduce_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_delete_introduce_exception",
    });
    next(error);
  }
};

export const createIntroduce = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { translations } = req.body as CreateIntroduceDTO;

    logInfo("Introduce create attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "introduce_create_attempt",
    });

    const footerExistance = await prisma.introduce.count();

    if (footerExistance) {
      logWarn("Introduce create failed: introduce already exist", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,
        event: "introduce_create_failed",
      });
      return sendError(req, res, 400, "introduceAlreadyExists");
    }

    const translationsToCreate = Prisma.validator<
      Prisma.IntroduceTranslationCreateWithoutIntroduceInput[]
    >()(createTranslations(translations) as any);

    const introduce = await prisma.introduce.create({
      data: {
        translations: { create: translationsToCreate },
      },
    });

    logInfo("Introduce created successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "introduce_created",
    });

    return res.status(201).json({
      data: introduce,
    });
  } catch (error) {
    logCatchyError("Create introduce exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_create_introduce_exception",
    });
    next(error);
  }
};

export const updateIntroduce = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const { translations } = req.body as UpdateIntroduceDTO;

    logInfo("Introduce update attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "introduce_update_attempt",
    });

    const translationsToCreate = Prisma.validator<
      Prisma.IntroduceTranslationCreateWithoutIntroduceInput[]
    >()(createTranslations(translations) as any);

    const findIntroduce = await prisma.introduce.findUnique({
      where: {
        id,
      },
    });

    if (!findIntroduce) {
      logWarn("Introduce update failed: introduce not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "introduce_update_failed",
      });
      return sendError(req, res, 404, "introduceNotFound");
    }

    const introduce = await prisma.introduce.update({
      where: {
        id,
      },
      data: {
        translations: {
          deleteMany: {},
          create: translationsToCreate,
        },
      },
    });

    logInfo("Introduce updated successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "introduce_updated",
    });

    return res.json({
      data: introduce,
    });
  } catch (error) {
    logCatchyError("Update introduce exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_update_introduce_exception",
    });
    next(error);
  }
};
