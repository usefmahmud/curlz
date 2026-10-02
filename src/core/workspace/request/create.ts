import { defaultRequestDoc } from "../parse/request";
import {
  assertName,
  assertRequestFolder,
  joinPath,
  slugify,
  uniqueSlug,
} from "../paths";
import { serializeRequest } from "../serialize";
import { writeText } from "../storage/fs";
import type { RequestNode, Workspace } from "../types";
import { listChildren, takenStems } from "../walk/tree";

export const createRequest = async (
  ws: Workspace,
  collection: string | null,
  name: string,
): Promise<RequestNode> => {
  assertName(name);
  const folder = collection ?? "requests";
  assertRequestFolder(folder);
  const siblings = listChildren(ws, folder);
  const slug = uniqueSlug(slugify(name), takenStems(siblings));
  const doc = defaultRequestDoc(name);
  const node: RequestNode = {
    kind: "request",
    name: doc.name,
    path: joinPath(folder, `${slug}.json`),
    doc,
  };
  await writeText(ws.root, node.path, serializeRequest(doc));
  siblings.push(node);
  return node;
};
