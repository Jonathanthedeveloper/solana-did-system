import { prisma } from "./prisma";

export async function authenticate(request: Request) {
  const headers = new Headers(request.headers);
  const walletAddress = headers.get("x-wallet-address");

  if (!walletAddress) return null;

  const user = await prisma.user.findUnique({
    where: { walletAddress: walletAddress! },
  });

  return user;
}
