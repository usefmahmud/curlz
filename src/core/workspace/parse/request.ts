import { type HttpMethod, METHODS, type RequestDoc } from "../types";
import { asObject, fail, str } from "./common";
import { parseKeyValueList } from "./kv";
import {
  DEFAULT_SETTINGS,
  parseAuth,
  parseBody,
  parseSettings,
} from "./options";

export const defaultRequestDoc = (name: string): RequestDoc => {
  return {
    name,
    method: "GET",
    url: "",
    headers: [],
    params: [],
    auth: { type: "none" },
    body: { type: "none", content: "" },
    settings: { ...DEFAULT_SETTINGS },
  };
};

export const parseMethod = (path: string, raw: unknown): HttpMethod => {
  const value = str(path, "method", raw);
  if (!METHODS.includes(value as HttpMethod)) {
    fail(path, "method", `expected one of ${METHODS.join(", ")}`);
  }
  return value as HttpMethod;
};

export const parseRequestDoc = (raw: unknown, path: string): RequestDoc => {
  const obj = asObject(path, "", raw);
  return {
    name: str(path, "name", obj.name),
    method: parseMethod(path, obj.method),
    url: str(path, "url", obj.url),
    headers:
      obj.headers === undefined
        ? []
        : parseKeyValueList(path, "headers", obj.headers),
    params:
      obj.params === undefined
        ? []
        : parseKeyValueList(path, "params", obj.params),
    auth: parseAuth(path, obj.auth),
    body: parseBody(path, obj.body),
    settings: parseSettings(path, obj.settings),
  };
};
