import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ChunkEntity } from './chunk.entity';
import { PeerEntity } from '../../peers/entities/peer.entity';

@Entity('chunk_replicas')
export class ChunkReplicaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  chunkId: string;

  @Column()
  peerId: string;

  @Column({ default: 1 })
  replicaPriority: number;

  @Column({ default: 'healthy' })
  healthStatus: string;

  @CreateDateColumn()
  lastVerifiedAt: Date;

  @ManyToOne(() => ChunkEntity, chunk => chunk.replicas)
  @JoinColumn({ name: 'chunkId' })
  chunk: ChunkEntity;

  @ManyToOne(() => PeerEntity, peer => peer.chunkReplicas)
  @JoinColumn({ name: 'peerId' })
  peer: PeerEntity;
}
