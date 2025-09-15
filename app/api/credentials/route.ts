import { authenticate } from "@/lib/authenticate";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await authenticate(request);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const credentials = await prisma.credential.findMany({
    where: {
      OR: [{ holderId: user.id }, { issuerId: user.id }],
    },
    include: {
      issuer: { select: { walletAddress: true, did: true } },
      holder: { select: { walletAddress: true, did: true } },
    },
  });

  // Transform to match component expectations
  const transformedCredentials = credentials.map((cred) => ({
    id: cred.id,
    title: cred.type,
    issuer: cred.issuerDid || cred.issuer.walletAddress,
    type: cred.type,
    status: cred.status,
    issuedDate: cred.issuedAt,
    expiryDate:
      cred.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year if not set
    credentialSubject: cred.claims,
    proof: cred.proof || {
      type: "Ed25519Signature2020",
      created: cred.issuedAt,
      verificationMethod: `${
        cred.issuerDid || cred.issuer.walletAddress
      }#key-1`,
    },
  }));

  return NextResponse.json(transformedCredentials);
}
