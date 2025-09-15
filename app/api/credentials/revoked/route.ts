import { authenticate } from "@/lib/authenticate";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await authenticate(request);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Get all revoked credentials issued by this user
  const revokedCredentials = await prisma.credential.findMany({
    where: {
      issuerId: user.id,
      status: "REVOKED",
    },
    include: {
      holder: {
        select: {
          walletAddress: true,
          did: true,
          firstName: true,
          lastName: true,
          username: true,
        },
      },
      verifications: {
        select: {
          id: true,
          verifiedAt: true,
        },
        orderBy: {
          verifiedAt: "desc",
        },
      },
    },
    orderBy: {
      revokedAt: "desc",
    },
  });

  // Transform to match component expectations
  const transformedCredentials = revokedCredentials.map((cred) => ({
    id: cred.id,
    type: cred.type,
    recipient:
      cred.holder.firstName && cred.holder.lastName
        ? `${cred.holder.firstName} ${cred.holder.lastName}`
        : cred.holder.username ||
          `User ${cred.holder.walletAddress?.slice(0, 8)}...`,
    recipientDID: cred.subjectDid,
    issuedDate: cred.issuedAt.toISOString().split("T")[0], // Format as YYYY-MM-DD
    revokedDate: cred.revokedAt
      ? cred.revokedAt.toISOString().split("T")[0]
      : null,
    reason: cred.revocationReason || "No reason provided",
    revokedBy: "System", // For now, we'll use "System" as the revoker
    credentialHash: cred.id, // Using ID as hash for now
    verificationCount: cred.verifications.length,
    lastVerified:
      cred.verifications?.[0]?.verifiedAt?.toISOString().split("T")[0] ?? null,
  }));

  return NextResponse.json(transformedCredentials);
}
