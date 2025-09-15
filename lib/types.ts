// Prefer Prisma-generated model types. Export aliases so the rest of the app
// uses the canonical schema-driven types.
import type * as PrismaBrowser from "@/lib/generated/prisma/browser";

export type User = PrismaBrowser.User;
export type Credential = PrismaBrowser.Credential;
export type Verification = PrismaBrowser.Verification;
export type ProofRequest = PrismaBrowser.ProofRequest;
export type ProofResponse = PrismaBrowser.ProofResponse;
export type CredentialTemplate = PrismaBrowser.CredentialTemplate;
export type UserRoleEnum = PrismaBrowser.$Enums.UserRole;

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  error: string;
  message?: string;
  code?: string;
  status?: number;
}

// Form types
export interface CredentialFormData {
  type: string;
  subjectDid: string;
  claims: Record<string, any>;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface ProofRequestFormData {
  title: string;
  description?: string;
  requestedTypes: string[];
  expiresAt?: string;
  requirements?: Record<string, any>;
  targetHolders?: string[];
}

export interface ProfileFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  institutionName?: string;
  institutionType?: string;
  institutionWebsite?: string;
  position?: string;
  department?: string;
}

// Settings types
export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  verificationResults: boolean;
  credentialUpdates: boolean;
  proofRequests: boolean;
  securityAlerts: boolean;
}

export interface PrivacySettings {
  dataMinimization: boolean;
  autoAcceptFromTrusted: boolean;
  profileVisibility: "public" | "private" | "contacts";
  activityVisibility: "public" | "private" | "contacts";
}

export interface SecuritySettings {
  sessionTimeout: number;
  requireTwoFactor: boolean;
  loginAlerts: boolean;
  deviceTracking: boolean;
}

export interface IssuerSettings {
  defaultCredentialExpiry: number;
  autoRevokeOnViolation: boolean;
  requireHolderConsent: boolean;
  batchIssuance: boolean;
}

export interface VerifierSettings {
  autoAcceptTrustedIssuers: boolean;
  allowExpiredCredentials: boolean;
  maxVerificationTime: number;
  requireProofDetails: boolean;
}

export interface HolderSettings {
  autoShareCredentials: boolean;
  credentialBackup: boolean;
  proofRequestNotifications: boolean;
  defaultSharingDuration: number;
}

// Component prop types
export interface DashboardCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export interface CredentialCardProps {
  credential: Credential & {
    issuer?: Pick<User, "firstName" | "lastName" | "institutionName">;
  };
  onView?: () => void;
  onRevoke?: () => void;
  onVerify?: () => void;
}

export interface ProofRequestCardProps {
  proofRequest: ProofRequest & {
    verifier?: Pick<User, "firstName" | "lastName" | "institutionName">;
  };
  onRespond?: () => void;
  onView?: () => void;
}

// Hook return types
export interface UseCredentialsReturn {
  credentials: Credential[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  createCredential: (data: CredentialFormData) => Promise<Credential>;
  revokeCredential: (id: string, reason: string) => Promise<void>;
}

export interface UseProofRequestsReturn {
  proofRequests: ProofRequest[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  createProofRequest: (data: ProofRequestFormData) => Promise<ProofRequest>;
  cancelProofRequest: (id: string) => Promise<void>;
}

export interface UseProfileReturn {
  profile: User | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  updateProfile: (data: Partial<ProfileFormData>) => Promise<User>;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Keys>> }[Keys];

// DID Document types
export interface DIDDocument {
  "@context": string | string[];
  id: string;
  controller: string;
  verificationMethod: Array<{
    id: string;
    type: string;
    controller: string;
    publicKeyBase58: string;
  }>;
  authentication: string[];
  assertionMethod?: string[];
  service?: Array<{
    id: string;
    type: string;
    serviceEndpoint: string;
  }>;
}

// Solana-specific types
export interface SolanaCredential {
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: {
    id: string;
    [key: string]: any;
  };
  proof?: {
    type: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    proofValue: string;
  };
}

// Error types
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = "Access denied") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}
