import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { PeersModule } from './peers/peers.module';
import { ChunksModule } from './chunks/chunks.module';
import { TransfersModule } from './transfers/transfers.module';
import { RoutingModule } from './routing/routing.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'mesh_network',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'development',
    }),
    UsersModule,
    FilesModule,
    PeersModule,
    ChunksModule,
    TransfersModule,
    RoutingModule,
  ],
})
export class AppModule {}
