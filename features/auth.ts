import api from "@/lib/axios";
import { User } from "@/lib/generated/prisma/browser";
import { AuthSchema } from "@/lib/schema";
import { useMutation } from "@tanstack/react-query";

export function useAuthenticateWallet() {
  return useMutation({
    mutationKey: ["authenticateWallet"],
    mutationFn: async (data: AuthSchema) => {
      const res = await api.post<User>("auth", data);
      return res.data;
    },
  });
}
