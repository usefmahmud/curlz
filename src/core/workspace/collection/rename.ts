import { WorkspaceError } from "../errors";
import { assertName, joinPath, parentOf, slugify } from "../paths";
import { movePath } from "../storage/fs";
import type { FolderNode, Workspace } from "../types";
import { listChildren, repath, takenFolders } from "../walk/tree";

export const renameCollection = async (
  ws: Workspace,
  item: FolderNode,
  newName: string,
): Promise<string> => {
  assertName(newName);
  const path = item.path;
  const slug = slugify(newName);
  const newPath = joinPath(parentOf(path), slug);
  const siblings = listChildren(ws, parentOf(path));
  if (newPath !== path && takenFolders(siblings).includes(slug)) {
    throw new WorkspaceError(
      "COLLISION",
      `${newName}: that name is taken`,
      newPath,
    );
  }
  if (newPath !== path) {
    await movePath(ws.root, path, newPath);
    repath(item, newPath);
    item.name = slug;
  }
  return item.path;
};
