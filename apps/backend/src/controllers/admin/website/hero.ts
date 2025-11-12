import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import {
  createTranslations,
  getResponseMessage,
  sendError,
  logAdminError as logCatchyError,
  logAdminInfo as logInfo,
  logAdminWarn as logWarn,
  generateWhereInput,
  getPaginationAndFilters,
  parseFilters,
} from "@/utils";
import { Prisma } from "@prisma/client";
import { CreateHeroDTO, UpdateHeroDTO } from "@/types/admin";

export const fetchHeros = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, orderBy, search } = getPaginationAndFilters(req);
    const filters = parseFilters(req);
    const { active, logo, experience, visits } = filters;

    const where = generateWhereInput<Prisma.HeroWhereInput>(
      search,
      {
        "translations.some.name": "insensitive",
        "translations.some.position": "insensitive",
        "translations.some.headline": "insensitive",
        "translations.some.description": "insensitive",
      },
      {
        AND: [
          {
            ...(typeof active === "boolean"
              ? active
                ? { active: true }
                : { active: false }
              : {}),
          },
          {
            ...(typeof logo === "boolean"
              ? logo
                ? { logo: { isNot: null } }
                : { logo: { is: null } }
              : {}),
          },
          {
            ...(typeof experience === "boolean"
              ? experience
                ? { experience: { not: null } }
                : { experience: null }
              : {}),
            ...(typeof visits === "boolean"
              ? visits
                ? { visits: { not: null } }
                : { visits: null }
              : {}),
          },
        ],
      }
    );

    const [heros, count] = await Promise.all([
      prisma.hero.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          logo: true,
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
      }),
      prisma.hero.count({ where }),
    ]);

    return res.status(200).json({ data: heros, count });
  } catch (error) {
    logCatchyError("fetch_hero_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_hero_exception",
    });
    next(error);
  }
};

export const fetchHero = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const hero = await prisma.hero.findUnique({
      where: {
        id,
      },
      include: {
        logo: true,
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

    if (!hero) {
      logWarn("Hero fetch failed: hero not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "hero_fetch_failed",
      });
      return sendError(req, res, 404, "heroNotFound");
    }

    return res.status(200).json({ data: hero });
  } catch (error) {
    logCatchyError("fetch_hero_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_hero_exception",
    });
    next(error);
  }
};

export const deleteHero = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    logInfo("Hero delete attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "hero_delete_attempt",
    });

    const hero = await prisma.hero.delete({
      where: {
        id,
      },
    });

    if (!hero) {
      logWarn("Hero delete failed: hero not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "hero_delete_failed",
      });
      return sendError(req, res, 404, "heroNotFound");
    }

    logInfo("Hero deleted successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "hero_deleted",
    });

    return res.status(200).json({
      message: getResponseMessage("heroDeleted"),
    });
  } catch (error) {
    logCatchyError("delete_hero_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_delete_hero_exception",
    });
    next(error);
  }
};

export const createHero = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { translations, logo, active, experience, visits } =
      req.body as CreateHeroDTO;

    logInfo("Hero create attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "hero_create_attempt",
    });

    if (active) {
      const activeHero = await prisma.hero.count({
        where: { active: true },
      });
      if (activeHero) {
        return sendError(req, res, 400, "onlyOneActiveHeroAllowed");
      }
    }

    const translationsToCreate = Prisma.validator<
      Prisma.HeroTranslationCreateWithoutHeroInput[]
    >()(createTranslations(translations) as any);

    const logoToCreate = logo
      ? {
          path: logo.path,
          name: logo.name,
          size: logo.size,
        }
      : undefined;

    const hero = await prisma.hero.create({
      data: {
        active: !!active,
        ...(experience ? { experience } : {}),
        ...(visits ? { visits } : {}),
        translations: { create: translationsToCreate },
        logo: {
          create: logoToCreate,
        },
      },
    });

    logInfo("Hero created successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "hero_created",
    });

    return res.status(201).json({
      data: hero,
    });
  } catch (error) {
    logCatchyError("Create hero exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_create_hero_exception",
    });
    next(error);
  }
};

export const updateHero = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const { translations, logo, active, visits, experience } =
      req.body as UpdateHeroDTO;

    logInfo("Hero update attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "hero_update_attempt",
    });

    if (active) {
      const activeHero = await prisma.hero.count({
        where: {
          active: true,
          id: {
            not: id,
          },
        },
      });
      if (activeHero) {
        return sendError(req, res, 400, "onlyOneActiveHeroAllowed");
      }
    }

    const translationsToCreate = Prisma.validator<
      Prisma.HeroTranslationCreateWithoutHeroInput[]
    >()(createTranslations(translations) as any);
    const logoToCreate = logo
      ? {
          path: logo.path,
          name: logo.name,
          size: logo.size,
        }
      : undefined;

    const findHero = await prisma.hero.findUnique({
      where: {
        id,
      },
      include: {
        logo: true,
      },
    });

    if (!findHero) {
      logWarn("Hero update failed: hero not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "hero_update_failed",
      });
      return sendError(req, res, 404, "heroNotFound");
    }

    const hero = await prisma.hero.update({
      where: {
        id,
      },
      data: {
        ...(experience ? { experience } : {}),
        ...(visits ? { visits } : {}),
        translations: {
          deleteMany: {},
          create: translationsToCreate,
        },
        logo: logoToCreate
          ? {
              delete: findHero.logo ? {} : undefined,
              create: logoToCreate,
            }
          : findHero.logo
          ? { delete: {} }
          : undefined,
        ...(typeof active === "boolean" ? { active } : {}),
      },
    });

    logInfo("Hero updated successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "hero_updated",
    });

    return res.json({
      data: hero,
    });
  } catch (error) {
    logCatchyError("Update hero exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_update_hero_exception",
    });
    next(error);
  }
};
