import api from "@/lib/axios";
import { Prisma } from "@/lib/generated/prisma/browser";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Profile = Prisma.UserGetPayload<{
  include: {
    credentials: true;
    verifications: true;
  };
}>;

export function useProfile() {
  const wallet = useWallet();
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get<Profile>("profile");
      return response.data;
    },
    enabled: !!wallet.connected && !!wallet.publicKey,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: any) => {
      const response = await api.put<Profile>("profile", profileData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
