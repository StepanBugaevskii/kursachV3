import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutingService } from './routing.service';
import { RoutingTableEntity } from './entities/routing-table.entity';
import { ConnectionMetricsEntity } from './entities/connection-metrics.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoutingTableEntity, ConnectionMetricsEntity])],
  providers: [RoutingService],
  exports: [RoutingService, TypeOrmModule]
})
export class RoutingModule {}
