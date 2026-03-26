import api from '@/lib/api';

export interface Peer {
  id: string;
  peerId: string;
  userId: string;
  nodeType: string;
  isOnline: boolean;
  lastSeenAt: string;
  clientType: string;
  clientVersion?: string;
  ipAddress?: string;
  port?: number;
}

export interface RegisterPeerDto {
  peerId: string;
  userId: string;
  clientType: string;
  ipAddress?: string;
  port?: number;
}

export const peersApi = {
  register: async (peerData: RegisterPeerDto): Promise<Peer> => {
    const { data } = await api.post('/peers/register', peerData);
    return data;
  },

  getAll: async (): Promise<Peer[]> => {
    const { data } = await api.get('/peers');
    return data;
  },

  getOnline: async (): Promise<Peer[]> => {
    const { data } = await api.get('/peers/online');
    return data;
  },

  getOne: async (peerId: string): Promise<Peer> => {
    const { data } = await api.get(`/peers/${peerId}`);
    return data;
  },

  markOnline: async (peerId: string): Promise<void> => {
    await api.post(`/peers/${peerId}/online`);
  },

  markOffline: async (peerId: string): Promise<void> => {
    await api.post(`/peers/${peerId}/offline`);
  },

  delete: async (peerId: string): Promise<void> => {
    await api.delete(`/peers/${peerId}`);
  },
};
