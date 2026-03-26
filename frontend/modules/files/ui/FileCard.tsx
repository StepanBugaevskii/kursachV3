import { Card, Typography, Tag, Button, Space, Progress } from 'antd';
import { FileOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { File } from '../http/files.api';

const { Text, Title } = Typography;

interface FileCardProps {
  file: File;
  onDownload?: (file: File) => void;
  onDelete?: (file: File) => void;
}

export const FileCard: React.FC<FileCardProps> = ({ file, onDownload, onDelete }) => {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <Card 
      hoverable
      className="w-full"
      actions={[
        <Button 
          key="download" 
          type="text" 
          icon={<DownloadOutlined />}
          onClick={() => onDownload?.(file)}
        >
          Download
        </Button>,
        <Button 
          key="delete" 
          type="text" 
          danger 
          icon={<DeleteOutlined />}
          onClick={() => onDelete?.(file)}
        >
          Delete
        </Button>,
      ]}
    >
      <div className="flex items-start gap-4">
        <FileOutlined className="text-4xl text-blue-500" />
        <div className="flex-1">
          <Title level={5} className="!mb-1" ellipsis={{ rows: 1 }}>
            {file.fileName}
          </Title>
          <Text type="secondary" className="text-sm">
            {formatSize(file.size)}
          </Text>
          <div className="mt-2">
            <Tag color={file.status === 'active' ? 'green' : 'orange'}>
              {file.status}
            </Tag>
            <Tag>{file.mimeType}</Tag>
          </div>
          <Text type="secondary" className="text-xs block mt-2">
            {new Date(file.createdAt).toLocaleDateString()}
          </Text>
        </div>
      </div>
    </Card>
  );
};
