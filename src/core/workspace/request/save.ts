import { WorkspaceError } from "../errors";
import { parseRequestDoc } from "../parse/request";
import {
  assertSafePath,
  joinPath,
  parentOf,
  slugify,
  stemName,
} from "../paths";
import { serializeRequest } from "../serialize";
import { movePath, readJson, writeText } from "../storage/fs";
import type { RequestDoc, Workspace } from "../types";
import { findRequest, listChildren, takenStems } from "../walk/tree";

export const saveRequest = async (
  ws: Workspace,
  path: string,
  doc: RequestDoc,
): Promise<string> => {
  assertSafePath(path);
  const item = findRequest(ws, path);
  if (!item)
    throw new WorkspaceError("NOT_FOUND", `${path}: no such request`, path);
  const valid = parseRequestDoc(doc, path);
  const parent = parentOf(path);
  const siblings = listChildren(ws, parent);
  const slug = slugify(valid.name);
  const taken = takenStems(siblings).filter((s) => s !== stemName(path));
  if (taken.includes(slug)) {
    throw new WorkspaceError(
      "COLLISION",
      `${valid.name}: that name is taken`,
      joinPath(parent, `${slug}.json`),
    );
  }
  const newPath = joinPath(parent, `${slug}.json`);
  if (newPath !== path) await movePath(ws.root, path, newPath);
  await writeText(ws.root, newPath, serializeRequest(valid));
  item.path = newPath;
  item.name = valid.name;
  item.doc = valid;
  return newPath;
};

export const readRequest = async (
  ws: Workspace,
  path: string,
): Promise<RequestDoc> => {
  return parseRequestDoc(await readJson(ws.root, path), path);
};
