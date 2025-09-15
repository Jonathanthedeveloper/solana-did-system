import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useProofRequests() {
  return useQuery({
    queryKey: ["proof-requests"],
    queryFn: async () => {
      const response = await api.get("proof-requests");
      return response.data;
    },
  });
}

export function useCreateProofRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      requestedTypes: string[];
      expiresAt?: string;
      requirements?: any;
      targetHolders?: string[]; // Array of holder user IDs to target
    }) => {
      const response = await api.post("proof-requests", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proof-requests"] });
    },
  });
}

export function useAvailableProofRequests() {
  return useQuery({
    queryKey: ["available-proof-requests"],
    queryFn: async () => {
      const response = await api.get("proof-requests/available");
      return response.data;
    },
  });
}

export function useProofResponses() {
  return useQuery({
    queryKey: ["proof-responses"],
    queryFn: async () => {
      const response = await api.get("proof-responses");
      return response.data;
    },
  });
}

export function useRespondToProofRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      proofRequestId: string;
      presentedCredentials: string[];
      proofData?: any;
    }) => {
      const response = await api.post("proof-responses", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-proof-requests"] });
      queryClient.invalidateQueries({ queryKey: ["proof-responses"] });
    },
  });
}

export function useDeclineProofRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { proofRequestId: string }) => {
      const response = await api.post("proof-responses", {
        ...data,
        status: "REJECTED",
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-proof-requests"] });
      queryClient.invalidateQueries({ queryKey: ["proof-responses"] });
    },
  });
}

export function useUpdateProofResponse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; status: string }) => {
      const response = await api.patch("proof-responses", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proof-requests"] });
    },
  });
}

export function useHolders() {
  return useQuery({
    queryKey: ["holders"],
    queryFn: async () => {
      const response = await api.get("users");
      return response.data;
    },
  });
}
