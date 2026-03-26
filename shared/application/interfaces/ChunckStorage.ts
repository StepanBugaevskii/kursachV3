export interface ChunkStorage {
  save(fileId: string, index: number, data: Uint8Array): Promise<void>;
  get(fileId: string, index: number): Promise<Uint8Array | null>;
  has(fileId: string, index: number): Promise<boolean>;
}