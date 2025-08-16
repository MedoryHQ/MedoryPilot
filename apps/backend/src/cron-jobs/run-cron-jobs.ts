import cron from "node-cron";
import { cleanupExpiredData } from "./expired-data";

export const startCronJobs = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("🕒 Starting cleanup of expired data...");
    await cleanupExpiredData();
    console.log("✅ Expired data cleanup completed");
  });

  console.log("✅ Cron job scheduler initialized");
};
