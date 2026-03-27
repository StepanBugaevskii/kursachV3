'use client';

import { Layout, Typography, Button, Space, Modal, message, Progress } from 'antd';
import { PlusOutlined, ReloadOutlined, LogoutOutlined, UserOutlined, FileOutlined, TeamOutlined, CloudUploadOutlined, LinkOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { FileList } from '@/modules/files/ui/FileList';
import { FileUpload } from '@/modules/files/ui/FileUpload';
import { useFiles } from '@/modules/files/hooks/useFiles';
import { FileDownloader, UploadProgress } from '@/lib/fileUpload';
import { P2PStatus } from '@/modules/p2p/ui/P2PStatus';
import { useUserStore } from '@/modules/users/model/userStore';
import Link from 'next/link';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function FilesPage() {
  const { files, loading, deleteFile, refetch } = useFiles();
  const { currentUser, logout } = useUserStore();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
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
      
      // Create download link
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

  const handleDelete = (file: any) => {
    Modal.confirm({
      title: 'Delete File',
      content: `Are you sure you want to delete "${file.fileName}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: () => deleteFile(file.id),
    });
  };

  const handleUploadComplete = () => {
    setUploadModalOpen(false);
    refetch();
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
          <Space size="small" className="md:space-x-2">
            <Link href="/peers" className="hidden md:inline">
              <Button>Peers</Button>
            </Link>
            <Button 
              icon={<ReloadOutlined />}
              onClick={refetch}
              loading={loading}
              size="small"
              className="md:size-middle"
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setUploadModalOpen(true)}
              size="small"
              className="md:size-middle"
            >
              <span className="hidden md:inline">Upload</span>
            </Button>
            {currentUser && (
              <Button 
                icon={<LogoutOutlined />} 
                onClick={handleLogout}
                type="text"
                size="small"
                className="md:size-middle hidden md:inline-flex"
              />
            )}
          </Space>
        </div>
      </Header>

      <Content className="p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 md:mb-6">
            <Title level={2} className="text-xl md:text-3xl">Available Files</Title>
            <Typography.Text type="secondary" className="text-sm">
              Files from online peers
            </Typography.Text>
          </div>

          <div className="mb-4 md:mb-6">
            <P2PStatus />
          </div>

          <FileList 
            files={files} 
            loading={loading}
            onDownload={handleDownload}
            onDelete={handleDelete}
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
          <Link href="/files" className="flex flex-col items-center gap-1 text-blue-600">
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

      <Modal
        title="Upload File"
        open={uploadModalOpen}
        onCancel={() => setUploadModalOpen(false)}
        footer={null}
        width="90%"
        className="md:max-w-md"
      >
        <FileUpload onUploadComplete={handleUploadComplete} />
      </Modal>

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
