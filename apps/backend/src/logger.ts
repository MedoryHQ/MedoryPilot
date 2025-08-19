import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export function createDomainLogger(
  domain: string,
  level: keyof typeof logLevels
) {
  return winston.createLogger({
    level: "debug",
    levels: logLevels,
    format: logFormat,
    transports: [
      new DailyRotateFile({
        filename: path.join(
          "logs",
          domain,
          level,
          `${domain}-${level}-%DATE%.log`
        ),
        level,
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "30d",
      }),
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
    ],
  });
}

export const adminInfoLogger = createDomainLogger("admin", "info");
export const adminErrorLogger = createDomainLogger("admin", "error");
export const adminWarnLogger = createDomainLogger("admin", "warn");
export const adminHttpLogger = createDomainLogger("admin", "http");
export const adminDebugLogger = createDomainLogger("admin", "debug");
export const customerInfoLogger = createDomainLogger("customer", "info");
export const customerErrorLogger = createDomainLogger("customer", "error");
export const customerWarnLogger = createDomainLogger("customer", "warn");
export const customerHttpLogger = createDomainLogger("customer", "http");
export const customerDebugLogger = createDomainLogger("customer", "debug");
export const systemInfoLogger = createDomainLogger("system", "info");
export const systemErrorLogger = createDomainLogger("system", "error");
export const systemHttpLogger = createDomainLogger("system", "http");
