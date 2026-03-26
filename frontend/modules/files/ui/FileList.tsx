import { List, Spin, Empty } from 'antd';
import { FileCard } from './FileCard';
import { File } from '../http/files.api';

interface FileListProps {
  files: File[];
  loading?: boolean;
  onDownload?: (file: File) => void;
  onDelete?: (file: File) => void;
}

export const FileList: React.FC<FileListProps> = ({ 
  files, 
  loading, 
  onDownload, 
  onDelete 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (files.length === 0) {
    return <Empty description="No files found" />;
  }

  return (
    <List
      grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 4 }}
      dataSource={files}
      renderItem={(file) => (
        <List.Item>
          <FileCard 
            file={file} 
            onDownload={onDownload}
            onDelete={onDelete}
          />
        </List.Item>
      )}
    />
  );
};
