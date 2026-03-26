import { useState, useEffect } from 'react';
import { peersApi, Peer } from '../http/peers.api';
import { message } from 'antd';
import { socketService } from '@/lib/socket';

export const usePeers = () => {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPeers = async () => {
    setLoading(true);
    try {
      const data = await peersApi.getAll();
      setPeers(data);
    } catch (error) {
      message.error('Failed to fetch peers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeers();

    // Listen to real-time peer updates
    const socket = socketService.connect();
    
    socketService.onPeerOnline((data) => {
      fetchPeers();
    });

    socketService.onPeerOffline((data) => {
      fetchPeers();
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  return { peers, loading, refetch: fetchPeers };
};

export const useOnlinePeers = () => {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOnlinePeers = async () => {
    setLoading(true);
    try {
      const data = await peersApi.getOnline();
      setPeers(data);
    } catch (error) {
      message.error('Failed to fetch online peers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnlinePeers();
  }, []);

  return { peers, loading, refetch: fetchOnlinePeers };
};
