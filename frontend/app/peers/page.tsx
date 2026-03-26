'use client';

import { Layout, Typography, Button, Space, Statistic, Row, Col, Card } from 'antd';
import { ReloadOutlined, ApiOutlined } from '@ant-design/icons';
import { PeerList } from '@/modules/peers/ui/PeerList';
import { usePeers } from '@/modules/peers/hooks/usePeers';
import { useP2P } from '@/modules/p2p/hooks/useP2P';
import { P2PStatus } from '@/modules/p2p/ui/P2PStatus';
import Link from 'next/link';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function PeersPage() {
  const { peers, loading, refetch } = usePeers();
  const { connect } = useP2P();

  const onlinePeers = peers.filter(p => p.isOnline);
  const offlinePeers = peers.filter(p => !p.isOnline);

  const handlePeerConnect = async (peer: any) => {
    if (peer.isOnline) {
      await connect(peer.peerId);
    }
  };

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm flex items-center justify-between">
        <Link href="/">
          <Title level={3} className="mb-0! text-blue-600! cursor-pointer">
            MeshShare
          </Title>
        </Link>
        <Space>
          <Link href="/files">
            <Button>Files</Button>
          </Link>
          <Button 
            icon={<ReloadOutlined />}
            onClick={refetch}
            loading={loading}
          >
            Refresh
          </Button>
        </Space>
      </Header>

      <Content className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Title level={2}>Network Peers</Title>
          </div>

          <Row gutter={16} className="mb-6">
            <Col xs={24} sm={8}>
              <Card>
                <Statistic 
                  title="Total Peers" 
                  value={peers.length}
                  prefix={<ApiOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic 
                  title="Online" 
                  value={onlinePeers.length}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic 
                  title="Offline" 
                  value={offlinePeers.length}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>

          <div className="mb-6">
            <P2PStatus />
          </div>

          <PeerList 
            peers={peers} 
            loading={loading}
            onPeerClick={handlePeerConnect}
          />
        </div>
      </Content>
    </Layout>
  );
}
