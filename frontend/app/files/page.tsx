'use client';

import { Layout, Typography, Button, Space, Modal, message, Progress } from 'antd';
import { PlusOutlined, ReloadOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
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
      <Header className="bg-white shadow-sm flex items-center justify-between">
        <Link href="/">
          <Title level={3} className="mb-0! text-blue-600! cursor-pointer">
            MeshShare
          </Title>
        </Link>
        <Space>
          <Link href="/peers">
            <Button>Peers</Button>
          </Link>
          <Button 
            icon={<ReloadOutlined />}
            onClick={refetch}
            loading={loading}
          >
            Refresh
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setUploadModalOpen(true)}
          >
            Upload File
          </Button>
          {currentUser && (
            <>
              <span className="text-sm">
                <UserOutlined /> {currentUser.displayName}
              </span>
              <Button 
                icon={<LogoutOutlined />} 
                onClick={handleLogout}
                type="text"
              />
            </>
          )}
        </Space>
      </Header>

      <Content className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Title level={2}>My Files</Title>
          </div>

          <div className="mb-6">
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

      <Modal
        title="Upload File"
        open={uploadModalOpen}
        onCancel={() => setUploadModalOpen(false)}
        footer={null}
      >
        <FileUpload onUploadComplete={handleUploadComplete} />
      </Modal>

      <Modal
        title="Downloading File"
        open={downloading}
        footer={null}
        closable={false}
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
