import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import { logCustomerCatchyError as logCatchyError } from "@/utils";

export const fetchIntroduce = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const introduce = await prisma.introduce.findFirst({
      select: {
        translations: {
          select: {
            headline: true,
            description: true,
            language: {
              select: {
                code: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({ data: introduce });
  } catch (error) {
    logCatchyError("fetch_introduce_exception", error, {
      ip: (req as any).hashedIp,
      event: "customer_fetch_introduce_exception",
    });
    next(error);
  }
};
