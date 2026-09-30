import type { MetaDoc, RequestDoc } from "./types";

export const serializeRequest = (doc: RequestDoc): string => {
  return `${JSON.stringify(doc, null, 2)}\n`;
};

export const serializeMeta = (meta: MetaDoc): string => {
  return `${JSON.stringify(meta, null, 2)}\n`;
};
