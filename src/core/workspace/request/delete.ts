import { removePath } from "../storage/fs";
import type { RequestNode, Workspace } from "../types";
import { removeChild } from "../walk/tree";

export const deleteRequest = async (
  ws: Workspace,
  item: RequestNode,
): Promise<void> => {
  await removePath(ws.root, item.path);

  removeChild(ws, item);
};
