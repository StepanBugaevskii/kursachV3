import { Chunk } from "../value-objects/Chunk";

export class File {
  private chunks: Chunk[] = [];

  constructor(
    public readonly id: string,
    public ownerId: string,
    public fileName: string,
    public size: number,
    public hash: string,
    public createdAt: Date = new Date()
  ) {}

  addChunk(chunk: Chunk) {
    this.chunks.push(chunk);
  }

  getChunks() {
    return this.chunks;
  }
}