import { z } from "zod";

export const schemaProduct = z.object({
  material: z.string().optional(),
  brandName: z.string().optional(),
  origin: z.string().optional(),
  series: z
    .string()
    .min(1, { message: "This field is required" })
    .max(155)
    .trim(),
  model: z
    .string()
    .min(1, { message: "This field is required" })
    .max(55)
    .trim(),
  color: z.string().optional(),
  effect: z.string().optional(),
  surface: z.string().optional(),
  antiBacterial: z.string().optional(),

  width: z
    .string()
    .regex(/^\d*\.?\d*$/, { message: "Must be a number" })
    .max(55)
    .optional(),
  length: z
    .string()
    .regex(/^\d*\.?\d*$/, { message: "Must be a number" })
    .max(55)
    .optional(),
  height: z
    .string()
    .regex(/^\d*\.?\d*$/, { message: "Must be a number" })
    .max(55)
    .optional(),
  depth: z
    .string()
    .regex(/^\d*\.?\d*$/, { message: "Must be a number" })
    .max(55)
    .optional(),
  leadTime: z.string().optional(),
  applicationArea1: z.string().optional(),
  applicationArea2: z.string().optional(),

  shadeVariation: z.string().optional(),
  edge: z.string().optional(),
  evaSuitable: z.string().optional(),
  sri: z.string().max(55).trim().optional(),
  slipResistance: z.string().optional(),
  stainResistance: z.string().optional(),
  chemicalResistance: z.string().optional(),
  fireResistance: z.string().max(55).trim().optional(),

  supplierId: z.string().optional(),
  unitRate: z
    .string()
    .regex(/^\d*\.?\d*$/, { message: "Must be a number" })
    .max(15)
    .optional(),
  unit: z.string().optional(),
  discount: z
    .string()
    .regex(/^\d*\.?\d*$/, { message: "Must be a number" })
    .max(15)
    .optional(),
  metadata: z
    .object({
      label: z.string().optional(),
      detail: z.string().optional(),
    })
    .array()
    .optional(),
  planId: z.string().optional(),
});
export type ValuesProduct = z.infer<typeof schemaProduct>;

export const defaultValuesProduct = {
  material: "",
  brandName: "",
  origin: "",
  series: "",
  model: "",
  color: "",
  effect: "",
  surface: "",
  antiBacterial: "",
  width: "",
  length: "",
  height: "",
  depth: "",
  leadTime: "",
  applicationArea1: "",
  applicationArea2: "",
  shadeVariation: "",
  edge: "",
  evaSuitable: "",
  sri: "",
  slipResistance: "",
  stainResistance: "",
  chemicalResistance: "",
  fireResistance: "",
  planId: "",
  supplierId: "",
  unitRate: "",
  unit: "",
  discount: "",
  metadata: [],
} satisfies ValuesProduct;
