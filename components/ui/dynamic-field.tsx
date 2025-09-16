"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";

interface DynamicFieldProps {
  name: string;
  fieldDef: any;
  required?: boolean;
  control: any;
  register: any;
  watch: any;
  setValue: any;
}

export function DynamicField({
  name,
  fieldDef,
  required,
  control,
  register,
  watch,
  setValue,
}: DynamicFieldProps) {
  const value = watch(name);

  return (
    <div className="space-y-1">
      <Label htmlFor={name}>
        {fieldDef.title || name} {required && "*"}
      </Label>

      {/* string */}
      {fieldDef.type === "string" && <Input id={name} {...register(name)} />}

      {/* number */}
      {fieldDef.type === "number" && (
        <Input
          id={name}
          type="number"
          {...register(name, { valueAsNumber: true })}
        />
      )}

      {/* boolean */}
      {fieldDef.type === "boolean" && (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Select
              value={typeof value === "boolean" ? String(value) : ""}
              onValueChange={(v) => setValue(name, v === "true")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      )}

      {/* enum */}
      {fieldDef.enum && (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Select
              value={value ?? ""}
              onValueChange={(v) => setValue(name, v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {fieldDef.enum.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      )}
    </div>
  );
}
