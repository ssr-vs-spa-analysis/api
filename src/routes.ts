import { Router, type Request, type Response } from "express";
import { z, type ZodTypeAny } from "zod";

import {
  createApiError,
  getProductById,
  listProducts,
  searchProducts,
  seedProducts,
} from "./service.js";
import {
  listProductsQuerySchema,
  productIdParamSchema,
  searchProductsQuerySchema,
  seedProductsBodySchema,
} from "./schema.js";

const validateOrThrow = <TSchema extends ZodTypeAny>(
  schema: TSchema,
  input: unknown,
): z.infer<TSchema> => {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw parsed.error;
  }

  return parsed.data;
};

const formatZodDetails = (error: z.ZodError): string[] =>
  error.issues.map(
    (issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
  );

export const productsRouter = Router();

productsRouter.post("/seed", async (req: Request, res: Response) => {
  try {
    const payload = validateOrThrow(seedProductsBodySchema, req.body);
    const insertedCount = await seedProducts(payload);
    return res.status(200).json({ insertedCount });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json(
          createApiError("Invalid request payload", formatZodDetails(error)),
        );
    }

    return res.status(500).json(createApiError("Failed to seed products"));
  }
});

productsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const query = validateOrThrow(listProductsQuerySchema, req.query);
    const result = await listProducts(query);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json(
          createApiError("Invalid pagination query", formatZodDetails(error)),
        );
    }

    return res.status(500).json(createApiError("Failed to list products"));
  }
});

productsRouter.get("/search", async (req: Request, res: Response) => {
  try {
    const query = validateOrThrow(searchProductsQuerySchema, req.query);
    const result = await searchProducts(query);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json(createApiError("Invalid search query", formatZodDetails(error)));
    }

    return res.status(500).json(createApiError("Failed to search products"));
  }
});

productsRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const params = validateOrThrow(productIdParamSchema, req.params);
    const product = await getProductById(params.id);

    if (!product) {
      return res.status(404).json(createApiError("Product not found"));
    }

    return res.status(200).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json(createApiError("Invalid product id", formatZodDetails(error)));
    }

    return res.status(500).json(createApiError("Failed to fetch product"));
  }
});
