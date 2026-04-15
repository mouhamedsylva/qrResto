import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(
    req: Request & { tenantId?: string },
    _res: Response,
    next: NextFunction,
  ) {
    req.tenantId =
      (req.headers['x-restaurant-id'] as string) ||
      (req.query.restaurantId as string) ||
      undefined;
    next();
  }
}
