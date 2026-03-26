'use client';

import { useEffect, useState } from 'react';
import { Layout, Menu, Button, Card, Typography, Space } from 'antd';
import { 
  CloudUploadOutlined, 
  CloudDownloadOutlined, 
  TeamOutlined,
  FileOutlined,
  LogoutOutlined,
  UserOutlined,
  LinkOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useUserStore } from '@/modules/users/model/userStore';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { currentUser, logout } = useUserStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('userId');
    window.location.reload();
  };

  if (!mounted) return null;

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm px-4 md:px-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Title level={3} className="mb-0! text-blue-600! text-lg md:text-2xl">
            MeshShare
          </Title>
          <div className="flex items-center gap-2 md:gap-4">
            <Menu mode="horizontal" className="border-0 hidden md:flex">
              <Menu.Item key="files">
                <Link href="/files">Files</Link>
              </Menu.Item>
              <Menu.Item key="connected">
                <Link href="/connected">Connected</Link>
              </Menu.Item>
              <Menu.Item key="peers">
                <Link href="/peers">Peers</Link>
              </Menu.Item>
            </Menu>
            {currentUser && (
              <div className="flex items-center gap-2 md:gap-3">
                <div className="hidden md:flex items-center gap-2">
                  <UserOutlined />
                  <span className="text-sm">{currentUser.displayName}</span>
                </div>
                <Button 
                  icon={<LogoutOutlined />} 
                  onClick={handleLogout}
                  type="text"
                  size="small"
                  className="md:size-middle"
                />
              </div>
            )}
          </div>
        </div>
      </Header>

      <Content className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <Title level={1} className="text-2xl md:text-4xl">Decentralized File Sharing</Title>
            <Paragraph className="text-base md:text-lg text-gray-600">
              Share files directly with peers using mesh network technology
            </Paragraph>
            <Space size="middle" className="mt-4 md:mt-6 flex-wrap justify-center">
              <Link href="/files">
                <Button size="large" icon={<FileOutlined />} block className="w-full md:w-auto">
                  Browse Files
                </Button>
              </Link>
              <Link href="/peers">
                <Button size="large" icon={<TeamOutlined />} block className="w-full md:w-auto">
                  View Peers
                </Button>
              </Link>
            </Space>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12">
            <Card hoverable className="text-center">
              <CloudUploadOutlined className="text-4xl md:text-5xl text-blue-500 mb-3 md:mb-4" />
              <Title level={4} className="text-base md:text-lg">Fast Upload</Title>
              <Paragraph className="text-gray-600 text-sm md:text-base">
                Upload files and share them instantly with the network
              </Paragraph>
            </Card>

            <Card hoverable className="text-center">
              <TeamOutlined className="text-4xl md:text-5xl text-green-500 mb-3 md:mb-4" />
              <Title level={4} className="text-base md:text-lg">P2P Network</Title>
              <Paragraph className="text-gray-600 text-sm md:text-base">
                Connect directly with peers without central servers
              </Paragraph>
            </Card>

            <Card hoverable className="text-center">
              <CloudDownloadOutlined className="text-4xl md:text-5xl text-purple-500 mb-3 md:mb-4" />
              <Title level={4} className="text-base md:text-lg">Fast Download</Title>
              <Paragraph className="text-gray-600 text-sm md:text-base">
                Download from multiple peers simultaneously
              </Paragraph>
            </Card>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
            <div className="flex justify-around p-3">
              <Link href="/" className="flex flex-col items-center gap-1 text-blue-600">
                <CloudUploadOutlined className="text-xl" />
                <span className="text-xs">Home</span>
              </Link>
              <Link href="/files" className="flex flex-col items-center gap-1">
                <FileOutlined className="text-xl" />
                <span className="text-xs">Files</span>
              </Link>
              <Link href="/connected" className="flex flex-col items-center gap-1">
                <LinkOutlined className="text-xl" />
                <span className="text-xs">Connected</span>
              </Link>
              <Link href="/peers" className="flex flex-col items-center gap-1">
                <TeamOutlined className="text-xl" />
                <span className="text-xs">Peers</span>
              </Link>
            </div>
          </div>
        </div>
      </Content>

      <Footer className="text-center bg-gray-100 text-sm md:text-base pb-16 md:pb-4">
        MeshShare ©2024 - Decentralized File Sharing Network
      </Footer>
    </Layout>
  );
}
