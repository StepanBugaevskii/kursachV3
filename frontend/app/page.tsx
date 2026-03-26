'use client';

import { useEffect, useState } from 'react';
import { Layout, Menu, Button, Card, Typography, Space } from 'antd';
import { 
  CloudUploadOutlined, 
  CloudDownloadOutlined, 
  TeamOutlined,
  FileOutlined,
  LogoutOutlined,
  UserOutlined
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
      <Header className="flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center">
          <Title level={3} className="mb-0! text-blue-600!">
            MeshShare
          </Title>
        </div>
        <div className="flex items-center gap-4">
          <Menu mode="horizontal" className="border-0">
            <Menu.Item key="files">
              <Link href="/files">Files</Link>
            </Menu.Item>
            <Menu.Item key="peers">
              <Link href="/peers">Peers</Link>
            </Menu.Item>
          </Menu>
          {currentUser && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <UserOutlined />
                <span className="text-sm">{currentUser.displayName}</span>
              </div>
              <Button 
                icon={<LogoutOutlined />} 
                onClick={handleLogout}
                type="text"
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </Header>

      <Content className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Title level={1}>Decentralized File Sharing</Title>
            <Paragraph className="text-lg text-gray-600">
              Share files directly with peers using mesh network technology
            </Paragraph>
            <Space size="large" className="mt-6">
              <Link href="/upload">
                <Button type="primary" size="large" icon={<CloudUploadOutlined />}>
                  Upload File
                </Button>
              </Link>
              <Link href="/files">
                <Button size="large" icon={<FileOutlined />}>
                  Browse Files
                </Button>
              </Link>
            </Space>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card hoverable>
              <div className="text-center">
                <CloudUploadOutlined className="text-5xl text-blue-500 mb-4" />
                <Title level={4}>Fast Upload</Title>
                <Paragraph className="text-gray-600">
                  Upload files and share them instantly with the network
                </Paragraph>
              </div>
            </Card>

            <Card hoverable>
              <div className="text-center">
                <TeamOutlined className="text-5xl text-green-500 mb-4" />
                <Title level={4}>P2P Network</Title>
                <Paragraph className="text-gray-600">
                  Connect directly with peers without central servers
                </Paragraph>
              </div>
            </Card>

            <Card hoverable>
              <div className="text-center">
                <CloudDownloadOutlined className="text-5xl text-purple-500 mb-4" />
                <Title level={4}>Fast Download</Title>
                <Paragraph className="text-gray-600">
                  Download from multiple peers simultaneously
                </Paragraph>
              </div>
            </Card>
          </div>
        </div>
      </Content>

      <Footer className="text-center bg-gray-100">
        MeshShare ©2024 - Decentralized File Sharing Network
      </Footer>
    </Layout>
  );
}
