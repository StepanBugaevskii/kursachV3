import { useState, useEffect } from 'react';
import { webrtcClient } from '@/lib/p2p/webrtcClient';
import { usersApi } from '@/modules/users/http/users.api';
import { filesApi } from '@/modules/files/http/files.api';

export interface ConnectedPeer {
  peerId: string;
  userId: string;
  displayName: string;
  isConnected: boolean;
  files: any[];
}

export const useConnectedPeers = () => {
  const [connectedPeers, setConnectedPeers] = useState<ConnectedPeer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConnectedPeers = async () => {
    setLoading(true);
    try {
      const connectedPeerIds = webrtcClient.getConnectedPeers();
      
      if (connectedPeerIds.length === 0) {
        setConnectedPeers([]);
        return;
      }

      // Получаем информацию о пирах
      const peersData = await Promise.all(
        connectedPeerIds.map(async (peerId) => {
          try {
            // Получаем peer из backend
            const peerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/peers`);
            const peers = await peerResponse.json();
            const peer = peers.find((p: any) => p.peerId === peerId);
            
            if (!peer) return null;

            // Получаем пользователя
            const user = await usersApi.getOne(peer.userId);
            
            // Получаем файлы пользователя
            const allFiles = await filesApi.getAll();
            const userFiles = allFiles.filter(f => f.ownerId === peer.userId);

            return {
              peerId: peer.peerId,
              userId: peer.userId,
              displayName: user.displayName,
              isConnected: webrtcClient.isConnected(peerId),
              files: userFiles,
            };
          } catch (error) {
            console.error('Failed to fetch peer data:', error);
            return null;
          }
        })
      );

      setConnectedPeers(peersData.filter(p => p !== null) as ConnectedPeer[]);
    } catch (error) {
      console.error('Failed to fetch connected peers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectedPeers();
    
    // Обновляем каждые 5 секунд
    const interval = setInterval(fetchConnectedPeers, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return { connectedPeers, loading, refetch: fetchConnectedPeers };
};
