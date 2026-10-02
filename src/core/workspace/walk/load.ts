import { join } from "node:path";
import { WorkspaceError } from "../errors";
import { parseMetaDoc } from "../parse/meta";
import { abs, CURLZ_DIR, pathExists, readJson } from "../storage/fs";
import type { FolderNode, LoadIssue, Workspace } from "../types";
import { walkFolder, walkRequests } from "./scan";

export interface LoadResult {
  workspace: Workspace;
  issues: LoadIssue[];
}

const splitCollections = (
  root: FolderNode,
  issues: LoadIssue[],
): FolderNode[] => {
  const folders: FolderNode[] = [];
  for (const child of root.children) {
    if (child.kind === "folder") {
      folders.push(child);
    } else {
      issues.push({
        path: child.path,
        message: `${child.path}: requests must live in a collection folder or requests/`,
      });
    }
  }
  return folders;
};

export const loadWorkspace = async (root: string): Promise<LoadResult> => {
  if (!(await pathExists(join(root, CURLZ_DIR)))) {
    throw new WorkspaceError("NOT_FOUND", `no .curlz directory in ${root}`);
  }
  for (const dir of ["collections", "requests"] as const) {
    if (!(await pathExists(abs(root, dir)))) {
      throw new WorkspaceError("NOT_FOUND", `.curlz/${dir} is missing`, dir);
    }
  }
  const meta = parseMetaDoc(await readJson(root, "meta.json"), "meta.json");
  const issues: LoadIssue[] = [];
  const collectionsRoot = await walkFolder(root, "collections", issues);
  const collections = splitCollections(collectionsRoot, issues);
  const requests = await walkRequests(root, issues);
  return { workspace: { root, meta, collections, requests }, issues };
};
