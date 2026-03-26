export const FILE_PROTOCOL = "/file-transfer/1.0.0";

export type FileMessage =
  | { type: "chunk"; fileId: string; index: number; data: Uint8Array }
  | { type: "request_chunk"; fileId: string; index: number };