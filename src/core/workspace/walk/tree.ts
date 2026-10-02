import { WorkspaceError } from "../errors";
import { joinPath, parentOf, stemName } from "../paths";
import type { FolderNode, ItemNode, RequestNode, Workspace } from "../types";

export const findItem = (ws: Workspace, path: string): ItemNode | undefined => {
  return (
    findIn(ws.collections, path) ?? ws.requests.find((r) => r.path === path)
  );
};

const findIn = (nodes: ItemNode[], path: string): ItemNode | undefined => {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.type === "folder") {
      const hit = findIn(node.children, path);
      if (hit) return hit;
    }
  }
  return undefined;
};

export const findRequest = (
  ws: Workspace,
  path: string,
): RequestNode | undefined => {
  const node = findItem(ws, path);
  return node?.type === "request" ? node : undefined;
};

export const listChildren = (ws: Workspace, folder: string): ItemNode[] => {
  if (folder === "collections") return ws.collections;
  if (folder === "requests") return ws.requests;
  const node = findItem(ws, folder);
  if (node?.type !== "folder") {
    throw new WorkspaceError("NOT_FOUND", `${folder}: no such folder`, folder);
  }
  return node.children;
};

const isFolder = (n: ItemNode): n is FolderNode => n.type === "folder";
const isRequest = (n: ItemNode): n is RequestNode => n.type === "request";

export const takenFolders = (siblings: ItemNode[]): string[] => {
  return siblings.filter(isFolder).map((f) => f.name);
};

export const takenStems = (siblings: ItemNode[]): string[] => {
  return siblings.filter(isRequest).map((r) => stemName(r.path));
};

export const repath = (node: ItemNode, newPath: string): void => {
  const old = node.path;
  node.path = newPath;
  if (node.type !== "folder") return;
  for (const child of node.children) {
    repath(child, joinPath(newPath, child.path.slice(old.length + 1)));
  }
};

export const insertChild = (
  ws: Workspace,
  folder: string,
  node: ItemNode,
): void => {
  listChildren(ws, folder).push(node);
};

export const removeChild = (ws: Workspace, node: ItemNode): void => {
  const siblings = listChildren(ws, parentOf(node.path));
  const i = siblings.indexOf(node);
  if (i !== -1) siblings.splice(i, 1);
};
