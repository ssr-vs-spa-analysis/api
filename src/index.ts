import "dotenv/config";

import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import { disconnectDb } from "./db.js";
import { createApiError } from "./service.js";
import { productsRouter } from "./routes.js";
import { envSchema } from "./schema.js";

const envResult = envSchema.safeParse(process.env);
if (!envResult.success) {
  const details = envResult.error.issues.map(
    (issue) => `${issue.path.join(".")}: ${issue.message}`,
  );
  console.error("Environment validation failed", details);
  process.exit(1);
}

const env = envResult.data;
const app = express();

app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();

  res.on("finish", () => {
    const durationMs = Number((performance.now() - start).toFixed(2));
    console.log(
      `[request] method=${req.method} path=${req.originalUrl} status=${res.statusCode} duration_ms=${durationMs}`,
    );
  });

  next();
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/products", productsRouter);

app.use((_req, res) => {
  res.status(404).json(createApiError("Route not found"));
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled route error", error);
  res.status(500).json(createApiError("Internal server error"));
});

const server = app.listen(env.PORT, () => {
  console.log(`API is listening on port ${env.PORT}`);
});

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  console.log(`${signal} received, shutting down...`);
  server.close(async () => {
    await disconnectDb();
    process.exit(0);
  });
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception", error);
});
