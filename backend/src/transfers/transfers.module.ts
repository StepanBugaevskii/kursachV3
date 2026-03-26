import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransfersService } from './transfers.service';
import { TransfersController } from './transfers.controller';
import { TransferEntity } from './entities/transfer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransferEntity])],
  providers: [TransfersService],
  controllers: [TransfersController],
  exports: [TransfersService, TypeOrmModule]
})
export class TransfersModule {}
