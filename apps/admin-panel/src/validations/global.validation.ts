import { z } from "zod";

export const FileSchema = z.object({
  name: z.string(),
  path: z.string(),
  size: z.number().optional()
});

export const metaSchema = z.object({
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  metaKeywords: z.string().nullable(),
  metaImage: z.string().nullable()
}).shape;
