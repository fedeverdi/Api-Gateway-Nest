import { Controller, Get, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { firstValueFrom, timeout } from 'rxjs';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    @Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy,
    @Inject('BLOG_SERVICE') private readonly blogServiceClient: ClientProxy,
    @Inject('EMAIL_SERVICE') private readonly emailServiceClient: ClientProxy,
    private readonly _configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    const timeout_config = this._configService.get('TIMEOUT_SERVICE', 500);
    const results = await Promise.allSettled([
      firstValueFrom(this.authServiceClient.send('authService.ping', {}).pipe(timeout(parseInt(timeout_config)))),
      firstValueFrom(this.blogServiceClient.send('blogService.ping', {}).pipe(timeout(parseInt(timeout_config)))),
      firstValueFrom(this.emailServiceClient.send('emailService.ping', {}).pipe(timeout(parseInt(timeout_config)))),
    ]);

    return {
      status: results.every((result) => result.status === 'fulfilled') ? 'ok' : 'error',
      details: {
        authService:
          results[0].status === 'fulfilled' ? { status: 'up' } : { status: 'down' },
        blogService:
          results[1].status === 'fulfilled' ? { status: 'up' } : { status: 'down' },
        emailService:
          results[2].status === 'fulfilled' ? { status: 'up' } : { status: 'down' },
      },
    };
  }
}
