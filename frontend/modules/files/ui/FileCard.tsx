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
          size="small"
          className="text-xs md:text-sm"
        >
          <span className="hidden sm:inline">Download</span>
        </Button>,
        <Button 
          key="delete" 
          type="text" 
          danger 
          icon={<DeleteOutlined />}
          onClick={() => onDelete?.(file)}
          size="small"
          className="text-xs md:text-sm"
        >
          <span className="hidden sm:inline">Delete</span>
        </Button>,
      ]}
    >
      <div className="flex items-start gap-3 md:gap-4">
        <FileOutlined className="text-3xl md:text-4xl text-blue-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <Title level={5} className="mb-1! text-sm md:text-base" ellipsis={{ rows: 2 }}>
            {file.fileName}
          </Title>
          <Text type="secondary" className="text-xs md:text-sm">
            {formatSize(file.size)}
          </Text>
          <div className="mt-2 flex flex-wrap gap-1">
            <Tag color={file.status === 'active' ? 'green' : 'orange'} className="text-xs">
              {file.status}
            </Tag>
            <Tag className="text-xs">{file.mimeType.split('/')[1] || file.mimeType}</Tag>
          </div>
          <Text type="secondary" className="text-xs block mt-2">
            {new Date(file.createdAt).toLocaleDateString()}
          </Text>
        </div>
      </div>
    </Card>
  );
};
