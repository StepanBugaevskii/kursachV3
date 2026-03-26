export class FileAssembler {
  constructor(private storage: any) {}

  async assemble(fileId: string, totalChunks: number) {
    const chunks: Uint8Array[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const chunk = await this.storage.get(fileId, i);
      if (!chunk) throw new Error("Missing chunk");

      chunks.push(chunk);
    }

    return new Blob(chunks as any);
  }
}