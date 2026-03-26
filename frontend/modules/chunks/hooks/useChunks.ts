import { useState, useEffect } from 'react';
import { chunksApi, Chunk, ChunkReplica } from '../http/chunks.api';
import { message } from 'antd';

export const useChunks = (fileId: string) => {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchChunks = async () => {
    if (!fileId) return;
    
    setLoading(true);
    try {
      const data = await chunksApi.getByFile(fileId);
      setChunks(data);
    } catch (error) {
      message.error('Failed to fetch chunks');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChunks();
  }, [fileId]);

  return { chunks, loading, refetch: fetchChunks };
};

export const useChunkProviders = (chunkId: string) => {
  const [providers, setProviders] = useState<ChunkReplica[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProviders = async () => {
    if (!chunkId) return;
    
    setLoading(true);
    try {
      const data = await chunksApi.getProviders(chunkId);
      setProviders(data);
    } catch (error) {
      message.error('Failed to fetch providers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [chunkId]);

  return { providers, loading, refetch: fetchProviders };
};
