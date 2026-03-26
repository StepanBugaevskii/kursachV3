import api from '@/lib/api';

export interface File {
  id: string;
  ownerId: string;
  fileName: string;
  originalName: string;
  size: number;
  mimeType: string;
  hash: string;
  encryptionKey?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFileDto {
  ownerId: string;
  fileName: string;
  originalName: string;
  size: number;
  mimeType: string;
  hash: string;
}

export const filesApi = {
  getAll: async (ownerId?: string): Promise<File[]> => {
    const { data } = await api.get('/files', { params: { ownerId } });
    return data;
  },

  getOne: async (id: string): Promise<File> => {
    const { data } = await api.get(`/files/${id}`);
    return data;
  },

  create: async (fileData: CreateFileDto): Promise<File> => {
    const { data } = await api.post('/files', fileData);
    return data;
  },

  update: async (id: string, fileData: Partial<File>): Promise<File> => {
    const { data } = await api.put(`/files/${id}`, fileData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/files/${id}`);
  },
};
