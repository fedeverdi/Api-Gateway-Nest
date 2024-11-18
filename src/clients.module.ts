import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'BLOG_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.REDIS,
          retryAttempts: configService.get<number>('RETRY_SERVICE', 3),
          retryDelay: configService.get<number>('RETRY_DELAY_SERVICE', 1000),
          options: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
          },
        }),
      },
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.REDIS,
          retryAttempts: configService.get<number>('RETRY_SERVICE', 3),
          retryDelay: configService.get<number>('RETRY_DELAY_SERVICE', 1000),
          options: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
          },
        }),
      },
      {
        name: 'EMAIL_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.REDIS,
          retryAttempts: configService.get<number>('RETRY_SERVICE', 3),
          retryDelay: configService.get<number>('RETRY_DELAY_SERVICE', 1000),
          options: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RedisClientModule {}
