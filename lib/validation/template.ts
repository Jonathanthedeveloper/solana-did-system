import { z } from "zod";

export const templateSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  schema: z.any(),
});

export type TemplateInput = z.infer<typeof templateSchema>;
