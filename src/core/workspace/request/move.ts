import { WorkspaceError } from "../errors";
import {
  assertRequestFolder,
  assertSafePath,
  joinPath,
  parentOf,
  stemName,
  uniqueSlug,
} from "../paths";
import { movePath } from "../storage/fs";
import type { Workspace } from "../types";
import {
  findRequest,
  insertChild,
  listChildren,
  removeChild,
  takenStems,
} from "../walk/tree";

export const moveRequest = async (
  ws: Workspace,
  from: string,
  to: string | null,
): Promise<string> => {
  assertSafePath(from);
  const item = findRequest(ws, from);
  if (!item)
    throw new WorkspaceError("NOT_FOUND", `${from}: no such request`, from);
  const target = to ?? "requests";
  assertRequestFolder(target);
  if (target === parentOf(from)) return from;
  const siblings = listChildren(ws, target);
  const slug = uniqueSlug(stemName(from), takenStems(siblings));
  const newPath = joinPath(target, `${slug}.json`);
  await movePath(ws.root, from, newPath);
  removeChild(ws, item);
  item.path = newPath;
  insertChild(ws, target, item);
  return newPath;
};
