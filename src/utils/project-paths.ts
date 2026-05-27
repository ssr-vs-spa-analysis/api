import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRootCandidates = (): string[] => {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const cwd = process.cwd();

  return [
    path.resolve(moduleDir, "../.."),
    path.resolve(moduleDir, ".."),
    cwd,
  ].filter((candidate, index, list) => list.indexOf(candidate) === index);
};

export const resolveProjectFile = async (fileName: string): Promise<string> => {
  for (const root of projectRootCandidates()) {
    const candidate = path.resolve(root, fileName);
    try {
      await access(candidate);
      return candidate;
    } catch {
      // try next candidate
    }
  }

  throw new Error(
    `Could not find "${fileName}" in project root (checked module-relative paths and cwd=${process.cwd()})`,
  );
};
