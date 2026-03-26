import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PeerEntity } from '../../peers/entities/peer.entity';

@Entity('connection_metrics')
export class ConnectionMetricsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  peerAId: string;

  @Column()
  peerBId: string;

  @Column({ default: 0 })
  avgLatencyMs: number;

  @Column({ default: 0 })
  avgBandwidthMbps: number;

  @Column({ type: 'float', default: 0 })
  packetLossRate: number;

  @UpdateDateColumn()
  lastMeasuredAt: Date;

  @ManyToOne(() => PeerEntity)
  @JoinColumn({ name: 'peerAId' })
  peerA: PeerEntity;

  @ManyToOne(() => PeerEntity)
  @JoinColumn({ name: 'peerBId' })
  peerB: PeerEntity;
}
