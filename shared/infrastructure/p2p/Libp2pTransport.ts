import type { Libp2p } from "libp2p";
import { Transport } from "../../application/interfaces/Transport";
import { FILE_PROTOCOL } from "../protocols/fileProtocol";
import { pipe } from "it-pipe";
import { peerIdFromString } from "@libp2p/peer-id";

export class Libp2pTransport implements Transport {
  constructor(private node: Libp2p) {}

  async send(peerId: string, data: Uint8Array): Promise<void> {
    const peer = peerIdFromString(peerId);
    const stream: any = await this.node.dialProtocol(peer, FILE_PROTOCOL);
    await pipe([data], stream);
  }

  onMessage(handler: (peerId: string, data: Uint8Array) => void): void {
    this.node.handle(FILE_PROTOCOL, (data: any) => {
      const { stream, connection } = data;
      
      pipe(
        stream,
        async (source: any) => {
          try {
            for await (const chunk of source) {
              const bytes = chunk instanceof Uint8Array ? chunk : chunk.subarray();
              handler(connection.remotePeer.toString(), bytes);
            }
          } catch (error) {
            console.error("Error handling message:", error);
          }
        }
      ).catch(err => console.error("Pipe error:", err));
    });
  }
}