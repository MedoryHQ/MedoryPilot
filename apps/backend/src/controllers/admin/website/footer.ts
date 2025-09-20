import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import {
  logAdminError as logCatchyError,
  logAdminInfo as logInfo,
  logAdminWarn as logWarn,
} from "@/utils";

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
