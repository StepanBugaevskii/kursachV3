import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { FileEntity } from '../../files/entities/file.entity';
import { ChunkReplicaEntity } from './chunk-replica.entity';

@Entity('chunks')
export class ChunkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileId: string;

  @Column()
  chunkIndex: number;

  @Column()
  chunkHash: string;

  @Column()
  chunkSize: number;

  @Column({ nullable: true })
  compressionType: string;

  @Column({ default: false })
  encryptionStatus: boolean;

  @ManyToOne(() => FileEntity, file => file.chunks)
  @JoinColumn({ name: 'fileId' })
  file: FileEntity;

  @OneToMany(() => ChunkReplicaEntity, replica => replica.chunk)
  replicas: ChunkReplicaEntity[];
}
