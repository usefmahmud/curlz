import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { WorkspaceError } from "../errors";
import { defaultMetaDoc } from "../parse/meta";
import { serializeMeta } from "../serialize";
import { CURLZ_DIR, pathExists, writeText } from "../storage/fs";
import type { Workspace } from "../types";

export const initWorkspace = async (
  root: string,
  name: string,
): Promise<Workspace> => {
  if (await pathExists(join(root, CURLZ_DIR))) {
    throw new WorkspaceError("COLLISION", `.curlz already exists in ${root}`);
  }
  await mkdir(join(root, CURLZ_DIR, "collections"), { recursive: true });
  await mkdir(join(root, CURLZ_DIR, "requests"), { recursive: true });
  const meta = defaultMetaDoc(name);
  await writeText(root, "meta.json", serializeMeta(meta));
  return { root, meta, collections: [], requests: [] };
};
