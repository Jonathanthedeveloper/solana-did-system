import { z } from "zod";

export const authSchema = z.object({
  walletAddress: z.string().min(32).max(44),
  signature: z.string().min(10),
  role: z.enum(["HOLDER", "ISSUER", "VERIFIER"]).optional(),
});

export type AuthSchema = z.infer<typeof authSchema>;

// Template types
import { templateSchema } from "@/lib/validation/template";
export type TemplateInput = z.infer<typeof templateSchema>;
