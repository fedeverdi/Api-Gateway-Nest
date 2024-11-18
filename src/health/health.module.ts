import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RedisClientModule } from 'src/clients.module';

@Module({
  imports: [TerminusModule, RedisClientModule],
  controllers: [HealthController],
})
export class HealthModule {}
