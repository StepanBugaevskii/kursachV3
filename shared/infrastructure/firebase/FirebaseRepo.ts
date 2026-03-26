export class FirebaseRepo {
  constructor(private firestore: any) {}

  async saveFile(file: any): Promise<void> {
    await this.firestore.collection("files").doc(file.id).set(file);
  }

  async getFile(id: string): Promise<any | null> {
    const doc = await this.firestore.collection("files").doc(id).get();
    return doc.exists ? doc.data() : null;
  }

  async getAllFiles(): Promise<any[]> {
    const snapshot = await this.firestore.collection("files").get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  async savePeer(peer: any): Promise<void> {
    await this.firestore.collection("peers").doc(peer.id).set(peer);
  }

  async getPeer(id: string): Promise<any | null> {
    const doc = await this.firestore.collection("peers").doc(id).get();
    return doc.exists ? doc.data() : null;
  }

  async getAllPeers(): Promise<any[]> {
    const snapshot = await this.firestore.collection("peers").get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }
}