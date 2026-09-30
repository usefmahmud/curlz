export const METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
] as const;
export type HttpMethod = (typeof METHODS)[number];

export type AuthType = "none" | "bearer" | "basic" | "apikey";
export type BodyType = "json" | "text";

export interface AuthDoc {
  type: AuthType;
  token?: string;
  username?: string;
  password?: string;
  key?: string;
  value?: string;
}

export interface BodyDoc {
  type: BodyType;
  content: string;
}

export interface KeyValue {
  key: string;
  value: string;
  enabled: boolean;
}

export interface SettingsDoc {
  timeout_ms: number;
  follow_redirects: boolean;
  insecure: boolean;
}

export interface RequestDoc {
  name: string;
  method: HttpMethod;
  url: string;
  headers: KeyValue[];
  params: KeyValue[];
  auth: AuthDoc;
  body: BodyDoc;
  settings: SettingsDoc;
}

export interface MetaDoc {
  schemaVersion: number;
  name: string;
}

export interface FolderNode {
  type: "folder";
  name: string;
  path: string;
  children: ItemNode[];
}

export interface RequestNode {
  type: "request";
  name: string;
  path: string;
  doc: RequestDoc;
}

export type ItemNode = FolderNode | RequestNode;

export interface Workspace {
  root: string;
  meta: MetaDoc;
  collections: FolderNode[];
  requests: RequestNode[];
}

export interface LoadIssue {
  path: string;
  message: string;
}
