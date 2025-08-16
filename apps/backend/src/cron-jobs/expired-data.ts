import { prisma } from "../config/prisma";

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
      console.log(`✅ Deleted ${deletedPending.count} expired pending users`);
    }
  } catch (error) {
    console.error("❌ Error cleaning up expired data:", error);
  }
};
