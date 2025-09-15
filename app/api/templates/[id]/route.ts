import { authenticate } from "@/lib/authenticate";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { templateSchema } from "@/lib/validation/template";

type Params = { id: string };

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const paramsPromise = context.params;
  const { id } = await paramsPromise;
  const user = await authenticate(request);
  if (!user) return new Response("Unauthorized", { status: 401 });
  const template = await prisma.credentialTemplate.findUnique({
    where: { id },
  });

  if (!template) return new Response("Not found", { status: 404 });

  if (template.createdById !== user.id)
    return new Response("Forbidden", { status: 403 });

  return NextResponse.json(template);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const paramsPromise = context.params;
  const { id } = await paramsPromise;
  const user = await authenticate(request);
  if (!user) return new Response("Unauthorized", { status: 401 });
  const body = await request.json();

  const template = await prisma.credentialTemplate.findUnique({
    where: { id },
  });
  if (!template) return new Response("Not found", { status: 404 });
  if (template.createdById !== user.id)
    return new Response("Forbidden", { status: 403 });

  const parse = templateSchema.safeParse(body);
  if (!parse.success) {
    return new Response(JSON.stringify({ error: parse.error.issues }), {
      status: 400,
    });
  }

  const { name, category, description, schema } = parse.data;

  const updated = await prisma.credentialTemplate.update({
    where: { id },
    data: {
      name: name ?? template.name,
      category: category ?? template.category,
      description: description ?? template.description,
      schema: schema ?? template.schema,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const paramsPromise = context.params;
  const { id } = await paramsPromise;
  const user = await authenticate(request);
  if (!user) return new Response("Unauthorized", { status: 401 });
  const template = await prisma.credentialTemplate.findUnique({
    where: { id },
  });
  if (!template) return new Response("Not found", { status: 404 });
  if (template.createdById !== user.id)
    return new Response("Forbidden", { status: 403 });

  await prisma.credentialTemplate.delete({ where: { id } });

  return new Response(null, { status: 204 });
}
