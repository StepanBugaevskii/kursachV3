import { File } from "../aggregates/File";

export interface FileRepository {
  save(file: File): Promise<void>;
  findById(id: string): Promise<File | null>;
  findAll(): Promise<File[]>;
}