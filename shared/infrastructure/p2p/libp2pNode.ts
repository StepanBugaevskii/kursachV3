import { createLibp2p } from "libp2p";
import { webRTC } from "@libp2p/webrtc";
import { webSockets } from "@libp2p/websockets";
import { yamux } from "@chainsafe/libp2p-yamux";
import { noise } from "@chainsafe/libp2p-noise";
import { bootstrap } from "@libp2p/bootstrap";

export async function createNode(bootstrapPeers: string[]) {
  return await createLibp2p({
    transports: [webRTC(), webSockets()],
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()],
    peerDiscovery: bootstrapPeers.length > 0 ? [bootstrap({ list: bootstrapPeers })] : [],
  });
}