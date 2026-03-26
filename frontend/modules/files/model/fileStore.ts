import { create } from 'zustand';
import { File } from '../http/files.api';

interface FileStore {
  selectedFile: File | null;
  uploadProgress: number;
  downloadProgress: number;
  
  setSelectedFile: (file: File | null) => void;
  setUploadProgress: (progress: number) => void;
  setDownloadProgress: (progress: number) => void;
}

export const useFileStore = create<FileStore>((set) => ({
  selectedFile: null,
  uploadProgress: 0,
  downloadProgress: 0,
  
  setSelectedFile: (file) => set({ selectedFile: file }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  setDownloadProgress: (progress) => set({ downloadProgress: progress }),
}));
