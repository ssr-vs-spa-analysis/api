import { Prisma } from "@prisma/client";
import { v7 as uuidv7 } from "uuid";

import { db } from "./db.js";
import { createSeedProductDraft } from "./faker-config.js";
import type {
  ListProductsQuery,
  SearchProductsQuery,
  SeedProductsBody,
} from "./schema.js";

export type ApiErrorBody = {
  error: string;
  details: Array<string | Record<string, unknown>>;
};

export const createApiError = (
  error: string,
  details: Array<string | Record<string, unknown>> = [],
): ApiErrorBody => ({
  error,
  details,
});

export const seedProducts = async (
  payload: SeedProductsBody,
): Promise<number> => {
  const items = Array.from({ length: payload.count }, () => {
    const draft = createSeedProductDraft();

    return {
      id: uuidv7(),
      name: draft.name,
      description: draft.description,
      price: new Prisma.Decimal(draft.price),
      quantity: draft.quantity,
      category: draft.category,
      brand: draft.brand,
      rating: draft.rating,
      images: draft.images,
      attributes: draft.attributes,
    };
  });

  const inserted = await db.product.createMany({
    data: items,
  });

  return inserted.count;
};

export const listProducts = async (query: ListProductsQuery) => {
  const [items, total] = await Promise.all([
    db.product.findMany({
      orderBy: { createdAt: "desc" },
      take: query.limit,
      skip: query.offset,
    }),
    db.product.count(),
  ]);

  return {
    items,
    total,
    limit: query.limit,
    offset: query.offset,
  };
};

export const searchProducts = async (query: SearchProductsQuery) => {
  const where: Prisma.ProductWhereInput = {
    category: query.category,
    brand: query.brand,
    price: {
      gte: query.price_min,
      lte: query.price_max,
    },
    name: query.q
      ? {
          contains: query.q,
          mode: "insensitive",
        }
      : undefined,
  };

  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: query.limit,
      skip: query.offset,
    }),
    db.product.count({ where }),
  ]);

  return {
    items,
    total,
    limit: query.limit,
    offset: query.offset,
  };
};

export const getProductById = async (id: string) => {
  return db.product.findUnique({
    where: { id },
  });
};
