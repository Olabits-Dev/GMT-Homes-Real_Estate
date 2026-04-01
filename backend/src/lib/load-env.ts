import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const envCandidatePaths = [
  "../../.env.local",
  "../../.env",
  "../../../.env.local",
  "../../../.env",
];

function parseEnvLine(line: string) {
  const trimmedLine = line.trim();

  if (!trimmedLine || trimmedLine.startsWith("#")) {
    return null;
  }

  const separatorIndex = trimmedLine.indexOf("=");

  if (separatorIndex === -1) {
    return null;
  }

  const key = trimmedLine.slice(0, separatorIndex).trim();
  let value = trimmedLine.slice(separatorIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return {
    key,
    value,
  };
}

export function loadBackendEnv() {
  for (const candidate of envCandidatePaths) {
    const filePath = fileURLToPath(new URL(candidate, import.meta.url));

    try {
      const fileContents = readFileSync(filePath, "utf8");

      for (const line of fileContents.split(/\r?\n/u)) {
        const parsedLine = parseEnvLine(line);

        if (!parsedLine || process.env[parsedLine.key] !== undefined) {
          continue;
        }

        process.env[parsedLine.key] = parsedLine.value;
      }
    } catch (error) {
      const issue = error as NodeJS.ErrnoException;

      if (issue.code !== "ENOENT") {
        throw error;
      }
    }
  }
}
