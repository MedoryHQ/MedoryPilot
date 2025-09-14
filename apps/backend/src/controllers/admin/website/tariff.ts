import { prisma } from "@/config";
import { getPaginationAndFilters } from "@/utils";
import { NextFunction, Response, Request } from "express";
import { logAdminError as logCatchyError } from "@/utils";

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
