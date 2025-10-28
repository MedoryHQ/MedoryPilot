import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import { logCustomerError as logCatchyError } from "@/utils";

export const fetchExperiences = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [experiences, count] = await Promise.all([
      prisma.experience.findMany({
        include: {
          icon: true,
          translations: {
            select: {
              position: true,
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
      prisma.experience.count(),
    ]);

    return res.status(200).json({ data: experiences, count });
  } catch (error) {
    logCatchyError("Fetch experiences exception", error, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "customer_fetch_experiences_exception",
    });
    next(error);
  }
};
