import { WorkspaceError } from "../errors";
import {
  assertSafePath,
  joinPath,
  parentOf,
  slugify,
  uniqueSlug,
} from "../paths";
import { serializeRequest } from "../serialize";
import { writeText } from "../storage/fs";
import type { ItemNode, RequestNode, Workspace } from "../types";
import { findRequest, listChildren, takenStems } from "../walk/tree";

export const duplicateRequest = async (
  ws: Workspace,
  path: string,
): Promise<RequestNode> => {
  assertSafePath(path);
  const item = findRequest(ws, path);
  if (!item)
    throw new WorkspaceError("NOT_FOUND", `${path}: no such request`, path);
  const parent = parentOf(path);
  const siblings = listChildren(ws, parent);
  const name = uniqueCopyName(item.doc.name, siblings);
  const slug = uniqueSlug(slugify(name), takenStems(siblings));
  const doc = structuredClone(item.doc);
  doc.name = name;
  const node: RequestNode = {
    type: "request",
    name,
    path: joinPath(parent, `${slug}.json`),
    doc,
  };
  await writeText(ws.root, node.path, serializeRequest(doc));
  siblings.splice(siblings.indexOf(item) + 1, 0, node);
  return node;
};

const uniqueCopyName = (base: string, siblings: ItemNode[]): string => {
  const names = new Set(
    siblings.filter((s) => s.type === "request").map((s) => s.name),
  );
  let candidate = `${base} copy`;
  let n = 2;
  while (names.has(candidate)) candidate = `${base} copy ${n++}`;
  return candidate;
};
