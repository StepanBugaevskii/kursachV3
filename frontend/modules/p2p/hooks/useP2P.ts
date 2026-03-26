import { useState, useEffect } from 'react';
import { p2pClient } from '@/lib/p2p/libp2pClient';
import { message } from 'antd';

export const useP2P = () => {
  const [initialized, setInitialized] = useState(false);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const initialize = async (bootstrapPeers: string[] = []) => {
    setLoading(true);
    try {
      await p2pClient.initialize(bootstrapPeers);
      setPeerId(p2pClient.getPeerId());
      setInitialized(true);
      message.success('P2P network initialized');
    } catch (error) {
      message.error('Failed to initialize P2P network');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const connect = async (multiaddr: string) => {
    try {
      await p2pClient.connect(multiaddr);
      updateConnectedPeers();
      message.success('Connected to peer');
    } catch (error) {
      message.error('Failed to connect to peer');
      console.error(error);
    }
  };

  const disconnect = (peerId: string) => {
    try {
      p2pClient.disconnect(peerId);
      updateConnectedPeers();
      message.success('Disconnected from peer');
    } catch (error) {
      message.error('Failed to disconnect');
      console.error(error);
    }
  };

  const updateConnectedPeers = () => {
    setConnectedPeers(p2pClient.getConnectedPeers());
  };

  const shutdown = async () => {
    try {
      await p2pClient.shutdown();
      setInitialized(false);
      setPeerId(null);
      setConnectedPeers([]);
    } catch (error) {
      console.error('Failed to shutdown P2P client:', error);
    }
  };

  useEffect(() => {
    // Auto-initialize on mount
    if (!initialized && !loading) {
      initialize();
    }

    // Cleanup on unmount
    return () => {
      shutdown();
    };
  }, []);

  return {
    initialized,
    peerId,
    connectedPeers,
    loading,
    initialize,
    connect,
    disconnect,
    updateConnectedPeers,
  };
};
