import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { Request } from "express";
import { hashIp } from "../security";

export const trafficLogger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new DailyRotateFile({
      filename: path.join("logs/traffic", "traffic-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: false,
      maxSize: "20m",
      maxFiles: "31d",
    }),
  ],
});

export async function getClientIp(req: Request): Promise<string> {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  const ip = req.socket?.remoteAddress || req.ip || "Unknown";
  const hashedIp = await hashIp(ip);

  return hashedIp;
}
