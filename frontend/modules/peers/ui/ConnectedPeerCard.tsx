'use client';

import { Card, Typography, Badge, Button, Collapse, List, Tag } from 'antd';
import { UserOutlined, FileOutlined, DownloadOutlined, LinkOutlined, DisconnectOutlined } from '@ant-design/icons';
import { ConnectedPeer } from '../hooks/useConnectedPeers';

const { Text, Title } = Typography;
const { Panel } = Collapse;

interface ConnectedPeerCardProps {
  peer: ConnectedPeer;
  onDownload?: (file: any) => void;
  onDisconnect?: (peerId: string) => void;
}

export const ConnectedPeerCard: React.FC<ConnectedPeerCardProps> = ({ 
  peer, 
  onDownload,
  onDisconnect 
}) => {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <Card className="w-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Badge status={peer.isConnected ? 'success' : 'default'} />
          <div>
            <div className="flex items-center gap-2">
              <UserOutlined className="text-lg" />
              <Title level={5} className="mb-0!">
                {peer.displayName}
              </Title>
            </div>
            <Text type="secondary" className="text-xs block mt-1">
              {peer.peerId}
            </Text>
          </div>
        </div>
        <Button
          danger
          size="small"
          icon={<DisconnectOutlined />}
          onClick={() => onDisconnect?.(peer.peerId)}
        >
          Disconnect
        </Button>
      </div>

      <div className="mb-3">
        <Tag color="blue" icon={<FileOutlined />}>
          {peer.files.length} {peer.files.length === 1 ? 'file' : 'files'}
        </Tag>
        <Tag color={peer.isConnected ? 'green' : 'red'} icon={<LinkOutlined />}>
          {peer.isConnected ? 'Connected' : 'Disconnected'}
        </Tag>
      </div>

      {peer.files.length > 0 && (
        <Collapse ghost>
          <Panel header={`View ${peer.files.length} files`} key="1">
            <List
              size="small"
              dataSource={peer.files}
              renderItem={(file: any) => (
                <List.Item
                  actions={[
                    <Button
                      key="download"
                      type="link"
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() => onDownload?.(file)}
                    >
                      Download
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<FileOutlined className="text-blue-500" />}
                    title={
                      <Text ellipsis className="text-sm">
                        {file.fileName}
                      </Text>
                    }
                    description={
                      <Text type="secondary" className="text-xs">
                        {formatSize(file.size)} • {file.mimeType.split('/')[1]}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Panel>
        </Collapse>
      )}

      {peer.files.length === 0 && (
        <Text type="secondary" className="text-sm">
          No files shared by this peer
        </Text>
      )}
    </Card>
  );
};
