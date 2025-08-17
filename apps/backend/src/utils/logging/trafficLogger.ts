import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

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
