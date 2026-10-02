import type { KeyValue } from "../types";
import { asObject, bool, fail, str } from "./common";

export const parseKeyValueList = (
  path: string,
  field: string,
  raw: unknown,
): KeyValue[] => {
  if (!Array.isArray(raw)) fail(path, field, "expected a list");
  return raw.map((row, i) => parseRow(path, `${field}[${i}]`, row));
};

const parseRow = (path: string, field: string, raw: unknown): KeyValue => {
  const row = asObject(path, field, raw);
  const enabled =
    row.enabled === undefined
      ? true
      : bool(path, `${field}.enabled`, row.enabled);
  return {
    key: str(path, `${field}.key`, row.key),
    value: str(path, `${field}.value`, row.value),
    enabled,
  };
};
