import { faker as fakerSrRsLatin } from "@faker-js/faker/locale/sr_RS_latin";
import type { Prisma } from "@prisma/client";

// Centralized Faker instance for Serbian locale data generation.
export const faker = fakerSrRsLatin;

const serbianCategories = [
  "Telefoni",
  "Laptopovi",
  "Televizori",
  "Bela tehnika",
  "Kancelarija",
];

const serbianBrands = [
  "Ultra Tech",
  "Devices Plus",
  "Dunav Elektronika",
  "Adria Sistemi",
  "Sava Digital",
];

const serbianAdjectives = [
  "Pametni",
  "Prenosni",
  "Profesionalni",
  "Kompaktni",
  "Napredni",
  "Pouzdani",
];

const serbianProductNouns = [
  "telefon",
  "laptop",
  "televizor",
  "usisivac",
  "monitor",
  "stampac",
];

const serbianColors = ["crna", "bela", "plava", "crvena", "siva", "zelena"];

const countries = [
  "Srbija",
  "Hrvatska",
  "Bosna i Hercegovina",
  "Crna Gora",
  "Severna Makedonija",
  "Slovenija",
];

const serbianMaterials = [
  "aluminijum",
  "plastika",
  "staklo",
  "celik",
  "kompozit",
];

const randomImages = (): string[] => {
  const imageCount = faker.number.int({ min: 1, max: 4 });
  return Array.from({ length: imageCount }, () =>
    faker.image.urlPicsumPhotos(),
  );
};

const randomSerbianProductName = (): string => {
  const adjective = faker.helpers.arrayElement(serbianAdjectives);
  const noun = faker.helpers.arrayElement(serbianProductNouns);
  const model = faker.number.int({ min: 100, max: 999 });

  return `${adjective} ${noun} ${model}`;
};

const randomSerbianText = (): string =>
  faker.helpers.arrayElement([
    "Odlican kvalitet i pouzdane performanse.",
    "Idealan izbor za svakodnevnu upotrebu.",
    "Moderan dizajn i dugotrajna izrada.",
    "Visoka efikasnost za zahtevne korisnike.",
  ]);

const randomProductAttributes = (): Prisma.InputJsonValue => ({
  color: faker.helpers.arrayElement(serbianColors),
  weight_kg: Number(
    faker.number.float({ min: 0.1, max: 20, fractionDigits: 2 }),
  ),
  warranty_months: faker.number.int({ min: 6, max: 36 }),
  origin_country: faker.helpers.arrayElement(countries),
  material: faker.helpers.arrayElement(serbianMaterials),
});

export type SeedProductDraft = {
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

export const createSeedProductDraft = (): SeedProductDraft => ({
  name: randomSerbianProductName(),
  description: randomSerbianText(),
  price: faker.number.float({ min: 100, max: 100000, fractionDigits: 2 }),
  quantity: faker.number.int({ min: 0, max: 500 }),
  category: faker.helpers.arrayElement(serbianCategories),
  brand: faker.helpers.arrayElement(serbianBrands),
  rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
  images: randomImages(),
  attributes: randomProductAttributes(),
});
