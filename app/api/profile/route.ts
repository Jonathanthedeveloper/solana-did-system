import { authenticate } from "@/lib/authenticate";
import { UserRole } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        credentials: {
          where: { status: "ACTIVE" },
        },
        issuedCredentials: {
          where: { status: "ACTIVE" },
        },
        verifications: {
          where: { status: "VERIFIED" },
        },
      },
    });

    if (!profile) {
      return new Response("Profile not found", { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await authenticate(request);

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const {
      username,
      email,
      firstName,
      lastName,
      bio,
      avatar,
      institutionName,
      institutionType,
      institutionWebsite,
      institutionAddress,
      position,
      department,
      emailNotifications,
      pushNotifications,
      autoAcceptFromTrusted,
      dataMinimization,
    } = body;

    // Validate required fields based on user roles
    const userWithRoles = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!userWithRoles) {
      return new Response("User not found", { status: 404 });
    }

    const isIssuer = user.role === UserRole.ISSUER;
    const isVerifier = user.role === UserRole.VERIFIER;

    // Validate institution fields for issuers and verifiers
    if ((isIssuer || isVerifier) && !institutionName) {
      return NextResponse.json(
        { error: "Institution name is required for issuers and verifiers" },
        { status: 400 }
      );
    }

    const updatedProfile = await prisma.user.update({
      where: { id: user.id },
      data: {
        username,
        email,
        firstName,
        lastName,
        bio,
        avatar,
        institutionName,
        institutionType,
        institutionWebsite,
        institutionAddress,
        position,
        department,
        emailNotifications,
        pushNotifications,
        autoAcceptFromTrusted,
        dataMinimization,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error updating profile:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
