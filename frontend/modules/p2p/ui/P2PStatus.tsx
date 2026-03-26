import { Card, Badge, Typography, Space, Button, Input, Form } from 'antd';
import { ApiOutlined, LinkOutlined } from '@ant-design/icons';
import { useP2P } from '../hooks/useP2P';
import { useState } from 'react';

const { Text, Title } = Typography;

export const P2PStatus: React.FC = () => {
  const { initialized, peerId, connectedPeers, connect } = useP2P();
  const [connectForm] = Form.useForm();

  const handleConnect = (values: { multiaddr: string }) => {
    connect(values.multiaddr);
    connectForm.resetFields();
  };

  return (
    <Card>
      <Space direction="vertical" className="w-full" size="large">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge status={initialized ? 'success' : 'default'} />
            <Title level={5} className="mb-0!">
              P2P Network
            </Title>
          </div>
          <ApiOutlined className="text-2xl text-blue-500" />
        </div>

        {peerId && (
          <div>
            <Text type="secondary" className="text-xs">Your Peer ID:</Text>
            <Text className="block text-xs font-mono break-all">{peerId}</Text>
          </div>
        )}

        <div>
          <Text type="secondary">Connected Peers: {connectedPeers.length}</Text>
        </div>

        <Form form={connectForm} onFinish={handleConnect} layout="inline">
          <Form.Item name="multiaddr" className="flex-1" rules={[{ required: true }]}>
            <Input placeholder="/ip4/127.0.0.1/tcp/4001/p2p/..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<LinkOutlined />}>
              Connect
            </Button>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  );
};
