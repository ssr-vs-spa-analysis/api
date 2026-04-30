import { Prisma } from "@prisma/client";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { v7 as uuidv7 } from "uuid";

import { db } from "./db.js";
import type {
  ListProductsQuery,
  SearchProductsQuery,
  SeedProductsBody,
} from "./schema.js";
import {
  buildCategoryImagePool,
  getRandomImagesForCategory,
  loadCategoryImages,
} from "./utils/seed-utils.js";

export type ApiErrorBody = {
  error: string;
  details: Array<string | Record<string, unknown>>;
};

type SeedProductSource = {
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  brand: string;
  rating: number;
  images: string[];
  attributes: Prisma.InputJsonValue;
};

const loadSeedProducts = async (): Promise<SeedProductSource[]> => {
  const seedFilePath = path.resolve(process.cwd(), "seed_products.json");
  const seedFileContent = await readFile(seedFilePath, "utf-8");
  const parsed: unknown = JSON.parse(seedFileContent);

  if (!Array.isArray(parsed)) {
    throw new Error("seed_products.json must contain an array of products");
  }

  return parsed as SeedProductSource[];
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
  const seedProducts = await loadSeedProducts();
  const fallbackCategoryImagePool = buildCategoryImagePool(seedProducts);
  const configuredCategoryImagePool = await loadCategoryImages();
  if (seedProducts.length === 0) {
    return 0;
  }

  const items = Array.from({ length: payload.count }, (_, index) => {
    const product = seedProducts[index % seedProducts.length];

    return {
      id: uuidv7(),
      name: product.name,
      description: product.description,
      price: new Prisma.Decimal(product.price),
      quantity: product.quantity,
      category: product.category,
      brand: product.brand,
      rating: product.rating,
      images: getRandomImagesForCategory(
        product.category,
        configuredCategoryImagePool,
        fallbackCategoryImagePool,
        product.images,
      ),
      attributes: product.attributes,
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

const buildInsensitiveStringFilter = (
  values: string[] | undefined,
): Prisma.StringFilter | undefined => {
  if (!values?.length) return undefined;
  const unique = [...new Set(values)];
  if (unique.length === 1) {
    return { equals: unique[0], mode: "insensitive" };
  }
  return { in: unique, mode: "insensitive" };
};

export const searchProducts = async (query: SearchProductsQuery) => {
  const where: Prisma.ProductWhereInput = {
    category: buildInsensitiveStringFilter(query.category),
    brand: buildInsensitiveStringFilter(query.brand),
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
