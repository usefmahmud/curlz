import { readdir } from "node:fs/promises";
import { parseRequestDoc } from "../parse/request";
import { baseName, joinPath } from "../paths";
import { abs, readJson } from "../storage/fs";
import type { FolderNode, ItemNode, LoadIssue, RequestNode } from "../types";

type DirEntry = { name: string; isDirectory(): boolean; isFile(): boolean };

const byName = (a: DirEntry, b: DirEntry) => a.name.localeCompare(b.name);

const readRequestNode = async (
  root: string,
  rel: string,
  issues: LoadIssue[],
): Promise<RequestNode | null> => {
  try {
    const doc = parseRequestDoc(await readJson(root, rel), rel);
    return { type: "request", name: doc.name, path: rel, doc };
  } catch (e) {
    issues.push({ path: rel, message: (e as Error).message });
    return null;
  }
};

export const walkFolder = async (
  root: string,
  rel: string,
  issues: LoadIssue[],
): Promise<FolderNode> => {
  const entries = await readdir(abs(root, rel), { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory()).sort(byName);
  const files = entries.filter((e) => e.isFile()).sort(byName);
  const children: ItemNode[] = [];
  for (const d of dirs) {
    children.push(await walkFolder(root, joinPath(rel, d.name), issues));
  }
  for (const f of files) {
    if (!f.name.endsWith(".json")) continue;
    const node = await readRequestNode(root, joinPath(rel, f.name), issues);
    if (node) children.push(node);
  }
  return { type: "folder", name: baseName(rel), path: rel, children };
};

export const walkRequests = async (
  root: string,
  issues: LoadIssue[],
): Promise<RequestNode[]> => {
  const entries = await readdir(abs(root, "requests"), {
    withFileTypes: true,
  });
  const out: RequestNode[] = [];
  for (const e of [...entries].sort(byName)) {
    const rel = joinPath("requests", e.name);
    if (e.isDirectory()) {
      issues.push({
        path: rel,
        message: `${rel}: unexpected folder in requests/`,
      });
    } else if (e.name.endsWith(".json")) {
      const node = await readRequestNode(root, rel, issues);
      if (node) out.push(node);
    }
  }
  return out;
};
