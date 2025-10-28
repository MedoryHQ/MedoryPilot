import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import { logCustomerError as logCatchyError } from "@/utils";

export const fetchEducations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [educations, count] = await Promise.all([
      prisma.education.findMany({
        include: {
          icon: true,
          translations: {
            select: {
              degree: true,
              name: true,
              description: true,
              language: {
                select: {
                  code: true,
                },
              },
            },
          },
        },
      }),
      prisma.education.count(),
    ]);

    return res.status(200).json({ data: educations, count });
  } catch (error) {
    logCatchyError("Fetch educations exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "customer_fetch_educations_exception",
    });
    next(error);
  }
};
