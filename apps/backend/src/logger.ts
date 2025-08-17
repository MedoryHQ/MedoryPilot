import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { getEnvVariable } from "./config";

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = getEnvVariable("LOG_LEVEL") || "info";

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(
        ({ level, message, timestamp, ...meta }) =>
          `${timestamp} ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ""
          }`
      )
    ),
  }),
  new DailyRotateFile({
    filename: path.join("logs", "app-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "30d",
  }),
];

const logger = winston.createLogger({
  level,
  levels: logLevels,
  format: logFormat,
  transports,
});

export default logger;
