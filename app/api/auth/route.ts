import { prisma } from "@/lib/prisma";
import { authSchema } from "@/lib/schema";
import { handleApiError, isValidWalletAddress } from "@/lib/security";
import { NextResponse } from "next/server";

// Rate limiting for auth endpoint
let authAttempts = new Map<string, { count: number; resetTime: number }>();

function checkAuthRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const attempts = authAttempts.get(ip);

  if (!attempts || attempts.resetTime < now) {
    authAttempts.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (attempts.count >= maxAttempts) {
    return false;
  }

  attempts.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    // Get client IP for rate limiting
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Check rate limit
    if (!checkAuthRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many authentication attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Validate request body
    const result = authSchema.safeParse(body);
    if (!result.success) {
      console.warn(`Invalid auth request from ${ip}:`, result.error);
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.issues },
        { status: 400 }
      );
    }

    const { walletAddress, role } = result.data;

    // Validate wallet address format
    if (!isValidWalletAddress(walletAddress)) {
      console.warn(`Invalid wallet address from ${ip}:`, walletAddress);
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    // Use the provided role or default to HOLDER
    const userRole = role || "HOLDER";

    // Log authentication attempt (without sensitive data)
    console.log(
      `Auth attempt for wallet: ${walletAddress.slice(0, 8)}... from ${ip}`
    );

    // Verify the signature here (omitted for brevity)
    // TODO: Implement proper signature verification

    const user = await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { walletAddress },
        update: {
          updatedAt: new Date(),
        },
        create: {
          walletAddress,
          did: `did:solana:${walletAddress}`,
          role: userRole as any,
        },
      });
      return user;
    });

    // Log successful authentication
    console.log(`User authenticated: ${user.id} (${user.role})`);

    return NextResponse.json({
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        role: user.role,
        did: user.did,
      },
    });
  } catch (error) {
    console.error("Auth API error:", error);
    handleApiError(error, "/api/auth");

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of authAttempts.entries()) {
    if (data.resetTime < now) {
      authAttempts.delete(ip);
    }
  }
}, 60 * 1000); // Clean up every minute
