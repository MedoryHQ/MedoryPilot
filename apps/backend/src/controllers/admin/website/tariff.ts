import { prisma } from "@/config";
import {
  getPaginationAndFilters,
  getResponseMessage,
  sendError,
} from "@/utils";
import { NextFunction, Response, Request } from "express";
import {
  logAdminError as logCatchyError,
  logAdminWarn as logWarn,
  logAdminInfo as logInfo,
} from "@/utils";
import {
  GetTariffDTO,
  DeleteTariffDTO,
  CreateTariffDTO,
  UpdateTariffDTO,
} from "@/types/admin";

export const fetchTariffs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, orderBy } = getPaginationAndFilters(req);

    const [currentTariff, tariffs, tariffCount, historyCount] =
      await Promise.all([
        prisma.tariff.findFirst(),
        prisma.tariff.findMany({
          skip,
          take: take - 1,
          orderBy,
        }),
        prisma.tariff.count(),
        prisma.tariffHistory.count(),
      ]);

    return res.status(200).json({
      data: {
        currentTariff,
        tariffs,
      },
      count: {
        tariffs: tariffCount,
        tariffHistory: historyCount,
        total: tariffCount + historyCount,
      },
    });
  } catch (error) {
    logCatchyError("fetch_tariffs_exception", error, {
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
    const { type } = req.body as GetTariffDTO;

    let data;

    if (type === "active") {
      data = await prisma.tariff.findUnique({
        where: { id },
      });
    } else if (type === "history") {
      data = await prisma.tariffHistory.findUnique({
        where: { id },
      });
    }

    if (!data) {
      logWarn("Tariff fetch failed: tariff not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "tariff_fetch_failed",
      });
      return sendError(req, res, 404, "tariffNotFound");
    }

    return res.status(200).json({ data, type });
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
    const { type } = req.body as DeleteTariffDTO;

    logInfo("Tariff delete attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "tariff_delete_attempt",
    });

    let tariff;

    if (type === "active") {
      tariff = await prisma.tariff.delete({
        where: { id },
      });
    } else if (type === "history") {
      tariff = await prisma.tariffHistory.delete({
        where: { id },
      });
    }

    if (!tariff) {
      logWarn("Tariff delete failed: tariff not found", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,

        event: "tariff_delete_failed",
      });
      return sendError(req, res, 404, "tariffNotFound");
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

    return res.json({ data: tariff });
  } catch (error) {
    logCatchyError("create_tariffs_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_create_tariffs_exception",
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
    logCatchyError("update_tariffs_exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_update_tariffs_exception",
    });
    next(error);
  }
};
