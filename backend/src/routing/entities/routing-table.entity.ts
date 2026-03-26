import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PeerEntity } from '../../peers/entities/peer.entity';

@Entity('routing_table')
export class RoutingTableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sourcePeerId: string;

  @Column()
  destinationPeerId: string;

  @Column()
  nextHopPeerId: string;

  @Column({ default: 1 })
  hopCount: number;

  @Column({ type: 'float', default: 1.0 })
  costMetric: number;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => PeerEntity)
  @JoinColumn({ name: 'sourcePeerId' })
  sourcePeer: PeerEntity;

  @ManyToOne(() => PeerEntity)
  @JoinColumn({ name: 'destinationPeerId' })
  destinationPeer: PeerEntity;

  @ManyToOne(() => PeerEntity)
  @JoinColumn({ name: 'nextHopPeerId' })
  nextHopPeer: PeerEntity;
}
