import { authenticate } from "@/lib/authenticate";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = await authenticate(request);
  if (!user) return new Response("Unauthorized", { status: 401 });

  try {
    const body = await request.json();
    // Expected body: { credential, verification, trustScore, verifiedAt }
    const { credential, verification, trustScore, verifiedAt } = body;

    // We only persist verifications for credentials that exist in our DB (have an id)
    const credentialId = credential?.id;
    if (!credentialId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot save reports for external JSON credentials without an internal credential id.",
        },
        { status: 400 }
      );
    }

    const status =
      verification && Object.values(verification).every(Boolean)
        ? "VERIFIED"
        : "FAILED";
    const failureReason =
      status === "FAILED" ? JSON.stringify({ verification, trustScore }) : null;

    const created = await prisma.verification.create({
      data: {
        credential: { connect: { id: credentialId } },
        verifier: { connect: { id: user.id } },
        status: status as any,
        verifiedAt: verifiedAt ? new Date(verifiedAt) : new Date(),
        failureReason: failureReason,
      },
    });

    return NextResponse.json({ success: true, verification: created });
  } catch (error) {
    console.error("Save verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
