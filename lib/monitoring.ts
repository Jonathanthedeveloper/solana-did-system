// Monitoring and logging configuration
export const monitoringConfig = {
  // Log levels
  logLevel: process.env["LOG_LEVEL"] || "info",

  // Error tracking
  errorTracking: {
    enabled: process.env.NODE_ENV === "production",
    dsn: process.env["SENTRY_DSN"],
    environment: process.env.NODE_ENV || "development",
  },

  // Analytics
  analytics: {
    enabled: process.env.NODE_ENV === "production",
    googleAnalyticsId: process.env["GA_TRACKING_ID"],
    vercelAnalytics: true,
  },

  // Health check endpoints
  healthChecks: {
    database: "/api/health/database",
    api: "/api/health/api",
    overall: "/api/health",
  },
};

// Logger utility
export class Logger {
  private static instance: Logger;
  private logLevel: string;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  constructor() {
    this.logLevel = monitoringConfig.logLevel;
  }

  private shouldLog(level: string): boolean {
    const levels = ["error", "warn", "info", "debug"];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  error(message: string, meta?: any): void {
    if (this.shouldLog("error")) {
      console.error(`[ERROR] ${message}`, meta);
      this.sendToMonitoring("error", message, meta);
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog("warn")) {
      console.warn(`[WARN] ${message}`, meta);
      this.sendToMonitoring("warn", message, meta);
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog("info")) {
      console.info(`[INFO] ${message}`, meta);
    }
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog("debug")) {
      console.debug(`[DEBUG] ${message}`, meta);
    }
  }

  private sendToMonitoring(level: string, _message: string, _meta?: any): void {
    // Send to error tracking service if configured
    if (monitoringConfig.errorTracking.enabled && level === "error") {
      // Example: Sentry.captureMessage(message, { extra: meta });
    }

    // Send to analytics if configured
    if (monitoringConfig.analytics.enabled) {
      // Example: Send error events to analytics
    }
  }
}

// Global logger instance
export const logger = Logger.getInstance();

// Request logging middleware helper
export const logRequest = (req: Request, res?: Response, duration?: number) => {
  const method = req.method;
  const url = req.url;
  const userAgent = req.headers.get("user-agent") || "unknown";
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  logger.info(`Request: ${method} ${url}`, {
    method,
    url,
    userAgent,
    ip,
    duration,
    status: res?.status,
  });
};

// Performance monitoring
export const monitorPerformance = () => {
  if (typeof window !== "undefined" && "performance" in window) {
    // Monitor long tasks
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          // Tasks longer than 50ms
          logger.warn("Long task detected", {
            duration: entry.duration,
            startTime: entry.startTime,
          });
        }
      }
    });

    observer.observe({ entryTypes: ["longtask"] });
  }
};

// Health check utilities
export const healthChecks = {
  async checkDatabase(): Promise<{
    status: "healthy" | "unhealthy";
    latency?: number;
  }> {
    const start = Date.now();
    try {
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();
      await prisma.$disconnect();
      return { status: "healthy", latency: Date.now() - start };
    } catch (error) {
      return { status: "unhealthy" };
    }
  },

  async checkAPI(): Promise<{ status: "healthy" | "unhealthy" }> {
    try {
      // Add your API health checks here
      return { status: "healthy" };
    } catch (error) {
      return { status: "unhealthy" };
    }
  },
};
