import { envSchema, type Env } from "./schema.js";

let cachedEnv: Env | null = null;

export const getEnv = (): Env => {
  if (cachedEnv) {
    return cachedEnv;
  }

  const envResult = envSchema.safeParse(process.env);
  if (!envResult.success) {
    const details = envResult.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`,
    );
    throw new Error(`Environment validation failed: ${details.join(", ")}`);
  }

  cachedEnv = envResult.data;
  return cachedEnv;
};
