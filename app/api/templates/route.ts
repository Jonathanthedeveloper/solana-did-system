import { authenticate } from "@/lib/authenticate";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { templateSchema } from "@/lib/validation/template";

export async function GET(request: Request) {
  const user = await authenticate(request);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const templates = await prisma.credentialTemplate.findMany({
    where: {
      createdById: user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const user = await authenticate(request);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const parse = templateSchema.safeParse(body);
  if (!parse.success) {
    return new Response(JSON.stringify({ error: parse.error.issues }), {
      status: 400,
    });
  }

  const { name, category, description, schema } = parse.data;

  const template = await prisma.credentialTemplate.create({
    data: {
      name,
      category,
      description: description ?? null,
      schema,
      createdById: user.id,
    },
  });

  return NextResponse.json(template);
}
