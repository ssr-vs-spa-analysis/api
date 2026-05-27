import "dotenv/config";

import app from "./app.js";
import { disconnectDb } from "./db.js";
import { getEnv } from "./env.js";

let env;
try {
  env = getEnv();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

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
