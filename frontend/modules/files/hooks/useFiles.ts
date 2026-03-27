import { useState, useEffect } from 'react';
import { filesApi, File } from '../http/files.api';
import { message } from 'antd';

export const useFiles = (ownerId?: string, onlineOnly: boolean = true) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      let data = await filesApi.getAll(ownerId);
      
      // Если нужны только файлы от онлайн пиров
      if (onlineOnly) {
        // Получаем список онлайн пиров
        const peersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/peers`);
        const allPeers = await peersResponse.json();
        const onlinePeerUserIds = new Set(
          allPeers
            .filter((p: any) => p.isOnline)
            .map((p: any) => p.userId)
        );
        
        console.log('Online peer user IDs:', Array.from(onlinePeerUserIds));
        
        // Фильтруем файлы - оставляем только от онлайн пиров
        data = data.filter(file => onlinePeerUserIds.has(file.ownerId));
        
        console.log(`Filtered files: ${data.length} from online peers out of total files`);
      }
      
      setFiles(data);
    } catch (error) {
      message.error('Failed to fetch files');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (id: string) => {
    try {
      await filesApi.delete(id);
      message.success('File deleted successfully');
      fetchFiles();
    } catch (error) {
      message.error('Failed to delete file');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [ownerId, onlineOnly]);

  return { files, loading, refetch: fetchFiles, deleteFile };
};

export const useFile = (id: string) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFile = async () => {
    setLoading(true);
    try {
      const data = await filesApi.getOne(id);
      setFile(data);
    } catch (error) {
      message.error('Failed to fetch file');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchFile();
  }, [id]);

  return { file, loading, refetch: fetchFile };
};
