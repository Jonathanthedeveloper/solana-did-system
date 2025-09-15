import { z } from "zod";

// User validation schemas
export const userProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  avatar: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
});

export const institutionSchema = z.object({
  name: z.string().min(1, "Institution name is required").max(100),
  type: z.enum(["university", "company", "government", "ngo", "other"]),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  address: z.string().max(200).optional(),
  position: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
});

// Credential validation schemas
export const credentialSchema = z.object({
  type: z.string().min(1, "Credential type is required"),
  subjectDid: z
    .string()
    .regex(/^did:solana:[A-Za-z0-9]{32,44}$/, "Invalid DID format"),
  claims: z
    .record(z.string(), z.any())
    .refine(
      (claims) => Object.keys(claims).length > 0,
      "Credential must have at least one claim"
    ),
  expiresAt: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const issueCredentialSchema = z.object({
  subjectDid: z
    .string()
    .regex(/^did:solana:[A-Za-z0-9]{32,44}$/, "Invalid DID format"),
  type: z.string().min(1, "Credential type is required"),
  claims: z
    .record(z.string(), z.any())
    .refine(
      (claims) => Object.keys(claims).length > 0,
      "Credential must have at least one claim"
    ),
  templateId: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

// Proof request validation schemas
export const proofRequestSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  requestedTypes: z
    .array(z.string())
    .min(1, "At least one credential type is required"),
  expiresAt: z.string().datetime().optional(),
  requirements: z.record(z.string(), z.any()).optional(),
  targetHolders: z.array(z.string()).optional(),
});

export const proofResponseSchema = z.object({
  proofRequestId: z.string().min(1, "Proof request ID is required"),
  presentedCredentials: z
    .array(
      z.object({
        id: z.string(),
        type: z.string(),
        claims: z.record(z.string(), z.any()),
        proof: z.record(z.string(), z.any()).optional(),
      })
    )
    .min(1, "At least one credential must be presented"),
  holderSignature: z.string().optional(),
});

// Verification validation schemas
export const verificationRequestSchema = z.object({
  credentialJson: z.string().optional(),
  holderDid: z
    .string()
    .regex(/^did:solana:[A-Za-z0-9]{32,44}$/, "Invalid DID format")
    .optional(),
  credentialType: z.string().optional(),
  verifierComments: z.string().max(500).optional(),
});

export const verificationResultSchema = z.object({
  credentialId: z.string(),
  isValid: z.boolean(),
  verificationTime: z.number().positive(),
  trustScore: z.number().min(0).max(100),
  issues: z.array(z.string()).optional(),
  verifierSignature: z.string(),
});

// Settings validation schemas
export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  verificationResults: z.boolean(),
  credentialUpdates: z.boolean(),
  proofRequests: z.boolean(),
  securityAlerts: z.boolean(),
});

export const privacySettingsSchema = z.object({
  dataMinimization: z.boolean(),
  autoAcceptFromTrusted: z.boolean(),
  profileVisibility: z.enum(["public", "private", "contacts"]),
  activityVisibility: z.enum(["public", "private", "contacts"]),
});

export const securitySettingsSchema = z.object({
  sessionTimeout: z.number().min(5).max(480), // 5 minutes to 8 hours
  requireTwoFactor: z.boolean(),
  loginAlerts: z.boolean(),
  deviceTracking: z.boolean(),
});

export const issuerSettingsSchema = z.object({
  defaultCredentialExpiry: z.number().min(1).max(3650), // 1 day to 10 years
  autoRevokeOnViolation: z.boolean(),
  requireHolderConsent: z.boolean(),
  batchIssuance: z.boolean(),
});

export const verifierSettingsSchema = z.object({
  autoAcceptTrustedIssuers: z.boolean(),
  allowExpiredCredentials: z.boolean(),
  maxVerificationTime: z.number().min(5).max(300), // 5 seconds to 5 minutes
  requireProofDetails: z.boolean(),
});

export const holderSettingsSchema = z.object({
  autoShareCredentials: z.boolean(),
  credentialBackup: z.boolean(),
  proofRequestNotifications: z.boolean(),
  defaultSharingDuration: z.number().min(1).max(365), // 1 day to 1 year
});

// DID validation schemas
export const didDocumentSchema = z.object({
  "@context": z.string().or(z.array(z.string())),
  id: z.string().regex(/^did:solana:[A-Za-z0-9]{32,44}$/),
  controller: z.string(),
  verificationMethod: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      controller: z.string(),
      publicKeyBase58: z.string(),
    })
  ),
  authentication: z.array(z.string()),
  assertionMethod: z.array(z.string()).optional(),
  service: z
    .array(
      z.object({
        id: z.string(),
        type: z.string(),
        serviceEndpoint: z.string(),
      })
    )
    .optional(),
});

// API request/response validation schemas
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    message: z.string().optional(),
    success: z.boolean().default(true),
  });

export const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  code: z.string().optional(),
});

// Export types
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type InstitutionInput = z.infer<typeof institutionSchema>;
export type CredentialInput = z.infer<typeof credentialSchema>;
export type IssueCredentialInput = z.infer<typeof issueCredentialSchema>;
export type ProofRequestInput = z.infer<typeof proofRequestSchema>;
export type ProofResponseInput = z.infer<typeof proofResponseSchema>;
export type VerificationRequestInput = z.infer<
  typeof verificationRequestSchema
>;
export type VerificationResultInput = z.infer<typeof verificationResultSchema>;
export type NotificationSettingsInput = z.infer<
  typeof notificationSettingsSchema
>;
export type PrivacySettingsInput = z.infer<typeof privacySettingsSchema>;
export type SecuritySettingsInput = z.infer<typeof securitySettingsSchema>;
export type IssuerSettingsInput = z.infer<typeof issuerSettingsSchema>;
export type VerifierSettingsInput = z.infer<typeof verifierSettingsSchema>;
export type HolderSettingsInput = z.infer<typeof holderSettingsSchema>;
export type DIDDocumentInput = z.infer<typeof didDocumentSchema>;
