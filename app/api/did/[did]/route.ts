import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ did: string }> }
) {
  const { did } = await params;

  // Parse DID: did:solana:<publicKey>
  const parts = did.split(":");
  if (parts.length !== 3 || parts[0] !== "did" || parts[1] !== "solana") {
    return NextResponse.json({ error: "Invalid DID format" }, { status: 400 });
  }

  const publicKey = parts[2];

  if (!publicKey) {
    return NextResponse.json(
      { error: "Invalid DID public key" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress: publicKey! },
    include: {
      credentials: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "DID not found" }, { status: 404 });
  }

  // Create DID Document according to W3C spec
  const didDocument = {
    "@context": "https://www.w3.org/ns/did/v1",
    id: did,
    controller: did,
    verificationMethod: [
      {
        id: `${did}#key-1`,
        type: "Ed25519VerificationKey2018",
        controller: did,
        publicKeyBase58: publicKey,
      },
    ],
    authentication: [`${did}#key-1`],
    assertionMethod: [`${did}#key-1`],
    service: [
      {
        id: `${did}#solana-service`,
        type: "SolanaService",
        serviceEndpoint: `https://explorer.solana.com/address/${publicKey}`,
      },
    ],
  };

  return NextResponse.json(didDocument);
}
