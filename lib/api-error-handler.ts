import { AxiosError } from "axios";
import { toast } from "sonner";

export interface ApiError {
  message: string;
  code?: string | undefined;
  status?: number | undefined;
  details?: Record<string, any> | undefined;
}

export class ApiErrorHandler {
  static handle(error: unknown, context?: string): ApiError {
    if (error instanceof AxiosError) {
      return this.handleAxiosError(error, context);
    }

    if (error instanceof Error) {
      return this.handleGenericError(error, context);
    }

    return this.handleUnknownError(error, context);
  }

  private static handleAxiosError(
    error: AxiosError,
    context?: string
  ): ApiError {
    const status = error.response?.status;
    const data = error.response?.data as any;

    let message = "An unexpected error occurred";
    let code = "UNKNOWN_ERROR";

    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        message = data?.message || "Invalid request data";
        code = "BAD_REQUEST";
        break;
      case 401:
        message = "Authentication required";
        code = "UNAUTHORIZED";
        break;
      case 403:
        message = "Access denied";
        code = "FORBIDDEN";
        break;
      case 404:
        message = data?.message || "Resource not found";
        code = "NOT_FOUND";
        break;
      case 409:
        message = data?.message || "Conflict with existing data";
        code = "CONFLICT";
        break;
      case 422:
        message = data?.message || "Validation failed";
        code = "VALIDATION_ERROR";
        break;
      case 429:
        message = "Too many requests. Please try again later";
        code = "RATE_LIMITED";
        break;
      case 500:
        message = "Internal server error";
        code = "INTERNAL_ERROR";
        break;
      case 502:
      case 503:
      case 504:
        message = "Service temporarily unavailable";
        code = "SERVICE_UNAVAILABLE";
        break;
      default:
        if (data?.message) {
          message = data.message;
        }
        if (data?.code) {
          code = data.code;
        }
    }

    const apiError: ApiError = {
      message: context ? `${context}: ${message}` : message,
      code,
      status,
      details: data,
    };

    // Show toast notification for user-facing errors
    this.showErrorToast(apiError);

    return apiError;
  }

  private static handleGenericError(error: Error, context?: string): ApiError {
    const apiError: ApiError = {
      message: context ? `${context}: ${error.message}` : error.message,
      code: "GENERIC_ERROR",
    };

    this.showErrorToast(apiError);
    return apiError;
  }

  private static handleUnknownError(
    error: unknown,
    context?: string
  ): ApiError {
    const message = context
      ? `${context}: An unknown error occurred`
      : "An unknown error occurred";

    const apiError: ApiError = {
      message,
      code: "UNKNOWN_ERROR",
      details: { originalError: error },
    };

    this.showErrorToast(apiError);
    return apiError;
  }

  private static showErrorToast(error: ApiError) {
    // Don't show toast for certain error types
    if (error.code === "UNAUTHORIZED" || error.code === "FORBIDDEN") {
      // These might be handled by auth redirects instead
      return;
    }

    toast.error(error.message || "Error");
  }
}

// React hook for handling API errors in components
export function useApiErrorHandler() {
  return (error: unknown, context?: string) => {
    return ApiErrorHandler.handle(error, context);
  };
}

// Utility function to check if error is a specific type
export function isApiError(error: unknown, code: string): boolean {
  if (!(error instanceof Error) || !("code" in error)) {
    return false;
  }
  return (error as ApiError).code === code;
}

// Utility function to get error message from various error types
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as any;
    return data?.message || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown error occurred";
}
