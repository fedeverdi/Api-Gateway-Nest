import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private readonly _configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers['authorization'];

    if (!authorization) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authorization.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token missing');
    }

    try {
      // Invoca il microservizio Auth per verificare il token
      const user = await firstValueFrom(
        this.authClient.send({ service: this._configService.get('AUTH_SERVICE_NAME'), cmd: 'verify-token' }, { token: token }),
      );

      // Aggiungi i dati dell'utente alla richiesta per l'uso successivo
      request.user = user;

      return true;
    } catch (error) {
      console.error('Errore nella verifica del token:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
