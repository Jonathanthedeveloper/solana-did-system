// Global error handler for production
export class ErrorReporter {
  private static instance: ErrorReporter;
  private errors: Error[] = [];
  private maxErrors = 100;

  static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  report(error: Error, context?: Record<string, any>) {
    const errorReport = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "server",
      url: typeof window !== "undefined" ? window.location.href : "server",
    };

    // Add to local error buffer
    this.errors.push(error);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error Report:", errorReport);
    }

    // In production, you would send to error tracking service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    this.sendToErrorTracking(errorReport);
  }

  private sendToErrorTracking(errorReport: any) {
    // Placeholder for error tracking service integration
    // Example implementations:

    // Sentry
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(errorReport.error, {
    //     extra: errorReport.context,
    //   });
    // }

    // LogRocket
    // if (typeof window !== 'undefined' && window.LogRocket) {
    //   window.LogRocket.captureException(errorReport.error);
    // }

    // For now, just store locally
    if (typeof window !== "undefined") {
      const existingErrors = JSON.parse(
        localStorage.getItem("errorReports") || "[]"
      );
      existingErrors.push(errorReport);
      localStorage.setItem(
        "errorReports",
        JSON.stringify(existingErrors.slice(-10))
      );
    }
  }

  getRecentErrors() {
    return this.errors.slice(-10);
  }

  clearErrors() {
    this.errors = [];
  }
}

// Global error handler
export const globalErrorHandler = (
  error: Error,
  context?: Record<string, any>
) => {
  ErrorReporter.getInstance().report(error, context);
};

// React Error Boundary with enhanced reporting
export const reportError = (error: Error, errorInfo?: any) => {
  const context = {
    componentStack: errorInfo?.componentStack,
    errorBoundary: true,
  };
  globalErrorHandler(error, context);
};

// Utility to handle async errors
export const handleAsyncError = (error: any, context?: string) => {
  const normalizedError =
    error instanceof Error ? error : new Error(String(error));
  globalErrorHandler(normalizedError, { context, async: true });
};

// API error handler
export const handleApiError = (error: any, endpoint?: string) => {
  const context = {
    endpoint,
    status: error?.response?.status,
    api: true,
  };
  globalErrorHandler(error, context);
};
