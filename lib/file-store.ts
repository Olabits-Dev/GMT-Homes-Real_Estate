import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function resolveFilePath(fileName: string) {
  return path.join(process.cwd(), "data", fileName);
}

export async function readDataFile<T>(fileName: string, fallback: T) {
  const filePath = resolveFilePath(fileName);

  try {
    const rawValue = await readFile(filePath, "utf8");
    return JSON.parse(rawValue) as T;
  } catch (error) {
    const issue = error as NodeJS.ErrnoException;

    if (issue.code !== "ENOENT") {
      throw error;
    }

    if (process.env.NODE_ENV !== "production") {
      await writeDataFile(fileName, fallback);
    }

    return fallback;
  }
}

export async function writeDataFile<T>(fileName: string, value: T) {
  const filePath = resolveFilePath(fileName);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
