import { authenticate } from "@/lib/authenticate";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const user = await authenticate(request);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Return all holders (basic profile) - in a real app this should be paginated
  const users = await prisma.user.findMany({
    where: { role: { equals: "HOLDER" } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      walletAddress: true,
      institutionName: true,
      did: true,
    },
    orderBy: { firstName: "asc" },
  });

  return NextResponse.json(users);
}
