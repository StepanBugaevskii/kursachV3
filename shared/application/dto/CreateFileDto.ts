export interface CreateFileDto {
  ownerId: string;
  fileName: string;
  size: number;
  hash: string;
}