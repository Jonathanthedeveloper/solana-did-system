import { PrismaClient } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create sample users
  const holder = await prisma.user.upsert({
    where: { walletAddress: "HOLDER_WALLET_ADDRESS" },
    update: {},
    create: {
      walletAddress: "HOLDER_WALLET_ADDRESS",
      did: "did:solana:holder123",
      role: "HOLDER",
      firstName: "John",
      lastName: "Holder",
    },
  });

  const verifier = await prisma.user.upsert({
    where: { walletAddress: "VERIFIER_WALLET_ADDRESS" },
    update: {},
    create: {
      walletAddress: "VERIFIER_WALLET_ADDRESS",
      did: "did:solana:verifier123",
      role: "VERIFIER",
      firstName: "Jane",
      lastName: "Verifier",
      institutionName: "Sample University",
    },
  });

  // Create sample credentials
  const credential = await prisma.credential.upsert({
    where: { id: "sample-credential-id" },
    update: {},
    create: {
      id: "sample-credential-id",
      type: "UniversityDegree",
      issuerDid: "did:solana:verifier123",
      subjectDid: "did:solana:holder123",
      issuerId: verifier.id,
      holderId: holder.id,
      status: "ACTIVE",
      claims: {
        degree: "Bachelor of Science",
        major: "Computer Science",
        university: "Sample University",
        graduationYear: 2024,
      },
    },
  });

  // Create sample proof request
  const proofRequest = await prisma.proofRequest.upsert({
    where: { id: "sample-proof-request-id" },
    update: {},
    create: {
      id: "sample-proof-request-id",
      title: "University Degree Verification",
      description: "Please provide your university degree for verification",
      verifierId: verifier.id,
      status: "ACTIVE",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      requestedTypesJson: JSON.stringify(["UniversityDegree"]),
      targetHoldersJson: null, // Broadcast to all holders
    },
  });

  console.log("Sample data created:", {
    holder,
    verifier,
    credential,
    proofRequest,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
