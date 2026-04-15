import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantSettings } from '../../restaurants/entities/restaurant-settings.entity';
import { UserRole } from '../../users/entities/user.entity';
import { PERMISSIONS_KEY, PermissionType } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(RestaurantSettings)
    private settingsRepository: Repository<RestaurantSettings>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<PermissionType>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // 1. Les Admins et Owners ont TOUS les droits par défaut (bypass toggles)
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.OWNER) {
      return true;
    }

    // 2. Récupérer les réglages du restaurant
    const restaurantId = user.restaurantId || user.restaurant?.id;
    if (!restaurantId) {
        return false;
    }

    const settings = await this.settingsRepository.findOne({
      where: { restaurant: { id: restaurantId } },
    });

    if (!settings) {
      return true;
    }

    // 3. Construire la clé de permission dynamiquement : staffCan + PermissionType ou managerCan + PermissionType
    const roleKey = user.role.toLowerCase(); // 'staff' or 'manager'
    const permissionKey = `${roleKey}Can${requiredPermission}`;

    const isAllowed = settings[permissionKey];

    // Si la clé n'existe pas (ex: staffCanSeeStats n'existe pas en DB), on refuse par sécurité si c'est un staff
    if (isAllowed === undefined) {
        // Optionnel : On pourrait autoriser par défaut ou refuser. 
        // Ici, si la colonne n'existe pas pour ce rôle, on considère que le rôle n'a pas accès à cette fonction.
        return false;
    }

    if (isAllowed === false) {
      throw new ForbiddenException(
        `Cette fonctionnalité a été désactivée pour votre rôle (${user.role}) par le propriétaire.`
      );
    }

    return true;
  }
}
