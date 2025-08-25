import { Request } from "express";
import morgan from "morgan";
import { hashIp } from "@/utils";
import { UAParser } from "ua-parser-js";
import {
  adminHttpLogger,
  customerHttpLogger,
  systemHttpLogger,
} from "@/logger";

const stream = {
  write: async (message: string) => {
    try {
      const data = JSON.parse(message);
      const hashedIp = await hashIp(data.ip);
      data.ip = hashedIp;

      if (data.url && data.url.startsWith("/api/v1/admin")) {
        adminHttpLogger.http("HTTP Access Log", data);
      } else if (data.url && data.url.startsWith("/api/v1")) {
        customerHttpLogger.http("HTTP Access Log", data);
      } else {
        systemHttpLogger.http("HTTP Access Log", data);
      }
    } catch (err) {
      systemHttpLogger.error("Morgan stream error", err);
    }
  },
};

const morganMiddleware = morgan(
  (tokens, req: Request, res) => {
    const parser = new UAParser(req.headers["user-agent"]);
    const browser = parser.getBrowser().name || "Unknown";
    const os = parser.getOS().name || "Unknown";

    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: tokens.status(req, res),
      contentLength: tokens.res(req, res, "content-length"),
      responseTime: tokens["response-time"](req, res) + " ms",
      ip: (req as any).hashedIp,
      browser,
      os,
      user: (req as any).user?.id || null,
    });
  },
  { stream }
);

export default morganMiddleware;
