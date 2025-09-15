import { authenticate } from "@/lib/authenticate";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = await authenticate(request);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();

  // Expect a full credential JSON following W3C VC shape
  const {
    type,
    issuer,
    issuanceDate,
    expirationDate,
    credentialSubject,
    proof,
  } = body;

  // Attempt to extract issuer DID or wallet
  const issuerDid =
    typeof issuer === "string" ? issuer : issuer?.id || issuer?.did || null;

  // Create or find issuer user record if possible (best-effort)
  let issuerUser = null;
  if (issuerDid) {
    // Try to find by DID first
    issuerUser = await prisma.user.findUnique({ where: { did: issuerDid } });

    // If not found and it's a Solana DID, try to find by wallet address
    if (!issuerUser && issuerDid.startsWith("did:solana:")) {
      const walletAddress = issuerDid.split(":")[2];
      issuerUser = await prisma.user.findUnique({ where: { walletAddress } });
    }
  }

  const payload = {
    type: Array.isArray(type)
      ? type[1] || type[0]
      : type || "ImportedCredential",
    issuerDid: issuerDid || undefined,
    subjectDid: user.did || `did:solana:${user.walletAddress}`,
    issuerId: issuerUser?.id || user.id, // if we couldn't find issuer, mark current user as issuerId to satisfy relation; holder will be the authenticated user below
    holderId: user.id,
    claims: credentialSubject || {},
    proof: proof || {},
  };

  const credential = await prisma.credential.create({
    data: {
      ...payload,
      ...(issuanceDate ? { issuedAt: new Date(issuanceDate) } : {}),
      ...(expirationDate ? { expiresAt: new Date(expirationDate) } : {}),
    },
  });

  return NextResponse.json(credential);
}
