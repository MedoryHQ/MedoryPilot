import { prisma } from "@/config";
import { generateWhereInput, getPaginationAndFilters } from "@/utils";
import { NextFunction, Response, Request } from "express";
import {
  logAdminError as logCatchyError,
  logAdminInfo as logInfo,
  logAdminWarn as logWarn,
} from "@/utils";
import { Prisma } from "@prisma/client";

export const fetchSocials = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, take, orderBy } = getPaginationAndFilters(req);

    const [socials, count] = await Promise.all([
      prisma.social.findMany({
        skip,
        take,
        orderBy,

        include: {
          icon: true,
        },
      }),
      prisma.social.count(),
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
