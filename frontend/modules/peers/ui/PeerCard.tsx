import { Card, Badge, Typography, Tag, Space } from 'antd';
import { ApiOutlined, DesktopOutlined, MobileOutlined } from '@ant-design/icons';
import { Peer } from '../http/peers.api';

const { Text, Title } = Typography;

interface PeerCardProps {
  peer: Peer;
  onClick?: () => void;
}

export const PeerCard: React.FC<PeerCardProps> = ({ peer, onClick }) => {
  const getClientIcon = () => {
    if (peer.clientType === 'desktop') return <DesktopOutlined />;
    if (peer.clientType === 'web') return <MobileOutlined />;
    return <ApiOutlined />;
  };

  return (
    <Card hoverable onClick={onClick} className="w-full">
      <div className="flex items-center gap-4">
        <Badge status={peer.isOnline ? 'success' : 'default'} dot offset={[-5, 5]}>
          <div className="text-4xl text-blue-500">
            {getClientIcon()}
          </div>
        </Badge>
        <div className="flex-1">
          <Title level={5} className="!mb-1" ellipsis>
            {peer.peerId.substring(0, 16)}...
          </Title>
          <Text type="secondary" className="text-sm">
            {peer.nodeType}
          </Text>
          <div className="mt-2">
            <Tag color={peer.isOnline ? 'green' : 'red'}>
              {peer.isOnline ? 'Online' : 'Offline'}
            </Tag>
            <Tag>{peer.clientType}</Tag>
          </div>
          {peer.ipAddress && (
            <Text type="secondary" className="text-xs block mt-2">
              {peer.ipAddress}:{peer.port}
            </Text>
          )}
        </div>
      </div>
    </Card>
  );
};
