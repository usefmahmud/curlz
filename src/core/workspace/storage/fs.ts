import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export const CURLZ_DIR = ".curlz";

export const abs = (root: string, rel: string): string => {
  return join(root, CURLZ_DIR, rel);
};

export const pathExists = async (absPath: string): Promise<boolean> => {
  try {
    await stat(absPath);
    return true;
  } catch {
    return false;
  }
};

export const readJson = async (root: string, rel: string): Promise<unknown> => {
  return JSON.parse(await readFile(abs(root, rel), "utf8"));
};

export const writeText = async (
  root: string,
  rel: string,
  content: string,
): Promise<void> => {
  const target = abs(root, rel);
  const tmp = `${target}.tmp`;
  await mkdir(dirname(target), { recursive: true });
  await writeFile(tmp, content, "utf8");
  await rename(tmp, target);
};

export const movePath = async (
  root: string,
  from: string,
  to: string,
): Promise<void> => {
  const dst = abs(root, to);
  await mkdir(dirname(dst), { recursive: true });
  await rename(abs(root, from), dst);
};

export const removePath = async (root: string, rel: string): Promise<void> => {
  await rm(abs(root, rel), { recursive: true, force: true });
};
