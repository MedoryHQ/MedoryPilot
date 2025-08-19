import cron from "node-cron";
import { cleanupExpiredData } from "./expired-data";
import { systemInfoLogger } from "@/logger";

export const startCronJobs = () => {
  cron.schedule("0 * * * *", async () => {
    systemInfoLogger.info({
      message: "Starting cleanup of expired data...",
      event: "cron_job_started",
      timestamp: new Date().toISOString(),
    });
    await cleanupExpiredData();
    systemInfoLogger.info({
      message: "Expired data cleanup completed",
      event: "cron_job_completed",
      timestamp: new Date().toISOString(),
    });
  });

  systemInfoLogger.info({
    message: "Cron job scheduler initialized",
    event: "cron_scheduler_initialized",
    timestamp: new Date().toISOString(),
  });
};
