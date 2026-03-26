import { create } from 'zustand';
import { Peer } from '../http/peers.api';

interface PeerStore {
  currentPeer: Peer | null;
  connectedPeers: Peer[];
  
  setCurrentPeer: (peer: Peer | null) => void;
  addConnectedPeer: (peer: Peer) => void;
  removeConnectedPeer: (peerId: string) => void;
  clearConnectedPeers: () => void;
}

export const usePeerStore = create<PeerStore>((set) => ({
  currentPeer: null,
  connectedPeers: [],
  
  setCurrentPeer: (peer) => set({ currentPeer: peer }),
  
  addConnectedPeer: (peer) => set((state) => ({
    connectedPeers: [...state.connectedPeers.filter(p => p.peerId !== peer.peerId), peer]
  })),
  
  removeConnectedPeer: (peerId) => set((state) => ({
    connectedPeers: state.connectedPeers.filter(p => p.peerId !== peerId)
  })),
  
  clearConnectedPeers: () => set({ connectedPeers: [] }),
}));
