import type {
  AuthDoc,
  AuthType,
  BodyDoc,
  BodyType,
  SettingsDoc,
} from "../types";
import { asObject, bool, fail, int, optStr, str } from "./common";

export const AUTH_TYPES: readonly AuthType[] = [
  "none",
  "bearer",
  "basic",
  "apikey",
];
export const BODY_TYPES: readonly BodyType[] = [
  "none",
  "json",
  "text",
  "form",
  "multipart",
];

export const DEFAULT_SETTINGS: SettingsDoc = {
  timeout_ms: 30000,
  follow_redirects: true,
  insecure: false,
};

export const parseAuth = (path: string, raw: unknown): AuthDoc => {
  if (raw === undefined) return { type: "none" };
  const obj = asObject(path, "auth", raw);
  const type = oneOf(path, "auth.type", obj.type, AUTH_TYPES);
  return {
    type,
    token: optStr(path, "auth.token", obj.token),
    username: optStr(path, "auth.username", obj.username),
    password: optStr(path, "auth.password", obj.password),
    key: optStr(path, "auth.key", obj.key),
    value: optStr(path, "auth.value", obj.value),
  };
};

export const parseBody = (path: string, raw: unknown): BodyDoc => {
  if (raw === undefined) return { type: "none", content: "" };
  const obj = asObject(path, "body", raw);
  const type = oneOf(path, "body.type", obj.type, BODY_TYPES);
  const content =
    obj.content === undefined ? "" : str(path, "body.content", obj.content);
  return { type, content };
};

export const parseSettings = (path: string, raw: unknown): SettingsDoc => {
  if (raw === undefined) return { ...DEFAULT_SETTINGS };
  const obj = asObject(path, "settings", raw);
  const settings: SettingsDoc = {
    timeout_ms:
      obj.timeout_ms === undefined
        ? DEFAULT_SETTINGS.timeout_ms
        : int(path, "settings.timeout_ms", obj.timeout_ms),
    follow_redirects:
      obj.follow_redirects === undefined
        ? DEFAULT_SETTINGS.follow_redirects
        : bool(path, "settings.follow_redirects", obj.follow_redirects),
    insecure:
      obj.insecure === undefined
        ? DEFAULT_SETTINGS.insecure
        : bool(path, "settings.insecure", obj.insecure),
  };
  if (settings.timeout_ms < 0) {
    fail(path, "settings.timeout_ms", "cannot be negative");
  }
  return settings;
};

const oneOf = <T extends string>(
  path: string,
  field: string,
  raw: unknown,
  allowed: readonly T[],
): T => {
  const value = str(path, field, raw);
  if (!allowed.includes(value as T)) {
    fail(path, field, `expected one of ${allowed.join(", ")}`);
  }
  return value as T;
};
