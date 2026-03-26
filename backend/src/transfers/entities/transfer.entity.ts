import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FileEntity } from '../../files/entities/file.entity';
import { PeerEntity } from '../../peers/entities/peer.entity';

@Entity('transfers')
export class TransferEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileId: string;

  @Column()
  fromPeerId: string;

  @Column()
  toPeerId: string;

  @Column()
  transferType: string;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  failedAt: Date;

  @ManyToOne(() => FileEntity)
  @JoinColumn({ name: 'fileId' })
  file: FileEntity;

  @ManyToOne(() => PeerEntity)
  @JoinColumn({ name: 'fromPeerId' })
  fromPeer: PeerEntity;

  @ManyToOne(() => PeerEntity)
  @JoinColumn({ name: 'toPeerId' })
  toPeer: PeerEntity;
}
