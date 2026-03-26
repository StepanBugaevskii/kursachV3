import { useState, useEffect } from 'react';
import { filesApi, File } from '../http/files.api';
import { message } from 'antd';

export const useFiles = (ownerId?: string) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const data = await filesApi.getAll(ownerId);
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
  }, [ownerId]);

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
