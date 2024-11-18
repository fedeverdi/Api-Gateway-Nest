import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';

    // Se è un'eccezione HTTP, usala direttamente
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    // Log dell'errore per debug
    Logger.error(exception);

    if (exception.code === 'user-not-found') {
      status = HttpStatus.NOT_FOUND;
      message = 'Utente non trovato';
    }

    if (exception.code === 'invalid-token') {
      status = HttpStatus.UNAUTHORIZED;
      message = 'Token non valido';
    }

    if (exception.code === 'invalid-credentials') {
      status = HttpStatus.UNAUTHORIZED;
      message = 'Credenziali non valide';
    }

    if (exception.code === 'user-already-exists') {
      status = HttpStatus.CONFLICT;
      message = 'Utente già esistente';
    }

    // Rispondi con l'errore formattato
    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
