import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import {
  getPaginationAndFilters,
  getResponseMessage,
  sendError,
  logAdminError as logCatchyError,
  logAdminInfo as logInfo,
  logAdminWarn as logWarn,
  generateWhereInput,
  parseFilters,
} from "@/utils";
import { CreateSocialDTO, UpdateSocialDTO } from "@/types/admin";
import { Prisma } from "@prisma/client";

export const fetchSocials = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, orderBy, search } = getPaginationAndFilters(req);
    const filters = parseFilters(req);
    const { icon } = filters;

    const where = generateWhereInput<Prisma.SocialWhereInput>(
      search,
      {
        name: "insensitive",
        url: "insensitive",
      },
      {
        AND: [
          {
            ...(typeof icon === "boolean"
              ? icon
                ? { icon: { isNot: null } }
                : { icon: { is: null } }
              : {}),
          },
        ],
      }
    );
    const [socials, count] = await Promise.all([
      prisma.social.findMany({
        skip,
        take,
        orderBy,
        where,
        include: {
          icon: true,
        },
      }),
      prisma.social.count({ where }),
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

export const deleteSocial = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    logInfo("Social delete attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "social_delete_attempt",
    });

    const social = await prisma.social.delete({
      where: {
        id,
      },
    });

    if (!social) {
      logWarn("Social delete failed: social not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "social_delete_failed",
      });
      return sendError(req, res, 404, "socialNotFound");
    }

    logInfo("Social deleted successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "social_deleted",
    });

    return res.status(200).json({
      message: getResponseMessage("socialDeleted"),
    });
  } catch (error) {
    logCatchyError("delete_social_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_delete_social_exception",
    });
    next(error);
  }
};

export const createSocial = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { icon, footerId, ...rest } = req.body as CreateSocialDTO;

    logInfo("Social create attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "social_create_attempt",
    });

    const iconToCreate = icon
      ? {
          path: icon.path,
          name: icon.name,
          size: icon.size,
        }
      : undefined;

    const social = await prisma.social.create({
      data: {
        ...(footerId
          ? {
              footer: {
                connect: { id: footerId },
              },
            }
          : {}),
        icon: {
          create: iconToCreate,
        },
        ...rest,
      },
    });

    logInfo("Social created successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "social_created",
    });

    return res.status(201).json({
      data: social,
    });
  } catch (error) {
    logCatchyError("Create social exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_create_social_exception",
    });
    next(error);
  }
};

export const updateSocial = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const { icon, ...rest } = req.body as UpdateSocialDTO;

    logInfo("Social update attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "social_update_attempt",
    });

    const iconToCreate = icon
      ? {
          path: icon.path,
          name: icon.name,
          size: icon.size,
        }
      : undefined;

    const findSocial = await prisma.social.findUnique({
      where: {
        id,
      },
      include: {
        icon: true,
      },
    });

    if (!findSocial) {
      logWarn("Social update failed: social not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "social_update_failed",
      });
      return sendError(req, res, 404, "socialNotFound");
    }

    const social = await prisma.social.update({
      where: {
        id,
      },
      data: {
        ...rest,

        icon: iconToCreate
          ? {
              delete: findSocial.icon ? {} : undefined,
              create: iconToCreate,
            }
          : findSocial.icon
          ? { delete: {} }
          : undefined,
      },
    });

    logInfo("Social updated successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "social_updated",
    });

    return res.json({
      data: social,
    });
  } catch (error) {
    logCatchyError("Update social exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_update_social_exception",
    });
    next(error);
  }
};
