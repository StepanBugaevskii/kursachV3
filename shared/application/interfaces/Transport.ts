export interface Transport {
  send(peerId: string, data: Uint8Array): Promise<void>;
  onMessage(handler: (peerId: string, data: Uint8Array) => void): void;
}