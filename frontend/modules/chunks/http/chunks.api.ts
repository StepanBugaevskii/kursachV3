import api from '@/lib/api';

export interface Chunk {
  id: string;
  fileId: string;
  chunkIndex: number;
  chunkHash: string;
  chunkSize: number;
  compressionType?: string;
  encryptionStatus: boolean;
}

export interface ChunkReplica {
  id: string;
  chunkId: string;
  peerId: string;
  replicaPriority: number;
  healthStatus: string;
  lastVerifiedAt: string;
}

export const chunksApi = {
  getByFile: async (fileId: string): Promise<Chunk[]> => {
    const { data } = await api.get('/chunks', { params: { fileId } });
    return data;
  },

  getProviders: async (chunkId: string): Promise<ChunkReplica[]> => {
    const { data } = await api.get(`/chunks/${chunkId}/providers`);
    return data;
  },

  create: async (chunkData: Partial<Chunk>): Promise<Chunk> => {
    const { data } = await api.post('/chunks', chunkData);
    return data;
  },

  addReplica: async (replicaData: Partial<ChunkReplica>): Promise<ChunkReplica> => {
    const { data } = await api.post('/chunks/replicas', replicaData);
    return data;
  },
};
