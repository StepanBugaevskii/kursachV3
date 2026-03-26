'use client';

import { Layout, Typography, Button, Space, Statistic, Row, Col, Card } from 'antd';
import { ReloadOutlined, ApiOutlined, FileOutlined, TeamOutlined, CloudUploadOutlined, LinkOutlined } from '@ant-design/icons';
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
      <Header className="bg-white shadow-sm px-4 md:px-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/">
            <Title level={3} className="mb-0! text-blue-600! cursor-pointer text-lg md:text-2xl">
              MeshShare
            </Title>
          </Link>
          <Space size="small">
            <Link href="/files" className="hidden md:inline">
              <Button>Files</Button>
            </Link>
            <Link href="/connected" className="hidden md:inline">
              <Button>Connected</Button>
            </Link>
            <Button 
              icon={<ReloadOutlined />}
              onClick={refetch}
              loading={loading}
              size="small"
              className="md:size-middle"
            >
              <span className="hidden md:inline">Refresh</span>
            </Button>
          </Space>
        </div>
      </Header>

      <Content className="p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 md:mb-6">
            <Title level={2} className="text-xl md:text-3xl">Network Peers</Title>
          </div>

          <Row gutter={[16, 16]} className="mb-4 md:mb-6">
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

          <div className="mb-4 md:mb-6">
            <P2PStatus />
          </div>

          <PeerList 
            peers={peers} 
            loading={loading}
            onPeerClick={handlePeerConnect}
          />
        </div>
      </Content>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex justify-around p-3">
          <Link href="/" className="flex flex-col items-center gap-1">
            <CloudUploadOutlined className="text-xl" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/files" className="flex flex-col items-center gap-1">
            <FileOutlined className="text-xl" />
            <span className="text-xs">My Files</span>
          </Link>
          <Link href="/connected" className="flex flex-col items-center gap-1">
            <LinkOutlined className="text-xl" />
            <span className="text-xs">Connected</span>
          </Link>
          <Link href="/peers" className="flex flex-col items-center gap-1 text-blue-600">
            <TeamOutlined className="text-xl" />
            <span className="text-xs">Peers</span>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
