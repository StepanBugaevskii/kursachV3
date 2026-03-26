import { useState, useEffect } from 'react';
import { webrtcClient } from '@/lib/p2p/webrtcClient';
import { message } from 'antd';
import { useUserStore } from '@/modules/users/model/userStore';

export const useP2P = () => {
  const [initialized, setInitialized] = useState(false);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useUserStore();

  const initialize = async () => {
    if (!currentUser) {
      message.error('User not logged in');
      return;
    }

    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      await webrtcClient.initialize(currentUser.id, backendUrl);
      setPeerId(webrtcClient.getPeerId());
      setInitialized(true);
      message.success('P2P network initialized');
    } catch (error) {
      message.error('Failed to initialize P2P network');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const connect = async (peerId: string) => {
    try {
      await webrtcClient.connectToPeer(peerId);
      updateConnectedPeers();
      message.success('Connected to peer');
    } catch (error) {
      message.error('Failed to connect to peer');
      console.error(error);
    }
  };

  const disconnect = (peerId: string) => {
    // WebRTC connections are managed automatically
    updateConnectedPeers();
  };

  const updateConnectedPeers = () => {
    setConnectedPeers(webrtcClient.getConnectedPeers());
  };

  const shutdown = async () => {
    try {
      await webrtcClient.shutdown();
      setInitialized(false);
      setPeerId(null);
      setConnectedPeers([]);
    } catch (error) {
      console.error('Failed to shutdown P2P client:', error);
    }
  };

  useEffect(() => {
    // Auto-initialize on mount when user is available
    if (!initialized && !loading && currentUser) {
      initialize();
    }

    // Cleanup on unmount
    return () => {
      if (initialized) {
        shutdown();
      }
    };
  }, [currentUser]);

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
