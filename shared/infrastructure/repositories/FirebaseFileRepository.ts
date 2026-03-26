import { FileRepository } from "../../domain/repositories/FileRepository";
import { File } from "../../domain/aggregates/File";

export class FirebaseFileRepository implements FileRepository {
  constructor(private firestore: any) {}

  async save(file: File): Promise<void> {
    const data = {
      id: file.id,
      ownerId: file.ownerId,
      fileName: file.fileName,
      size: file.size,
      hash: file.hash,
      createdAt: file.createdAt,
    };
    await this.firestore.collection("files").doc(file.id).set(data);
  }

  async findById(id: string): Promise<File | null> {
    const doc = await this.firestore.collection("files").doc(id).get();
    if (!doc.exists) return null;

    const data = doc.data();
    return new File(
      data.id,
      data.ownerId,
      data.fileName,
      data.size,
      data.hash,
      data.createdAt
    );
  }

  async findAll(): Promise<File[]> {
    const snapshot = await this.firestore.collection("files").get();
    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return new File(
        data.id,
        data.ownerId,
        data.fileName,
        data.size,
        data.hash,
        data.createdAt
      );
    });
  }
}
