import { NextRequest, NextResponse } from "next/server";
import { globalErrorHandler } from "./error-reporter";

// Security headers middleware
export function securityHeaders() {
  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://api.mainnet-beta.solana.com https://api.devnet.solana.com",
    "frame-ancestors 'none'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  return response;
}

// Rate limiting (basic implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  request: NextRequest,
  maxRequests = 100,
  windowMs = 15 * 60 * 1000
) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const now = Date.now();
  const windowStart = now - windowMs;

  const userRequests = rateLimitMap.get(ip);

  if (!userRequests || userRequests.resetTime < windowStart) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return NextResponse.next();
  }

  if (userRequests.count >= maxRequests) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": Math.ceil(
          (userRequests.resetTime - now) / 1000
        ).toString(),
      },
    });
  }

  userRequests.count++;
  return NextResponse.next();
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

// Validate wallet address
export function isValidWalletAddress(address: string): boolean {
  // Basic Solana address validation (32 bytes, base58 encoded)
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

// API error handler
export const handleApiError = (error: any, endpoint?: string) => {
  const context = {
    endpoint,
    status: error?.response?.status,
    api: true,
  };
  globalErrorHandler(error, context);
};

// Security utilities
export const securityUtils = {
  // Generate secure random string
  generateSecureToken(length = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  },

  // Hash sensitive data (for logging, not passwords)
  hashData(data: string): string {
    // Simple hash for logging purposes - not for passwords
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  },

  // Validate API key format (if used)
  isValidApiKey(key: string): boolean {
    return /^[a-zA-Z0-9_-]{20,}$/.test(key);
  },
};
