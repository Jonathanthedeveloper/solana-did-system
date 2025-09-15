"use client";

import {
  useForm,
  UseFormProps,
  UseFormReturn,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCallback } from "react";

export interface UseValidatedFormOptions<T extends FieldValues>
  extends UseFormProps<T> {
  schema: z.ZodSchema<T>;
  onSubmit?: (data: T) => Promise<void> | void;
  onError?: (errors: any) => void;
}

export function useValidatedForm<T extends FieldValues>({
  schema,
  onSubmit,
  onError,
  ...formOptions
}: UseValidatedFormOptions<T>) {
  const form = useForm<T>({
    ...formOptions,
    resolver: zodResolver(schema),
  });

  const handleSubmit = useCallback(
    async (data: T) => {
      try {
        if (onSubmit) {
          await onSubmit(data);
        }
      } catch (error) {
        if (onError) {
          onError(error);
        } else {
          console.error("Form submission error:", error);
        }
      }
    },
    [onSubmit, onError]
  );

  const submitForm = form.handleSubmit(handleSubmit);

  return {
    ...form,
    submitForm,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
  };
}

// Type-safe field error helper
export function getFieldError<T extends FieldValues>(
  errors: UseFormReturn<T>["formState"]["errors"],
  field: FieldPath<T>
): string | undefined {
  const error = errors[field];
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return undefined;
}

// Utility function to validate a single field
export function validateField<T>(
  schema: z.ZodSchema<T>,
  value: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(value);
  return result;
}

// Utility function to get validation errors as a flat object
export function getValidationErrors<T extends FieldValues>(
  errors: UseFormReturn<T>["formState"]["errors"]
): Record<string, string> {
  const result: Record<string, string> = {};

  Object.keys(errors).forEach((key) => {
    const error = errors[key as FieldPath<T>];
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      result[key] = error.message;
    }
  });

  return result;
}

// Hook for async validation
export function useAsyncValidation() {
  const validateAsync = useCallback(
    async <T>(
      schema: z.ZodSchema<T>,
      value: unknown
    ): Promise<
      { success: true; data: T } | { success: false; error: z.ZodError }
    > => {
      try {
        const result = await schema.parseAsync(value);
        return { success: true, data: result };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return { success: false, error };
        }
        throw error;
      }
    },
    []
  );

  return { validateAsync };
}

// Debounced validation hook
export function useDebouncedValidation<T>(
  schema: z.ZodSchema<T>,
  delay: number = 300
) {
  const { validateAsync } = useAsyncValidation();

  const validateDebounced = useCallback(
    async (value: unknown): Promise<T | null> => {
      return new Promise((resolve) => {
        const timeoutId = setTimeout(async () => {
          try {
            const result = await validateAsync(schema, value);
            if (result.success) {
              resolve(result.data);
            } else {
              resolve(null);
            }
          } catch (error) {
            resolve(null);
          }
        }, delay);

        return () => clearTimeout(timeoutId);
      });
    },
    [schema, delay, validateAsync]
  );

  return { validateDebounced };
}
