import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ChunkEntity } from '../../chunks/entities/chunk.entity';

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ownerId: string;

  @Column()
  fileName: string;

  @Column()
  originalName: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column()
  mimeType: string;

  @Column()
  hash: string;

  @Column({ nullable: true })
  encryptionKey: string;

  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, user => user.files)
  @JoinColumn({ name: 'ownerId' })
  owner: UserEntity;

  @OneToMany(() => ChunkEntity, chunk => chunk.file)
  chunks: ChunkEntity[];
}
