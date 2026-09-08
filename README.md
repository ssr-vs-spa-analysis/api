# PostgreSQL API

Lightweight Node.js + TypeScript API for FE benchmarking (SSR vs SPA) with:

- seeded realistic product dataset
- read-focused endpoints (`list`, `search`, `detail`)
- strict Zod validation
- PostgreSQL + Prisma migrations
- request processing-time logging

## Required Environment Variables

Create `.env`:

```env
NODE_ENV=development
PORT=3000
POSTGRES_DB=diplomski
POSTGRES_USER=postgres
POSTGRES_PASSWORD=root
DATABASE_URL=postgresql://postgres:root@postgres:5432/diplomski?schema=public
```

For AWS-like production:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db>?sslmode=require
```

Store production secrets in AWS Secrets Manager/SSM, not in source code.

For local API run outside Docker (while PostgreSQL stays in Docker), use:

```env
DATABASE_URL=postgresql://postgres:root@localhost:5432/diplomski?schema=public
```

## Run Modes

### 1) API local + PostgreSQL in Docker

Use this mode for local development with hot reload.

Set `DATABASE_URL` in `.env` to use `localhost`:

```env
DATABASE_URL=postgresql://postgres:root@localhost:5432/diplomski?schema=public
```

Start commands:

```bash
docker compose up -d postgres
npm install
npm run prisma:deploy
npm run dev
```

The API is available at `http://localhost:3000`.

### 2) API + PostgreSQL both in Docker

Use this mode for containerized runtime closer to deployment.

Set `DATABASE_URL` in `.env` to use Docker service hostname `postgres`:

```env
DATABASE_URL=postgresql://postgres:root@postgres:5432/diplomski?schema=public
```

Start commands:

```bash
docker compose up --build -d
docker compose exec api npm run prisma:deploy
```

Stop command:

```bash
docker compose down -v
```

The API is available at `http://localhost:3000`.

## API Endpoints

- `POST /api/products/seed` body: `{ "count": number }`
- `GET /api/products?limit=20&offset=0`
- `GET /api/products/search?...`
- `GET /api/products/:id`

Errors follow:

```json
{ "error": "Short description", "details": [] }
```

## Seed image URLs

`category_images.json` and `seed_products.json` now use public **S3** object URLs. Seeding prefers `category_images.json` by category, then falls back to each product’s `images` in `seed_products.json`.

## Production deploy

Full EC2 + Docker Compose + Caddy runbook lives in the companion repo:

[ssr-vs-spa-analysis/infra](https://github.com/ssr-vs-spa-analysis/infra)

The API `Dockerfile` copies `prisma/` before `npm install` so `postinstall` / `prisma generate` succeeds during image build.
