import { mkdir } from "node:fs/promises";
import {
  assertCollectionParent,
  assertName,
  joinPath,
  slugify,
  uniqueSlug,
} from "../paths";
import { abs } from "../storage/fs";
import type { FolderNode, Workspace } from "../types";
import { listChildren, takenFolders } from "../walk/tree";

export const createCollection = async (
  ws: Workspace,
  parent: string | null,
  name: string,
): Promise<FolderNode> => {
  assertName(name);
  const folder = parent ?? "collections";
  assertCollectionParent(folder);
  const siblings = listChildren(ws, folder);
  const slug = uniqueSlug(slugify(name), takenFolders(siblings));
  const node: FolderNode = {
    type: "folder",
    name: slug,
    path: joinPath(folder, slug),
    children: [],
  };
  await mkdir(abs(ws.root, node.path), { recursive: true });
  siblings.push(node);
  return node;
};
