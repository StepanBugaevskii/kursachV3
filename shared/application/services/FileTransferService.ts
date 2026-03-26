import { Transport } from "../interfaces/Transport";
import { ChunkStorage } from "../interfaces/ChunckStorage";
import { FileMessage } from "../../infrastructure/protocols/fileProtocol";

export class FileTransferService {
  constructor(
    private transport: Transport,
    private storage: ChunkStorage
  ) {}

  init() {
    this.transport.onMessage(async (peerId, raw) => {
      const message: FileMessage = JSON.parse(new TextDecoder().decode(raw));

      if (message.type === "chunk") {
        await this.storage.save(message.fileId, message.index, message.data);
      }

      if (message.type === "request_chunk") {
        const chunk = await this.storage.get(message.fileId, message.index);
        if (chunk) {
          await this.sendChunk(peerId, message.fileId, message.index, chunk);
        }
      }
    });
  }

  async sendChunk(
    peerId: string,
    fileId: string,
    index: number,
    data: Uint8Array
  ) {
    const message: FileMessage = {
      type: "chunk",
      fileId,
      index,
      data,
    };

    await this.transport.send(
      peerId,
      new TextEncoder().encode(JSON.stringify(message))
    );
  }

  async requestChunk(peerId: string, fileId: string, index: number) {
    const message: FileMessage = {
      type: "request_chunk",
      fileId,
      index,
    };

    await this.transport.send(
      peerId,
      new TextEncoder().encode(JSON.stringify(message))
    );
  }
}