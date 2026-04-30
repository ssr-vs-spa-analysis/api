import { readFile } from "node:fs/promises";
import path from "node:path";

export type CategoryImagePool = Record<string, string[]>;

export type CategoryImageSource = {
  category: string;
  images: string[];
};

const getRandomInteger = (min: number, max: number): number => {
  const lowerBound = Math.ceil(min);
  const upperBound = Math.floor(max);
  return Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;
};

const shuffleArray = <T>(items: T[]): T[] => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
};

export const buildCategoryImagePool = (
  products: CategoryImageSource[],
): CategoryImagePool => {
  return products.reduce<CategoryImagePool>((acc, product) => {
    const category = product.category.trim();
    if (!category) return acc;

    const existing = acc[category] ?? [];
    const merged = new Set([
      ...existing,
      ...product.images.filter((image) => image.trim().length > 0),
    ]);

    acc[category] = [...merged];
    return acc;
  }, {});
};

export const loadCategoryImages = async (): Promise<CategoryImagePool> => {
  const categoryImagesPath = path.resolve(
    process.cwd(),
    "category_images.json",
  );
  let parsed: unknown;

  try {
    const categoryImagesContent = await readFile(categoryImagesPath, "utf-8");
    parsed = JSON.parse(categoryImagesContent);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return {};
    }

    throw error;
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(
      'category_images.json must contain an object map: { "Category": ["url1", "url2"] }',
    );
  }

  return Object.entries(parsed).reduce<CategoryImagePool>(
    (acc, [category, value]) => {
      if (!Array.isArray(value)) return acc;

      const images = value
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0);

      if (images.length === 0) return acc;

      acc[category.trim()] = [...new Set(images)];
      return acc;
    },
    {},
  );
};

export const getRandomImagesForCategory = (
  category: string,
  configuredCategoryImagePool: CategoryImagePool,
  fallbackCategoryImagePool: CategoryImagePool,
  fallbackImages: string[],
): string[] => {
  const configuredPool = configuredCategoryImagePool[category] ?? [];
  const selectedPool =
    configuredPool.length > 0
      ? configuredPool
      : (fallbackCategoryImagePool[category] ?? []);

  if (selectedPool.length === 0) return fallbackImages;
  if (selectedPool.length === 1) return [selectedPool[0]];

  const maxImagesToPick = Math.min(3, selectedPool.length);
  const imagesToPick = getRandomInteger(1, maxImagesToPick);
  const shuffledPool = shuffleArray(selectedPool);

  return shuffledPool.slice(0, imagesToPick);
};
