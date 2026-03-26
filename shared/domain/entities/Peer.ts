export class Peer {
  constructor(
    public readonly peerId: string,
    public isOnline: boolean,
    public lastSeenAt: Date,
    public clientType: "web" | "desktop"
  ) {}

  markOnline() {
    this.isOnline = true;
    this.lastSeenAt = new Date();
  }

  markOffline() {
    this.isOnline = false;
  }
}