import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import {
  getPaginationAndFilters,
  getResponseMessage,
  sendError,
  logAdminError as logCatchyError,
  logAdminWarn as logWarn,
  logAdminInfo as logInfo,
  parseFilters,
  generateWhereInput,
} from "@/utils";
import { CreateTariffDTO, UpdateTariffDTO } from "@/types/admin";
import { Prisma } from "@prisma/client";

export const fetchTariffs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, orderBy, search } = getPaginationAndFilters(req);
    const filters = parseFilters(req);
    const { price, type } = filters;

    const applyMinPrice = price.min && Number(price.min) > 0;
    const applyMaxPrice = price.max && Number(price.max) > 0;

    const where = generateWhereInput<Prisma.TariffWhereInput>(
      search,
      { price: "insensitive" },
      {
        AND: [
          applyMinPrice
            ? {
                price: {
                  gte: Number(price.min),
                },
              }
            : {},
          applyMaxPrice
            ? {
                price: {
                  lte: Number(price.max),
                },
              }
            : {},
        ],
      }
    );

    if (type === "tariff") {
      (where as any).AND = [...((where as any).AND ?? []), { isCurrent: true }];
    } else if (type === "history") {
      (where as any).AND = [
        ...((where as any).AND ?? []),
        { isCurrent: false },
      ];
    }

    const [tariffs, count] = await Promise.all([
      prisma.tariff.findMany({
        skip,
        take,
        orderBy: orderBy as any,
        where,
      }),
      prisma.tariff.count({ where }),
    ]);

    return res.status(200).json({ data: tariffs, count: { total: count } });
  } catch (error) {
    logCatchyError("Fetch tariffs exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_tariffs_exception",
    });
    next(error);
  }
};

export const fetchTariff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const tariff = await prisma.tariff.findUnique({
      where: { id },
    });

    if (!tariff) {
      logWarn("Tariff fetch failed: tariff not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,
        event: "tariff_fetch_failed",
      });
      return sendError(req, res, 404, "tariffNotFound");
    }

    const type = tariff.isCurrent ? "active" : "history";

    return res.status(200).json({ data: tariff, type });
  } catch (error) {
    logCatchyError("fetch_tariff_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_fetch_tariff_exception",
    });
    next(error);
  }
};

export const deleteTariff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    logInfo("Tariff delete attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "tariff_delete_attempt",
    });

    const existing = await prisma.tariff.findUnique({ where: { id } });

    if (!existing) {
      logWarn("Tariff delete failed: tariff not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,
        event: "tariff_delete_failed",
      });
      return sendError(req, res, 404, "tariffNotFound");
    }

    await prisma.tariff.delete({ where: { id } });

    if (existing.isCurrent) {
      const childToPromote = await prisma.tariff.findFirst({
        where: { parentId: id },
        orderBy: { createdAt: "desc" },
      });

      if (childToPromote) {
        await prisma.tariff.update({
          where: { id: childToPromote.id },
          data: {
            isCurrent: true,
            parentId: null,
            endDate: null,
          },
        });
      }
    }

    logInfo("Tariff deleted successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "tariff_deleted",
    });

    return res.status(200).json({
      message: getResponseMessage("tariffDeleted"),
    });
  } catch (error) {
    logCatchyError("delete_tariff_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_delete_tariff_exception",
    });
    next(error);
  }
};

export const createTariff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { price } = req.body as CreateTariffDTO;

    logInfo("Tariff create attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "tariff_create_attempt",
    });

    const currentTariff = await prisma.tariff.findFirst();

    const tariff = await prisma.tariff.create({
      data: { price },
    });

    if (currentTariff) {
      await prisma.tariffHistory.create({
        data: {
          price: currentTariff.price,
          fromDate: currentTariff.createdAt,
          endDate: new Date(),
          current: {
            connect: { id: tariff.id },
          },
        },
      });

      await prisma.tariff.delete({
        where: { id: currentTariff.id },
      });
    }

    logInfo("Tariff created successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "tariff_created",
    });

    return res.status(201).json({ data: tariff });
  } catch (error) {
    logCatchyError("Create tariff exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_create_tariff_exception",
    });
    next(error);
  }
};

export const updateTariff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const { price } = req.body as UpdateTariffDTO;

    logInfo("Tariff update attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "tariff_update_attempt",
    });

    const findTariff = await prisma.tariff.findUnique({
      where: {
        id,
      },
    });

    if (!findTariff) {
      logWarn("Tariff update failed: tariff not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "tariff_update_failed",
      });
      return sendError(req, res, 404, "tariffNotFound");
    }

    const tariff = await prisma.tariff.update({
      where: {
        id,
      },
      data: {
        price,
      },
    });

    logInfo("Tariff updated successfully", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "tariff_updated",
    });

    return res.json({
      data: tariff,
    });
  } catch (error) {
    logCatchyError("Update tariff exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_update_tariff_exception",
    });
    next(error);
  }
};
