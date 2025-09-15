import { authenticate } from "@/lib/authenticate";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await authenticate(request);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Get proof requests that are active and user hasn't responded to
  // Either broadcast requests (targetHoldersJson is null) or requests targeted at this user
  const availableRequests = await prisma.proofRequest.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: {
        gte: new Date(),
      },
      NOT: {
        responses: {
          some: {
            holderId: user.id,
          },
        },
      },
      OR: [
        { targetHoldersJson: null }, // Broadcast requests
        {
          targetHoldersJson: {
            contains: user.id, // Requests targeted at this user
          },
        },
      ],
    },
    include: {
      verifier: {
        select: {
          walletAddress: true,
          did: true,
          firstName: true,
          lastName: true,
          institutionName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transform to include requestedTypes as array
  const transformedRequests = availableRequests.map((req) => ({
    ...req,
    requestedTypes: JSON.parse(req.requestedTypesJson),
    targetHolders: req.targetHoldersJson
      ? JSON.parse(req.targetHoldersJson)
      : null,
  }));

  return NextResponse.json(transformedRequests);
}
