import { Request } from "express";
import morgan from "morgan";
import logger from "@/logger";

const morganMiddleware = morgan(
  (tokens, req: Request, res) => {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: tokens.status(req, res),
      contentLength: tokens.res(req, res, "content-length"),
      responseTime: tokens["response-time"](req, res) + " ms",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
  },
  {
    stream: {
      write: (message) => {
        const data = JSON.parse(message);
        logger.http("HTTP Access Log", data);
      },
    },
  }
);

export default morganMiddleware;
