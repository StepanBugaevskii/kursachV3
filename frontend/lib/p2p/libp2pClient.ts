import { createNode } from '@shared/infrastructure/p2p/libp2pNode';
import { Libp2pTransport } from '@shared/infrastructure/p2p/Libp2pTransport';
import { ConnectionManager } from '@shared/infrastructure/p2p/ConnectionManager';
import { FileTransferService } from '@shared/application/services/FileTransferService';
import { LocalStorageRepo } from '@shared/infrastructure/storage/LocalStorageRepo';
import type { Libp2p } from 'libp2p';

class P2PClient {
  private node: Libp2p | null = null;
  private transport: Libp2pTransport | null = null;
  private connectionManager: ConnectionManager | null = null;
  private fileTransferService: FileTransferService | null = null;
  private storage: LocalStorageRepo | null = null;

  async initialize(bootstrapPeers: string[] = []): Promise<void> {
    try {
      // Create libp2p node
      this.node = await createNode(bootstrapPeers);
      
      // Initialize transport
      this.transport = new Libp2pTransport(this.node);
      
      // Initialize connection manager
      this.connectionManager = new ConnectionManager(this.node);
      
      // Initialize storage
      this.storage = new LocalStorageRepo();
      
      // Initialize file transfer service
      this.fileTransferService = new FileTransferService(
        this.transport,
        this.storage
      );
      
      // Start listening for messages
      this.fileTransferService.init();
      
      console.log('✅ P2P Client initialized');
      console.log('Peer ID:', this.node.peerId.toString());
    } catch (error) {
      console.error('Failed to initialize P2P client:', error);
      throw error;
    }
  }

  async connect(multiaddrStr: string): Promise<void> {
    if (!this.connectionManager) {
      throw new Error('P2P client not initialized');
    }
    await this.connectionManager.connect(multiaddrStr);
  }

  disconnect(peerId: string): void {
    if (!this.connectionManager) {
      throw new Error('P2P client not initialized');
    }
    this.connectionManager.disconnect(peerId);
  }

  getConnectedPeers(): string[] {
    if (!this.connectionManager) {
      return [];
    }
    return this.connectionManager.getConnectedPeers();
  }

  async requestChunk(peerId: string, fileId: string, chunkIndex: number): Promise<void> {
    if (!this.fileTransferService) {
      throw new Error('P2P client not initialized');
    }
    await this.fileTransferService.requestChunk(peerId, fileId, chunkIndex);
  }

  async sendChunk(
    peerId: string,
    fileId: string,
    chunkIndex: number,
    data: Uint8Array
  ): Promise<void> {
    if (!this.fileTransferService) {
      throw new Error('P2P client not initialized');
    }
    await this.fileTransferService.sendChunk(peerId, fileId, chunkIndex, data);
  }

  getPeerId(): string | null {
    return this.node?.peerId.toString() || null;
  }

  getMultiaddrs(): string[] {
    if (!this.node) return [];
    return this.node.getMultiaddrs().map(ma => ma.toString());
  }

  async shutdown(): Promise<void> {
    if (this.node) {
      await this.node.stop();
      this.node = null;
      this.transport = null;
      this.connectionManager = null;
      this.fileTransferService = null;
      this.storage = null;
    }
  }
}

export const p2pClient = new P2PClient();
export default p2pClient;
