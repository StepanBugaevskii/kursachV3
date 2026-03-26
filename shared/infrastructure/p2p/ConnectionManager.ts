import type { Libp2p } from "libp2p";
import { multiaddr } from "@multiformats/multiaddr";

export class ConnectionManager {
  private connections = new Map<string, any>();

  constructor(private node: Libp2p) {
    this.setupListeners();
  }

  private setupListeners() {
    this.node.addEventListener("peer:connect", (event) => {
      const peerId = event.detail.toString();
      this.connections.set(peerId, event.detail);
    });

    this.node.addEventListener("peer:disconnect", (event) => {
      const peerId = event.detail.toString();
      this.connections.delete(peerId);
    });
  }

  async connect(multiaddrStr: string): Promise<void> {
    const addr = multiaddr(multiaddrStr);
    await this.node.dial(addr);
  }

  disconnect(peerId: string): void {
    const connection = this.connections.get(peerId);
    if (connection) {
      connection.close();
      this.connections.delete(peerId);
    }
  }

  getConnectedPeers(): string[] {
    return Array.from(this.connections.keys());
  }

  isConnected(peerId: string): boolean {
    return this.connections.has(peerId);
  }
}
