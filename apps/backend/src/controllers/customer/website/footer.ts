import { prisma } from "@/config";
import { NextFunction, Response, Request } from "express";
import { logCustomerCatchyError as logCatchyError } from "@/utils";

export const fetchFooter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const footer = await prisma.footer.findFirst({
      select: {
        email: true,
        phone: true,
        pages: {
          orderBy: {
            footerOrder: "asc",
          },
          select: {
            footerOrder: true,
            slug: true,
            translations: {
              select: {
                name: true,
                language: {
                  select: {
                    code: true,
                  },
                },
              },
            },
          },
        },
        socials: {
          select: {
            icon: true,
            name: true,
            url: true,
          },
        },
      },
    });

    return res.status(200).json({ data: footer });
  } catch (error) {
    logCatchyError("fetch_footer_exception", error, {
      ip: (req as any).hashedIp,
      event: "customer_fetch_footer_exception",
    });
    next(error);
  }
};
