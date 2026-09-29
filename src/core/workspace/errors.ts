export type WorkspaceErrorCode =
  | "NOT_FOUND"
  | "INVALID_PATH"
  | "COLLISION"
  | "INVALID_DOC";

export class WorkspaceError extends Error {
  constructor(
    readonly code: WorkspaceErrorCode,
    message: string,
    readonly path?: string,
  ) {
    super(message);
    this.name = "WorkspaceError";
  }
}
