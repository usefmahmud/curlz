import { WorkspaceError } from "./errors";

export const slugify = (name: string): string => {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "request";
};

export const uniqueSlug = (name: string, taken: string[]): string => {
  const base = slugify(name);
  if (!taken.includes(base)) return base;
  let n = 2;
  while (taken.includes(`${base}-${n}`)) n++;
  return `${base}-${n}`;
};

export const joinPath = (...parts: string[]): string => {
  return parts.filter(Boolean).join("/");
};

export const parentOf = (path: string): string => {
  const i = path.lastIndexOf("/");
  return i === -1 ? "" : path.slice(0, i);
};

export const baseName = (path: string): string => {
  const i = path.lastIndexOf("/");
  return i === -1 ? path : path.slice(i + 1);
};

export const isSafeRel = (path: string): boolean => {
  if (path.length === 0 || path.startsWith("/")) return false;
  return !path.split("/").some((seg) => seg === ".." || seg === "");
};

export const stemName = (path: string): string => {
  const name = baseName(path);
  return name.endsWith(".json") ? name.slice(0, -".json".length) : name;
};

export const assertSafePath = (path: string): void => {
  if (!isSafeRel(path) || path === "collections" || path === "requests") {
    throw new WorkspaceError("INVALID_PATH", `${path}: not a valid path`, path);
  }
};

export const assertName = (name: string): void => {
  if (name.trim().length === 0) {
    throw new WorkspaceError("INVALID_DOC", "name cannot be blank");
  }
};

export const assertCollectionParent = (folder: string): void => {
  if (folder !== "collections" && !folder.startsWith("collections/")) {
    throw new WorkspaceError(
      "INVALID_PATH",
      `${folder}: not in collections/`,
      folder,
    );
  }
};

export const assertRequestFolder = (folder: string): void => {
  if (folder !== "requests" && !folder.startsWith("collections/")) {
    throw new WorkspaceError(
      "INVALID_PATH",
      `${folder}: not a request folder`,
      folder,
    );
  }
};
