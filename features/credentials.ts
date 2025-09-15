import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Credential } from "@/lib/generated/prisma/browser";

export function useCredentials() {
  return useQuery({
    queryKey: ["credentials"],
    queryFn: async () => {
      const response = await api.get<Credential[]>("credentials");
      return response.data;
    },
  });
}

export function useIssueCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      subjectDid: string;
      type: string;
      claims: Record<string, any>;
    }) => {
      const response = await api.post<Credential>("credentials/issue", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
    },
  });
}

export function useImportCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentialJson: Record<string, any>) => {
      const response = await api.post("credentials/import", credentialJson);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
    },
  });
}

export function useRevokeCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentialId: string) => {
      const response = await api.post<Credential>(
        `credentials/${credentialId}/revoke`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
      queryClient.invalidateQueries({ queryKey: ["issued-credentials"] });
    },
  });
}

export function useIssuedCredentials() {
  return useQuery({
    queryKey: ["issued-credentials"],
    queryFn: async () => {
      const response = await api.get<Credential[]>("credentials/issued");
      return response.data;
    },
  });
}

export function useRevokedCredentials() {
  return useQuery({
    queryKey: ["revoked-credentials"],
    queryFn: async () => {
      const response = await api.get("credentials/revoked");
      return response.data;
    },
  });
}

export function useVerifyCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      credentialJson?: Record<string, any> | string;
      holderDid?: string;
      credentialType?: string;
    }) => {
      const response = await api.post("credentials/verify", data);
      return response.data;
    },
    onSuccess: () => {
      // Optionally invalidate related queries if needed
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
    },
  });
}
