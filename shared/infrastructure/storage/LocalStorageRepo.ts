import { ChunkStorage } from "../../application/interfaces/ChunckStorage";

export class LocalStorageRepo implements ChunkStorage {
  private storage = new Map<string, Uint8Array>();

  async save(fileId: string, index: number, data: Uint8Array) {
    this.storage.set(`${fileId}:${index}`, data);
  }

  async get(fileId: string, index: number) {
    return this.storage.get(`${fileId}:${index}`) || null;
  }

  async has(fileId: string, index: number) {
    return this.storage.has(`${fileId}:${index}`);
  }
}