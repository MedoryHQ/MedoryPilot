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
import {
  GetTariffDTO,
  DeleteTariffDTO,
  CreateTariffDTO,
  UpdateTariffDTO,
} from "@/types/admin";
import { Prisma } from "@prisma/client";

export const fetchTariffs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, orderBy, search } = getPaginationAndFilters(req);
    const filters = parseFilters(req);
    const { min, max, type } = filters;

    const applyMinPrice = min !== undefined && Number(min) >= 0;
    const applyMaxPrice = max !== undefined && Number(max) >= 0;

    const priceExtra: any = {};
    if (applyMinPrice) priceExtra.gte = Number(min);
    if (applyMaxPrice) priceExtra.lte = Number(max);

    const clientProvidedOrderBy = typeof req.query.orderBy !== "undefined";
    const tariffWhere = generateWhereInput<Prisma.TariffWhereInput>(
      search,
      { price: "insensitive" },
      Object.keys(priceExtra).length ? { price: priceExtra } : undefined
    );

    const historyWhere = generateWhereInput<Prisma.TariffHistoryWhereInput>(
      search,
      { price: "insensitive", fromDate: "insensitive", endDate: "insensitive" },
      Object.keys(priceExtra).length ? { price: priceExtra } : undefined
    );

    const wantOnlyTariff = type === "tariff";
    const wantOnlyHistory = type === "history";

    const [tariffCount, historyCount] = await Promise.all([
      wantOnlyHistory
        ? Promise.resolve(0)
        : prisma.tariff.count({ where: tariffWhere }),
      wantOnlyTariff
        ? Promise.resolve(0)
        : prisma.tariffHistory.count({ where: historyWhere }),
    ]);

    const prismaOrder = clientProvidedOrderBy ? orderBy : undefined;

    const tariffPromise = wantOnlyHistory
      ? Promise.resolve([])
      : prisma.tariff.findMany({
          where: tariffWhere,
          orderBy: prismaOrder,
          take: 1,
        });

    const historiesToFetch = Math.max(0, skip + take);
    const historyPromise = wantOnlyTariff
      ? Promise.resolve([])
      : prisma.tariffHistory.findMany({
          where: historyWhere,
          orderBy: prismaOrder,
          take: historiesToFetch,
        });

    const [tariffs, histories] = await Promise.all([
      tariffPromise,
      historyPromise,
    ]);

    type Unified = { __type: "tariff" | "history"; payload: any };

    const combined: Unified[] = [
      ...tariffs.map((t) => ({ __type: "tariff" as const, payload: t })),
      ...histories.map((h) => ({ __type: "history" as const, payload: h })),
    ];

    if (clientProvidedOrderBy) {
      const orderKey = Object.keys(orderBy)[0];
      const orderDir = (Object.values(orderBy)[0] as "asc" | "desc") || "desc";
      const dir = orderDir === "asc" ? 1 : -1;

      const getVal = (item: Unified, key: string) => {
        return item.payload?.[key];
      };

      combined.sort((a, b) => {
        const va = getVal(a, orderKey);
        const vb = getVal(b, orderKey);

        if (va == null && vb == null) return 0;
        if (va == null) return 1 * dir;
        if (vb == null) return -1 * dir;

        if (va instanceof Date || vb instanceof Date) {
          const da = va instanceof Date ? va.getTime() : new Date(va).getTime();
          const db = vb instanceof Date ? vb.getTime() : new Date(vb).getTime();
          return (da - db) * dir;
        }

        if (typeof va === "number" && typeof vb === "number") {
          return (va - vb) * dir;
        }

        const sa = String(va).toLowerCase();
        const sb = String(vb).toLowerCase();
        if (sa < sb) return -1 * dir;
        if (sa > sb) return 1 * dir;
        return 0;
      });
    }

    const totalCombined = tariffCount + historyCount;

    const paged = combined.slice(skip, skip + take);

    const data = paged.map((u) => ({ ...u.payload, __type: u.__type }));

    return res.status(200).json({
      data,
      count: {
        total: totalCombined,
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
