import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '../enums/role.enum';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (req.user?.role === Role.SUPER_ADMIN) return true;
    if (!req.tenantId)
      throw new ForbiddenException('Restaurant context missing');
    if (req.user?.restaurantId !== req.tenantId)
      throw new ForbiddenException('Access denied');
    return true;
  }
}
