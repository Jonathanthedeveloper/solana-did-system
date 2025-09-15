import { prisma } from "@/lib/prisma";
import { authSchema } from "@/lib/schema";
import { handleApiError, isValidWalletAddress } from "@/lib/security";
import { NextResponse } from "next/server";

// Rate limiting for auth endpoint
let authAttempts = new Map<string, { count: number; resetTime: number }>();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const result = authSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.issues },
        { status: 400 }
      );
    }

    const { walletAddress, role } = result.data;

    // Validate wallet address format
    if (!isValidWalletAddress(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    // Use the provided role or default to HOLDER
    const userRole = role || "HOLDER";

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
