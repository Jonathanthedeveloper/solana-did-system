import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/database";

export async function GET() {
  try {
    // Check database health
    const dbHealth = await checkDatabaseHealth();

    // Check API responsiveness
    const apiHealth = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    // Overall health status
    const overallStatus =
      dbHealth.status === "healthy" && apiHealth.status === "healthy"
        ? "healthy"
        : "unhealthy";

    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        api: apiHealth,
      },
      environment: {
        nodeVersion: process.version,
        environment: process.env.NODE_ENV,
        uptime: process.uptime(),
      },
    };

    return NextResponse.json(healthData, {
      status: overallStatus === "healthy" ? 200 : 503,
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      },
      { status: 503 }
    );
  }
}
