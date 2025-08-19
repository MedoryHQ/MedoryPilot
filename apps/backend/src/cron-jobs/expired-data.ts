import { prisma } from "@/config/prisma";
import { systemInfoLogger, systemErrorLogger } from "@/logger";

export const cleanupExpiredData = async () => {
  try {
    const deletedPending = await prisma.pendingUser.deleteMany({
      where: {
        isVerified: false,
        createdAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (deletedPending.count > 0) {
      systemInfoLogger.info({
        message: `Deleted ${deletedPending.count} expired pending users`,
        event: "cron_cleanup_pending_users",
        timestamp: new Date().toISOString(),
      });
    }

    const deletedTokens = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    if (deletedTokens.count > 0) {
      systemInfoLogger.info({
        message: `Deleted ${deletedTokens.count} expired refresh tokens`,
        event: "cron_cleanup_refresh_tokens",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    systemErrorLogger.error({
      message: "Error cleaning up expired data",
      error: error instanceof Error ? error.message : String(error),
      event: "cron_cleanup_error",
      timestamp: new Date().toISOString(),
    });
  }
};
