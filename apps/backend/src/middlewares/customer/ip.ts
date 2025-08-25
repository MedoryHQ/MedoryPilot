import { Request, Response, NextFunction } from "express";
import {
  sendError,
  logCustomerError as logCatchyError,
  getClientIp,
} from "@/utils";

export const determineCustomerIp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hashedIp = await getClientIp(req);

    (req as any).hashedIp = hashedIp;

    next();
  } catch (error) {
    logCatchyError("Determine ip exception", error, {
      event: "customer_determine_ip_exception",
    });
    return sendError(req, res, 401, "determineIpFailed");
  }
};
