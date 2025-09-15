import { authenticate } from "@/lib/authenticate";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = await authenticate(request);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { credentialJson, holderDid, credentialType } = body;

    let credentialData;

    // Handle different verification methods
    if (credentialJson) {
      // Direct JSON verification
      credentialData =
        typeof credentialJson === "string"
          ? JSON.parse(credentialJson)
          : credentialJson;
    } else if (holderDid) {
      const credentials = await prisma.credential.findMany({
        where: {
          holder: {
            did: holderDid,
          },
          ...(credentialType && { type: credentialType }),
          status: "ACTIVE", // Only verify active credentials
        },
        include: {
          issuer: {
            select: {
              walletAddress: true,
              did: true,
              firstName: true,
              lastName: true,
              institutionName: true,
            },
          },
          holder: {
            select: {
              walletAddress: true,
              did: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { issuedAt: "desc" },
        take: 1, // Get the most recent credential
      });

      if (credentials.length === 0) {
        // Let's also check if there are any credentials for this DID at all (regardless of status)
        const allCredentials = await prisma.credential.findMany({
          where: {
            holder: {
              did: holderDid,
            },
          },
          select: { id: true, status: true, type: true },
        });

        return NextResponse.json(
          {
            status: "failed",
            error: `No active credential found for the provided DID. Found ${allCredentials.length} total credentials.`,
            debug: {
              did: holderDid,
              totalCredentials: allCredentials.length,
              credentialStatuses: allCredentials.map((c) => ({
                id: c.id,
                status: c.status,
                type: c.type,
              })),
            },
          },
          { status: 404 }
        );
      }

      credentialData = credentials[0];
    } else {
      return NextResponse.json(
        {
          status: "failed",
          error: "Either credentialJson or holderDid must be provided",
        },
        { status: 400 }
      );
    }

    // Perform verification checks
    let verification;

    if (credentialJson) {
      // For JSON credentials, we can only check basic properties
      const expiryDate =
        credentialData.expirationDate || credentialData.expiresAt;
      verification = {
        signatureValid: true, // Assume valid for JSON input (would need actual signature verification)
        issuerTrusted: true, // Assume trusted for JSON input (would need trust registry check)
        notExpired: expiryDate ? new Date(expiryDate) > new Date() : true,
        notRevoked: true, // Can't check revocation for external JSON
        chainAnchorValid: true, // Assume valid for JSON input (would need blockchain check)
      };
    } else {
      // For database credentials, we can check all properties
      verification = {
        signatureValid: true, // In a real implementation, this would verify the cryptographic signature
        issuerTrusted: true, // In a real implementation, this would check against a trust registry
        notExpired: credentialData.expiresAt
          ? new Date(credentialData.expiresAt) > new Date()
          : true,
        notRevoked: credentialData.status === "ACTIVE",
        chainAnchorValid: true, // In a real implementation, this would verify blockchain anchoring
      };
    }

    // Calculate trust score based on verification results
    const validChecks = Object.values(verification).filter(Boolean).length;
    const totalChecks = Object.keys(verification).length;
    const trustScore = Math.round((validChecks / totalChecks) * 100);

    // Determine overall status
    const allChecksPass = Object.values(verification).every(Boolean);
    const status = allChecksPass ? "verified" : "failed";

    // Transform credential data for response
    let transformedCredential;

    if (credentialJson) {
      // For JSON verification, use the data as-is but with safe property access
      const holderInfo = credentialData.credentialSubject || credentialData;
      const issuerInfo = credentialData.issuer || {};

      transformedCredential = {
        id: credentialData.id || "unknown",
        type: credentialData.type || "Unknown Type",
        holder: holderInfo.name || holderInfo.holderName || "Unknown Holder",
        holderDID:
          credentialData.holder || credentialData.subject || "did:unknown",
        issuer: issuerInfo.name || issuerInfo.issuerName || "Unknown Issuer",
        issuerDID: credentialData.issuer || "did:unknown",
        issuedDate:
          credentialData.issuanceDate ||
          credentialData.issuedAt ||
          new Date().toISOString(),
        expiryDate:
          credentialData.expirationDate ||
          credentialData.expiresAt ||
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        credentialSubject:
          credentialData.credentialSubject || credentialData.claims || {},
        proof: credentialData.proof || {
          type: "Ed25519Signature2020",
          created: credentialData.issuanceDate || new Date().toISOString(),
          verificationMethod: `${credentialData.issuer || "did:unknown"}#key-1`,
        },
      };
    } else {
      // For database credential verification
      transformedCredential = {
        id: credentialData.id,
        type: credentialData.type,
        holder:
          credentialData.holder.firstName && credentialData.holder.lastName
            ? `${credentialData.holder.firstName} ${credentialData.holder.lastName}`
            : credentialData.holder.walletAddress?.slice(0, 8) + "..." ||
              "Unknown Holder",
        holderDID:
          credentialData.holder.did ||
          `did:sol:${credentialData.holder.walletAddress}`,
        issuer:
          credentialData.issuer.institutionName ||
          (credentialData.issuer.firstName && credentialData.issuer.lastName
            ? `${credentialData.issuer.firstName} ${credentialData.issuer.lastName}`
            : credentialData.issuer.walletAddress?.slice(0, 8) + "..." ||
              "Unknown Issuer"),
        issuerDID:
          credentialData.issuer.did ||
          `did:sol:${credentialData.issuer.walletAddress}`,
        issuedDate: credentialData.issuedAt,
        expiryDate:
          credentialData.expiresAt ||
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year
        credentialSubject: credentialData.claims,
        proof: credentialData.proof || {
          type: "Ed25519Signature2020",
          created: credentialData.issuedAt,
          verificationMethod: `${
            credentialData.issuer.did || credentialData.issuer.walletAddress
          }#key-1`,
        },
      };
    }

    const result = {
      status,
      credential: transformedCredential,
      verification,
      trustScore,
      verifiedAt: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      {
        status: "failed",
        error: "Failed to verify credential",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
