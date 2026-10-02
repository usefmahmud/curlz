import { deleteCollection } from "./collection/delete";
import { renameCollection } from "./collection/rename";
import { WorkspaceError } from "./errors";
import { assertSafePath } from "./paths";
import { deleteRequest } from "./request/delete";
import { renameRequest } from "./request/rename";
import type { Workspace } from "./types";
import { findItem } from "./walk/tree";

export const renameItem = async (
  ws: Workspace,
  path: string,
  newName: string,
): Promise<string> => {
  assertSafePath(path);
  const item = findItem(ws, path);
  if (!item)
    throw new WorkspaceError("NOT_FOUND", `${path}: no such item`, path);
  return item.type === "folder"
    ? renameCollection(ws, item, newName)
    : renameRequest(ws, item, newName);
};

export const deleteItem = async (
  ws: Workspace,
  path: string,
): Promise<void> => {
  assertSafePath(path);
  const item = findItem(ws, path);
  if (!item)
    throw new WorkspaceError("NOT_FOUND", `${path}: no such item`, path);
  if (item.type === "folder") await deleteCollection(ws, item);
  else await deleteRequest(ws, item);
};

export { createCollection } from "./collection/create";
export { WorkspaceError, type WorkspaceErrorCode } from "./errors";
export { createRequest } from "./request/create";
export { duplicateRequest } from "./request/duplicate";
export { moveRequest } from "./request/move";
export { readRequest, saveRequest } from "./request/save";
export {
  type AuthDoc,
  type AuthType,
  type BodyDoc,
  type BodyType,
  type FolderNode,
  type HttpMethod,
  type ItemNode,
  type KeyValue,
  type LoadIssue,
  METHODS,
  type MetaDoc,
  type RequestDoc,
  type RequestNode,
  type SettingsDoc,
  type Workspace,
} from "./types";
export { initWorkspace } from "./walk/init";
export { type LoadResult, loadWorkspace } from "./walk/load";
