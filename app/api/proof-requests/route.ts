import { authenticate } from "@/lib/authenticate";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const user = await authenticate(request);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const proofRequests = await prisma.proofRequest.findMany({
    where: {
      verifierId: user.id,
    },
    include: {
      responses: {
        include: {
          holder: { select: { walletAddress: true, did: true } },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transform to include requestedTypes as array
  const transformedRequests = proofRequests.map((req) => ({
    ...req,
    requestedTypes: JSON.parse(req.requestedTypesJson),
    targetHolders: req.targetHoldersJson
      ? JSON.parse(req.targetHoldersJson)
      : null,
  }));

  return NextResponse.json(transformedRequests);
}

export async function POST(request: NextRequest) {
  const user = await authenticate(request);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const {
    title,
    description,
    requestedTypes,
    expiresAt,
    requirements,
    targetHolders,
  } = await request.json();

  if (!title || !requestedTypes || requestedTypes.length === 0) {
    return new Response("Missing required fields", { status: 400 });
  }

  const proofRequest = await prisma.proofRequest.create({
    data: {
      title,
      description,
      verifierId: user.id,
      requestedTypesJson: JSON.stringify(requestedTypes),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      requirements,
      targetHoldersJson: targetHolders ? JSON.stringify(targetHolders) : null,
    },
  });

  return NextResponse.json({
    ...proofRequest,
    requestedTypes: JSON.parse(proofRequest.requestedTypesJson),
  });
}
