import { removePath } from "../storage/fs";
import type { FolderNode, Workspace } from "../types";
import { removeChild } from "../walk/tree";

export const deleteCollection = async (
  ws: Workspace,
  item: FolderNode,
): Promise<void> => {
  await removePath(ws.root, item.path);
  removeChild(ws, item);
};
