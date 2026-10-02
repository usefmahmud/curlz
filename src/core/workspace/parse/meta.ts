import type { MetaDoc } from "../types";
import { asObject, fail, str } from "./common";

export const SCHEMA_VERSION = 1;

export const defaultMetaDoc = (name: string): MetaDoc => {
  return { schemaVersion: SCHEMA_VERSION, name };
};

export const parseMetaDoc = (raw: unknown, path: string): MetaDoc => {
  const obj = asObject(path, "", raw);
  if (obj.schemaVersion !== SCHEMA_VERSION) {
    fail(
      path,
      "schemaVersion",
      `expected ${SCHEMA_VERSION}, got ${JSON.stringify(obj.schemaVersion)}`,
    );
  }
  return { schemaVersion: SCHEMA_VERSION, name: str(path, "name", obj.name) };
};
