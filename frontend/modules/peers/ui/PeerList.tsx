import { List, Spin, Empty, Segmented } from 'antd';
import { useState } from 'react';
import { PeerCard } from './PeerCard';
import { Peer } from '../http/peers.api';

interface PeerListProps {
  peers: Peer[];
  loading?: boolean;
  onPeerClick?: (peer: Peer) => void;
}

export const PeerList: React.FC<PeerListProps> = ({ peers, loading, onPeerClick }) => {
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');

  const filteredPeers = peers.filter(peer => {
    if (filter === 'online') return peer.isOnline;
    if (filter === 'offline') return !peer.isOnline;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Segmented
          options={[
            { label: `All (${peers.length})`, value: 'all' },
            { label: `Online (${peers.filter(p => p.isOnline).length})`, value: 'online' },
            { label: `Offline (${peers.filter(p => !p.isOnline).length})`, value: 'offline' },
          ]}
          value={filter}
          onChange={(value) => setFilter(value as any)}
        />
      </div>

      {filteredPeers.length === 0 ? (
        <Empty description="No peers found" />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 4 }}
          dataSource={filteredPeers}
          renderItem={(peer) => (
            <List.Item>
              <PeerCard peer={peer} onClick={() => onPeerClick?.(peer)} />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};
