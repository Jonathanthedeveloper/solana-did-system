import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export function useDID(did?: string) {
  return useQuery({
    queryKey: ["did", did],
    queryFn: async () => {
      if (!did) throw new Error("DID required");
      const response = await api.get(`did/${encodeURIComponent(did)}`);
      return response.data;
    },
    enabled: !!did,
  });
}

export function useMyDID(walletAddress?: string) {
  return useQuery({
    queryKey: ["my-did", walletAddress],
    queryFn: async () => {
      if (!walletAddress) throw new Error("Wallet address required");
      const did = `did:solana:${walletAddress}`;
      const response = await api.get(`did/${encodeURIComponent(did)}`);
      return response.data;
    },
    enabled: !!walletAddress,
  });
}
