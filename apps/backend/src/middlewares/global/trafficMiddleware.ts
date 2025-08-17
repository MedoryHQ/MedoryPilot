import { trafficLogger } from "@/utils";
import { Request, Response, NextFunction } from "express";

export const logTraffic = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
  const userAgent = req.headers["user-agent"] || "unknown";
  const path = req.originalUrl;

  trafficLogger.info({
    timestamp: new Date().toISOString(),
    ip,
    path,
    userAgent,
  });

  next();
};
