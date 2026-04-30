import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGIN: z.string().optional(),
});

export const seedProductsBodySchema = z.object({
  count: z.coerce.number().int().min(1).max(10000),
});

export const listProductsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const commaSeparatedQueryList = z.preprocess(
  (val) => {
    if (val === undefined || val === null) return undefined;
    const raw = String(val).trim();
    if (!raw) return undefined;
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return parts.length > 0 ? parts : undefined;
  },
  z.array(z.string().min(1)).optional(),
);

export const searchProductsQuerySchema = z
  .object({
    category: commaSeparatedQueryList,
    brand: commaSeparatedQueryList,
    price_min: z.coerce.number().min(0).optional(),
    price_max: z.coerce.number().min(0).optional(),
    q: z.string().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
  })
  .superRefine((value, ctx) => {
    if (
      value.price_min !== undefined &&
      value.price_max !== undefined &&
      value.price_max < value.price_min
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price_max"],
        message: "price_max must be greater than or equal to price_min",
      });
    }
  });

export const productIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type Env = z.infer<typeof envSchema>;
export type SeedProductsBody = z.infer<typeof seedProductsBodySchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type SearchProductsQuery = z.infer<typeof searchProductsQuerySchema>;
export type ProductIdParam = z.infer<typeof productIdParamSchema>;
