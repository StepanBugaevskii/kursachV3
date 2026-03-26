import { FileMessage } from "./fileProtocol";

export class MessageSerializer {
  static serialize(message: FileMessage): Uint8Array {
    const json = JSON.stringify({
      type: message.type,
      fileId: message.fileId,
      index: message.index,
      data: message.type === "chunk" ? Array.from(message.data) : undefined,
    });
    return new TextEncoder().encode(json);
  }

  static deserialize(data: Uint8Array): FileMessage {
    const json = new TextDecoder().decode(data);
    const obj = JSON.parse(json);

    if (obj.type === "chunk") {
      return {
        type: "chunk",
        fileId: obj.fileId,
        index: obj.index,
        data: new Uint8Array(obj.data),
      };
    } else {
      return {
        type: "request_chunk",
        fileId: obj.fileId,
        index: obj.index,
      };
    }
  }
}
