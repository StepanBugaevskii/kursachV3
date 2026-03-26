'use client';

import { Layout, Typography, Button, Space, Empty, message, Modal, Progress } from 'antd';
import { ReloadOutlined, LogoutOutlined, UserOutlined, FileOutlined, TeamOutlined, CloudUploadOutlined, LinkOutlined } from '@ant-design/icons';
import { useConnectedPeers } from '@/modules/peers/hooks/useConnectedPeers';
import { ConnectedPeerCard } from '@/modules/peers/ui/ConnectedPeerCard';
import { useUserStore } from '@/modules/users/model/userStore';
import { FileDownloader, UploadProgress } from '@/lib/fileUpload';
import { webrtcClient } from '@/lib/p2p/webrtcClient';
import { useState } from 'react';
import Link from 'next/link';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function ConnectedPage() {
  const { connectedPeers, loading, refetch } = useConnectedPeers();
  const { currentUser, logout } = useUserStore();
  const [downloadProgress, setDownloadProgress] = useState<UploadProgress | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('userId');
    window.location.href = '/';
  };

  const handleDownload = async (file: any) => {
    setDownloading(true);
    setDownloadProgress({
      loaded: 0,
      total: file.size,
      percentage: 0,
      currentChunk: 0,
      totalChunks: Math.ceil(file.size / (1024 * 1024)),
    });

    try {
      const downloader = new FileDownloader(file.id, (prog) => {
        setDownloadProgress(prog);
      });

      const blob = await downloader.download();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      message.success('File downloaded successfully');
    } catch (error) {
      message.error('Failed to download file');
      console.error(error);
    } finally {
      setDownloading(false);
      setDownloadProgress(null);
    }
  };

  const handleDisconnect = (peerId: string) => {
    Modal.confirm({
      title: 'Disconnect from peer?',
      content: 'You will no longer be able to download files from this peer.',
      okText: 'Disconnect',
      okType: 'danger',
      onOk: () => {
        // WebRTC connections close automatically
        message.success('Disconnected from peer');
        refetch();
      },
    });
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
            <Button 
              icon={<ReloadOutlined />}
              onClick={refetch}
              loading={loading}
              size="small"
              className="md:size-middle"
            />
            {currentUser && (
              <Button 
                icon={<LogoutOutlined />} 
                onClick={handleLogout}
                type="text"
                size="small"
                className="hidden md:inline-flex"
              />
            )}
          </Space>
        </div>
      </Header>

      <Content className="p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 md:mb-6 flex items-center justify-between">
            <div>
              <Title level={2} className="text-xl md:text-3xl mb-1!">
                Connected Peers
              </Title>
              <Typography.Text type="secondary" className="text-sm">
                {connectedPeers.length} {connectedPeers.length === 1 ? 'peer' : 'peers'} connected
              </Typography.Text>
            </div>
            <Link href="/peers">
              <Button icon={<LinkOutlined />} size="small" className="md:size-middle">
                Find Peers
              </Button>
            </Link>
          </div>

          {connectedPeers.length === 0 ? (
            <Empty 
              description={
                <div className="text-center">
                  <p className="mb-4">No peers connected</p>
                  <Link href="/peers">
                    <Button type="primary" icon={<TeamOutlined />}>
                      Connect to Peers
                    </Button>
                  </Link>
                </div>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedPeers.map((peer) => (
                <ConnectedPeerCard
                  key={peer.peerId}
                  peer={peer}
                  onDownload={handleDownload}
                  onDisconnect={handleDisconnect}
                />
              ))}
            </div>
          )}
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
          <Link href="/connected" className="flex flex-col items-center gap-1 text-blue-600">
            <LinkOutlined className="text-xl" />
            <span className="text-xs">Connected</span>
          </Link>
          <Link href="/peers" className="flex flex-col items-center gap-1">
            <TeamOutlined className="text-xl" />
            <span className="text-xs">Peers</span>
          </Link>
        </div>
      </div>

      <Modal
        title="Downloading File"
        open={downloading}
        footer={null}
        closable={false}
        width="90%"
        className="md:max-w-md"
      >
        {downloadProgress && (
          <div className="space-y-4">
            <Progress percent={downloadProgress.percentage} status="active" />
            <div className="text-sm text-gray-600">
              Downloading chunk {downloadProgress.currentChunk} of {downloadProgress.totalChunks}
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
