export class DownloadFileUseCase {
  constructor(private fileTransfer: any) {}

  async execute(fileId: string, peers: string[], totalChunks: number) {
    for (let i = 0; i < totalChunks; i++) {
      const peer = peers[i % peers.length]; 
      await this.fileTransfer.requestChunk(peer, fileId, i);
    }
  }
}