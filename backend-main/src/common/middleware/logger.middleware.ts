import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    const ip = req.ip ?? 'unknown';
    console.log(`[IP] ${ip} - ${req.method} ${req.url}`);
    next();
  }
}
