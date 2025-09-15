// Performance optimization utilities
import React from "react";
export const performanceConfig = {
  // React Query configuration for production
  reactQuery: {
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: (failureCount: number, error: any) => {
          // Don't retry on 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          return failureCount < 3;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
      mutations: {
        retry: 1,
      },
    },
  },

  // Image optimization settings
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp", "image/avif"],
  },

  // Bundle analysis
  bundleAnalyzer: {
    enabled: process.env["ANALYZE"] === "true",
    openAnalyzer: false,
  },
};

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(label, duration);
    };
  }

  recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(value);

    // Keep only last 100 measurements
    const measurements = this.metrics.get(label)!;
    if (measurements.length > 100) {
      measurements.shift();
    }
  }

  getMetrics(
    label: string
  ): { avg: number; min: number; max: number; count: number } | null {
    const measurements = this.metrics.get(label);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const sum = measurements.reduce((a, b) => a + b, 0);
    return {
      avg: sum / measurements.length,
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      count: measurements.length,
    };
  }

  getAllMetrics(): Record<
    string,
    { avg: number; min: number; max: number; count: number }
  > {
    const result: Record<
      string,
      { avg: number; min: number; max: number; count: number }
    > = {};
    for (const [label, measurements] of this.metrics.entries()) {
      if (measurements.length > 0) {
        const sum = measurements.reduce((a, b) => a + b, 0);
        result[label] = {
          avg: sum / measurements.length,
          min: Math.min(...measurements),
          max: Math.max(...measurements),
          count: measurements.length,
        };
      }
    }
    return result;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Web Vitals tracking
export const trackWebVitals = (metric: any) => {
  if (typeof window !== "undefined" && "gtag" in window) {
    // Google Analytics tracking
    (window as any).gtag("event", metric.name, {
      event_category: "Web Vitals",
      event_label: metric.id,
      value: Math.round(metric.value),
      non_interaction: true,
    });
  }

  // Log to performance monitor
  PerformanceMonitor.getInstance().recordMetric(
    `web-vitals-${metric.name}`,
    metric.value
  );
};

// Lazy loading helper
export const lazyLoad = (
  importFunc: () => Promise<any>,
  fallback: React.ComponentType = () => null
) => {
  return React.lazy(() => importFunc().catch(() => ({ default: fallback })));
};

// Preload critical resources
export const preloadCriticalResources = () => {
  if (typeof window !== "undefined") {
    // Preload critical fonts
    const fontLink = document.createElement("link");
    fontLink.rel = "preload";
    fontLink.href = "/fonts/critical-font.woff2";
    fontLink.as = "font";
    fontLink.type = "font/woff2";
    fontLink.crossOrigin = "anonymous";
    document.head.appendChild(fontLink);
  }
};
