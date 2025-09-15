import { authenticate } from "@/lib/authenticate";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await authenticate(request);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Return proof responses belonging to the authenticated holder
  const responses = await prisma.proofResponse.findMany({
    where: {
      holderId: user.id,
    },
    include: {
      proofRequest: {
        select: {
          id: true,
          title: true,
          description: true,
        },
      },
      holder: {
        select: { walletAddress: true, did: true },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  // Normalize shape for frontend
  const transformed = responses.map((r) => ({
    id: r.id,
    proofRequestId: r.proofRequestId,
    status: r.status,
    submittedAt: r.submittedAt,
    holder: r.holder,
    proofRequest: r.proofRequest,
    presentedCredentials: r.presentedCredentialsJson
      ? JSON.parse(r.presentedCredentialsJson)
      : [],
    proofData: r.proofData || null,
  }));

  return NextResponse.json(transformed);
}

export async function POST(request: Request) {
  const user = await authenticate(request);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const {
    proofRequestId,
    presentedCredentials,
    status = "SUBMITTED",
  } = await request.json();

  if (!proofRequestId) {
    return NextResponse.json(
      { error: "proofRequestId is required" },
      { status: 400 }
    );
  }

  // Check if proof request exists and is active
  const proofRequest = await prisma.proofRequest.findUnique({
    where: { id: proofRequestId },
  });

  if (!proofRequest) {
    return NextResponse.json(
      { error: "Proof request not found" },
      { status: 404 }
    );
  }

  if (proofRequest.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Proof request is not active" },
      { status: 400 }
    );
  }

  if (proofRequest.expiresAt && new Date() > proofRequest.expiresAt) {
    return NextResponse.json(
      { error: "Proof request has expired" },
      { status: 400 }
    );
  }

  // Check if user already responded
  const existingResponse = await prisma.proofResponse.findUnique({
    where: {
      proofRequestId_holderId: {
        proofRequestId,
        holderId: user.id,
      },
    },
  });

  if (existingResponse) {
    return NextResponse.json(
      { error: "Already responded to this proof request" },
      { status: 400 }
    );
  }

  // Create the proof response
  const proofResponse = await prisma.proofResponse.create({
    data: {
      proofRequestId,
      holderId: user.id,
      status: status as any,
      presentedCredentialsJson: presentedCredentials
        ? JSON.stringify(presentedCredentials)
        : "[]",
    },
  });

  // Fetch the created response with relations
  const responseWithRelations = await prisma.proofResponse.findUnique({
    where: { id: proofResponse.id },
    include: {
      proofRequest: {
        select: {
          id: true,
          title: true,
          description: true,
        },
      },
      holder: {
        select: { walletAddress: true, did: true },
      },
    },
  });

  if (!responseWithRelations) {
    return NextResponse.json(
      { error: "Failed to create response" },
      { status: 500 }
    );
  }

  // Transform response for frontend
  const transformed = {
    id: responseWithRelations.id,
    proofRequestId: responseWithRelations.proofRequestId,
    status: responseWithRelations.status,
    submittedAt: responseWithRelations.submittedAt,
    holder: responseWithRelations.holder,
    proofRequest: responseWithRelations.proofRequest,
    presentedCredentials: responseWithRelations.presentedCredentialsJson
      ? JSON.parse(responseWithRelations.presentedCredentialsJson)
      : [],
    proofData: responseWithRelations.proofData || null,
  };

  return NextResponse.json(transformed);
}
