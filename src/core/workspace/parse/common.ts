import { WorkspaceError } from "../errors";

export const fail: (path: string, field: string, message: string) => never = (
  path,
  field,
  message,
) => {
  const where = field ? `${path}: ${field}` : path;
  throw new WorkspaceError("INVALID_DOC", `${where}: ${message}`, path);
};

export const asObject = (
  path: string,
  field: string,
  raw: unknown,
): Record<string, unknown> => {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    fail(path, field, "expected an object");
  }
  return raw as Record<string, unknown>;
};

export const str = (path: string, field: string, raw: unknown): string => {
  if (typeof raw !== "string") fail(path, field, "expected a string");
  return raw;
};

export const optStr = (
  path: string,
  field: string,
  raw: unknown,
): string | undefined => {
  return raw === undefined ? undefined : str(path, field, raw);
};

export const bool = (path: string, field: string, raw: unknown): boolean => {
  if (typeof raw !== "boolean") fail(path, field, "expected true or false");
  return raw;
};

export const int = (path: string, field: string, raw: unknown): number => {
  if (typeof raw !== "number" || !Number.isInteger(raw)) {
    fail(path, field, "expected an integer");
  }
  return raw;
};
