import { trafficLogger } from "@/utils";
import { Request, Response, NextFunction } from "express";
import { UAParser } from "ua-parser-js";

export const logTraffic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parser = new UAParser(req.headers["user-agent"]);
  const browser = parser.getBrowser().name || "Unknown";
  const os = parser.getOS().name || "Unknown";

  const path = req.originalUrl;

  trafficLogger.info({
    timestamp: new Date().toISOString(),
    ip: (req as any).hashedIp,
    path,
    browser,
    os,
  });

  next();
};
