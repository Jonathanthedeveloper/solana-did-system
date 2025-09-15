import { authenticate } from "@/lib/authenticate";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await authenticate(request);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Get all credentials issued by this user
  const issuedCredentials = await prisma.credential.findMany({
    where: {
      issuerId: user.id,
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
      issuedAt: "desc",
    },
  });

  // Transform to match component expectations
  const transformedCredentials = issuedCredentials.map((cred) => ({
    id: cred.id,
    type: cred.type,
    recipient:
      cred.holder.firstName && cred.holder.lastName
        ? `${cred.holder.firstName} ${cred.holder.lastName}`
        : cred.holder.username ||
          `User ${cred.holder.walletAddress?.slice(0, 8)}...`,
    recipientDID: cred.subjectDid,
    status: cred.status.toLowerCase(),
    issuedDate: cred.issuedAt.toISOString().split("T")[0], // Format as YYYY-MM-DD
    expiryDate: cred.expiresAt
      ? cred.expiresAt.toISOString().split("T")[0]
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // Default 1 year
    verificationCount: cred.verifications?.length ?? 0,
    lastVerified:
      (cred.verifications?.length ?? 0) > 0 && cred.verifications[0]?.verifiedAt
        ? cred.verifications[0].verifiedAt.toISOString().split("T")[0]
        : null,
    credentialHash: cred.id, // Using ID as hash for now
    template: cred.type, // Using type as template for now
  }));

  return NextResponse.json(transformedCredentials);
}
