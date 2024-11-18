import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BlogController } from './blog/blog.controller';
import { AuthController } from './auth/auth.controller';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { RpcExceptionFilter } from './filters/rpc-exception.filter';
import { AuthGuard } from './guard/auth.guard';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { BullModule } from '@nestjs/bull';
import { HealthModule } from './health/health.module';
import { RedisClientModule } from './clients.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env'
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'mailQueue',

      adapter: BullAdapter,
      options: {
        description: 'Email queue',
        prefix: 'Coda ',
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          db: configService.get<number>('REDIS_DB_QUEUE'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'mailQueue', // Nome della coda
    }),
    RedisClientModule,
    HealthModule,
  ],
  controllers: [AppController, BlogController, AuthController],
  providers: [
    AppService,
    AuthGuard,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: RpcExceptionFilter,
    },
  ],
})
export class AppModule {}
