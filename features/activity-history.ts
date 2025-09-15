import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useProfile } from "./profile";
import { UserRole } from "@/lib/generated/prisma/enums";

export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  actor: string;
  target: string;
  timestamp: string;
  status: string;
  details?: any;
}

export function useActivityHistory() {
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ["activity-history", profile?.id],
    queryFn: async (): Promise<Activity[]> => {
      if (!profile) return [];

      const activities: Activity[] = [];

      try {
        // Fetch proof requests created by this user
        const proofRequestsResponse = await api.get("proof-requests");
        const proofRequests = proofRequestsResponse.data || [];

        proofRequests.forEach((request: any) => {
          activities.push({
            id: `proof-request-${request.id}`,
            type: "proof_request_created",
            title: "Proof Request Created",
            description:
              request.description || `Created proof request: ${request.title}`,
            actor: profile.firstName
              ? `${profile.firstName} ${profile.lastName}`
              : profile.walletAddress?.slice(0, 8) + "...",
            target: request.targetHoldersJson
              ? "Specific Holders"
              : "All Holders",
            timestamp: request.createdAt,
            status: "success",
            details: {
              requestType:
                request.requestedTypes?.join(", ") || "Multiple types",
              targetCount: request.targetHoldersJson
                ? JSON.parse(request.targetHoldersJson).length
                : "All",
              expiresAt: request.expiresAt,
            },
          });
        });

        // Fetch proof responses submitted by this user
        const proofResponsesResponse = await api.get("proof-responses");
        const proofResponses = proofResponsesResponse.data || [];

        proofResponses.forEach((response: any) => {
          activities.push({
            id: `proof-response-${response.id}`,
            type: "proof_response_submitted",
            title: "Proof Response Submitted",
            description: `Submitted proof response for: ${
              response.proofRequest?.title || "Request"
            }`,
            actor: profile.firstName
              ? `${profile.firstName} ${profile.lastName}`
              : profile.walletAddress?.slice(0, 8) + "...",
            target: response.proofRequest?.verifier?.firstName
              ? `${response.proofRequest.verifier.firstName} ${response.proofRequest.verifier.lastName}`
              : "Verifier",
            timestamp: response.submittedAt,
            status:
              response.status === "ACCEPTED"
                ? "success"
                : response.status === "REJECTED"
                ? "error"
                : "warning",
            details: {
              requestType:
                response.proofRequest?.requestedTypes?.join(", ") || "Unknown",
              credentialsPresented: response.presentedCredentialsJson
                ? JSON.parse(response.presentedCredentialsJson).length
                : 0,
              responseTime: "N/A", // Could be calculated if we had submission timestamps
            },
          });
        });

        // Fetch credentials issued by this user (if they're an issuer)
        if (profile.role === UserRole.ISSUER) {
          const credentialsResponse = await api.get("credentials", {
            headers: { "x-wallet-address": profile.walletAddress },
          });
          const credentials = credentialsResponse.data || [];

          credentials.forEach((credential: any) => {
            activities.push({
              id: `credential-issued-${credential.id}`,
              type: "credential_issued",
              title: "Credential Issued",
              description: `Issued ${credential.type} credential`,
              actor: profile.firstName
                ? `${profile.firstName} ${profile.lastName}`
                : profile.walletAddress?.slice(0, 8) + "...",
              target: credential.holder?.firstName
                ? `${credential.holder.firstName} ${credential.holder.lastName}`
                : credential.subjectDid?.slice(0, 8) + "..." || "Unknown",
              timestamp: credential.issuedAt,
              status: credential.status === "ACTIVE" ? "success" : "warning",
              details: {
                credentialType: credential.type,
                issuerDID: credential.issuerDid,
                holderDID: credential.subjectDid,
                status: credential.status,
              },
            });
          });
        }

        // Fetch credentials held by this user (if they're a holder)
        if (profile.role === UserRole.HOLDER) {
          const credentialsResponse = await api.get("credentials", {
            headers: { "x-wallet-address": profile.walletAddress },
          });
          const credentials = credentialsResponse.data || [];

          credentials.forEach((credential: any) => {
            if (credential.holderId === profile.id) {
              activities.push({
                id: `credential-received-${credential.id}`,
                type: "credential_received",
                title: "Credential Received",
                description: `Received ${credential.type} credential`,
                actor: credential.issuer?.firstName
                  ? `${credential.issuer.firstName} ${credential.issuer.lastName}`
                  : credential.issuerDid?.slice(0, 8) + "..." || "Unknown",
                target: profile.firstName
                  ? `${profile.firstName} ${profile.lastName}`
                  : profile.walletAddress?.slice(0, 8) + "...",
                timestamp: credential.issuedAt,
                status: credential.status === "ACTIVE" ? "success" : "warning",
                details: {
                  credentialType: credential.type,
                  issuerDID: credential.issuerDid,
                  status: credential.status,
                },
              });
            }
          });
        }

        // Sort activities by timestamp (most recent first)
        activities.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return activities;
      } catch (error) {
        console.error("Error fetching activity history:", error);
        return [];
      }
    },
    enabled: !!profile,
  });
}
