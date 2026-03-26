import { FileRepository } from "../../domain/repositories/FileRepository";
import { File } from "../../domain/aggregates/File";

export class InMemoryFileRepository implements FileRepository {
  private files = new Map<string, File>();

  async save(file: File): Promise<void> {
    this.files.set(file.id, file);
  }

  async findById(id: string): Promise<File | null> {
    return this.files.get(id) || null;
  }

  async findAll(): Promise<File[]> {
    return Array.from(this.files.values());
  }

  clear(): void {
    this.files.clear();
  }
}
