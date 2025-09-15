import { authenticate } from "@/lib/authenticate";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Params = { id: string };

export async function POST(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const user = await authenticate(request);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id: credentialId } = await context.params;

  const credential = await prisma.credential.findUnique({
    where: { id: credentialId },
  });

  if (!credential) {
    return NextResponse.json(
      { error: "Credential not found" },
      { status: 404 }
    );
  }

  if (credential.issuerId !== user.id) {
    return NextResponse.json(
      { error: "Not authorized to revoke this credential" },
      { status: 403 }
    );
  }

  const updatedCredential = await prisma.credential.update({
    where: { id: credentialId },
    data: {
      status: "REVOKED",
      revokedAt: new Date(),
    },
  });

  return NextResponse.json(updatedCredential);
}
