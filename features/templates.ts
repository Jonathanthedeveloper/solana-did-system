import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { templateSchema, TemplateInput } from "@/lib/validation/template";

export function useCredentialTemplates() {
  return useQuery({
    queryKey: ["credential-templates"],
    queryFn: async () => {
      const response = await api.get("templates");
      return response.data;
    },
  });
}

export function useCreateCredentialTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TemplateInput) => {
      const parse = templateSchema.safeParse(data);
      if (!parse.success) {
        // surface validation issues to caller
        throw new Error(JSON.stringify(parse.error.issues));
      }
      const response = await api.post("templates", parse.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credential-templates"] });
    },
  });
}

export function useUpdateCredentialTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string } & Partial<TemplateInput>) => {
      // validate the updatable parts
      const payload: any = {
        name: data.name,
        category: data.category,
        description: data.description,
        schema: data.schema,
      };
      const parse = templateSchema.safeParse(payload);
      if (!parse.success) {
        throw new Error(JSON.stringify(parse.error.issues));
      }
      const response = await api.put(`templates/${data.id}`, parse.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credential-templates"] });
    },
  });
}

export function useDeleteCredentialTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`templates/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credential-templates"] });
    },
  });
}

export function useDuplicateCredentialTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // fetch template
      const tpl = await api.get(`templates/${id}`);
      const data = tpl.data;
      const copy = {
        name: `${data.name} (Copy)`,
        category: data.category,
        description: data.description,
        schema: data.schema,
      };
      const created = await api.post(`templates`, copy);
      return created.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credential-templates"] });
    },
  });
}
