import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ChunkReplicaEntity } from '../../chunks/entities/chunk-replica.entity';

@Entity('peers')
export class PeerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  peerId: string;

  @Column()
  userId: string;

  @Column({ default: 'standard' })
  nodeType: string;

  @Column({ default: false })
  isOnline: boolean;

  @CreateDateColumn()
  lastSeenAt: Date;

  @Column()
  clientType: string;

  @Column({ nullable: true })
  clientVersion: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  port: number;

  @ManyToOne(() => UserEntity, user => user.peers)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @OneToMany(() => ChunkReplicaEntity, replica => replica.peer)
  chunkReplicas: ChunkReplicaEntity[];
}
