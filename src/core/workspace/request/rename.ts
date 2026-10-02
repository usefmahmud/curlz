import { WorkspaceError } from "../errors";
import { parseRequestDoc } from "../parse/request";
import { assertName, joinPath, parentOf, slugify, stemName } from "../paths";
import { serializeRequest } from "../serialize";
import { movePath, writeText } from "../storage/fs";
import type { RequestNode, Workspace } from "../types";
import { listChildren, takenStems } from "../walk/tree";

export const renameRequest = async (
  ws: Workspace,
  item: RequestNode,
  newName: string,
): Promise<string> => {
  assertName(newName);
  const path = item.path;
  const doc = parseRequestDoc({ ...item.doc, name: newName }, path);
  const slug = slugify(newName);
  const siblings = listChildren(ws, parentOf(path));
  const taken = takenStems(siblings).filter((s) => s !== stemName(path));
  if (taken.includes(slug)) {
    throw new WorkspaceError(
      "COLLISION",
      `${newName}: that name is taken`,
      joinPath(parentOf(path), `${slug}.json`),
    );
  }
  const newPath = joinPath(parentOf(path), `${slug}.json`);
  if (newPath !== path) {
    await movePath(ws.root, path, newPath);
    item.path = newPath;
  }
  item.name = doc.name;
  item.doc = doc;
  await writeText(ws.root, item.path, serializeRequest(doc));
  return item.path;
};
