import { authenticate } from "@/lib/authenticate";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = await authenticate(request);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { subjectDid, type, claims } = body;

  // Parse subject DID to get wallet address
  const didParts = subjectDid.split(":");
  if (
    didParts.length !== 3 ||
    didParts[0] !== "did" ||
    didParts[1] !== "solana"
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid subject DID format. Expected: did:solana:<walletAddress>",
      },
      { status: 400 }
    );
  }

  const subjectWalletAddress = didParts[2];

  // Find subject user by wallet address
  const subjectUser = await prisma.user.findUnique({
    where: { walletAddress: subjectWalletAddress },
  });

  if (!subjectUser) {
    return NextResponse.json(
      {
        error:
          "Subject user not found. Please ensure the recipient has connected their wallet.",
      },
      { status: 404 }
    );
  }

  // Generate issuer DID from wallet address
  const issuerDid = `did:solana:${user.walletAddress}`;

  // Create credential
  const credential = await prisma.credential.create({
    data: {
      type,
      issuerDid,
      subjectDid,
      issuerId: user.id,
      holderId: subjectUser.id,
      claims,
    },
  });

  return NextResponse.json(credential);
}
