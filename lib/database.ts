// Database configuration for production
export const dbConfig = {
  // Connection pool settings for production
  connection: {
    max: 20, // Maximum number of connections
    min: 5, // Minimum number of connections
    idle: 10000, // Idle timeout in milliseconds
    acquire: 60000, // Acquire timeout in milliseconds
  },

  // Logging configuration
  logging: {
    level: process.env.NODE_ENV === "production" ? "warn" : "query",
    slowQueryThreshold: 1000, // Log queries slower than 1 second
  },

  // Migration settings
  migrations: {
    tableName: "_prisma_migrations",
    directory: "./prisma/migrations",
  },

  // Seed configuration
  seed: {
    enabled: process.env.NODE_ENV !== "production",
    file: "./prisma/seed.ts",
  },
};

// Database health check
export async function checkDatabaseHealth() {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    await prisma.$connect();
    await prisma.$disconnect();

    return { status: "healthy", timestamp: new Date().toISOString() };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

// Database utilities
export const dbUtils = {
  // Clean up old data (for development/testing)
  async cleanupOldData(daysOld = 30) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Cleanup not allowed in production");
    }

    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      // Delete old proof requests and responses
      await prisma.proofResponse.deleteMany({
        where: { createdAt: { lt: cutoffDate } },
      });

      await prisma.proofRequest.deleteMany({
        where: { createdAt: { lt: cutoffDate } },
      });

      // Delete old verifications
      await prisma.verification.deleteMany({
        where: { createdAt: { lt: cutoffDate } },
      });

      console.log(`Cleaned up data older than ${daysOld} days`);
    } catch (error) {
      console.error("Error during cleanup:", error);
    } finally {
      await prisma.$disconnect();
    }
  },

  // Get database statistics
  async getStats() {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    try {
      const [userCount, credentialCount, verificationCount, proofRequestCount] =
        await Promise.all([
          prisma.user.count(),
          prisma.credential.count(),
          prisma.verification.count(),
          prisma.proofRequest.count(),
        ]);

      return {
        users: userCount,
        credentials: credentialCount,
        verifications: verificationCount,
        proofRequests: proofRequestCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error getting database stats:", error);
      return null;
    } finally {
      await prisma.$disconnect();
    }
  },
};
