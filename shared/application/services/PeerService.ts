import { Peer } from "../../domain/entities/Peer";

export class PeerService {
  constructor(private readonly repo: any) {}

  async connect(peerId: string) {
    const peer = new Peer(peerId, true, new Date(), "web");
    await this.repo.save(peer);
    return peer;
  }
}