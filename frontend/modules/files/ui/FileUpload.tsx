'use client';

import { Upload, Button, message, Progress } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { UploadProps } from 'antd';
import { FileUploader, UploadProgress } from '@/lib/fileUpload';
import { useUserStore } from '@/modules/users/model/userStore';

interface FileUploadProps {
  onUploadComplete?: (fileId: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const { currentUser } = useUserStore();

  const handleUpload = async (file: File) => {
    if (!currentUser) {
      message.error('Please login first');
      return;
    }

    setUploading(true);
    setProgress({
      loaded: 0,
      total: file.size,
      percentage: 0,
      currentChunk: 0,
      totalChunks: Math.ceil(file.size / (1024 * 1024)),
    });

    try {
      const uploader = new FileUploader(file, (prog) => {
        setProgress(prog);
      });

      const fileId = await uploader.upload(currentUser.id);
      
      message.success(`${file.name} uploaded successfully`);
      onUploadComplete?.(fileId);
    } catch (error) {
      message.error(`${file.name} upload failed`);
      console.error(error);
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  const props: UploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload: (file) => {
      handleUpload(file);
      return false; // Prevent default upload
    },
    showUploadList: false,
  };

  return (
    <div className="space-y-4">
      <Upload {...props}>
        <Button 
          icon={<UploadOutlined />} 
          size="large" 
          type="primary"
          loading={uploading}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Click to Upload'}
        </Button>
      </Upload>

      {progress && (
        <div className="space-y-2">
          <Progress percent={progress.percentage} status="active" />
          <div className="text-sm text-gray-600">
            Chunk {progress.currentChunk} of {progress.totalChunks}
          </div>
        </div>
      )}
    </div>
  );
};
