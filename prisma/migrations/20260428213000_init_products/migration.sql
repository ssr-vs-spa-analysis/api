CREATE TABLE "products" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "quantity" INTEGER NOT NULL,
  "category" TEXT NOT NULL,
  "brand" TEXT NOT NULL,
  "rating" DOUBLE PRECISION NOT NULL,
  "images" TEXT[] NOT NULL,
  "attributes" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "products_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "products_price_check" CHECK ("price" >= 0),
  CONSTRAINT "products_quantity_check" CHECK ("quantity" >= 0),
  CONSTRAINT "products_rating_check" CHECK ("rating" >= 0 AND "rating" <= 5)
);

CREATE INDEX "products_category_idx" ON "products"("category");
CREATE INDEX "products_brand_idx" ON "products"("brand");
CREATE INDEX "products_name_idx" ON "products"("name");
