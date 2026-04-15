import { SetMetadata } from '@nestjs/common';

export enum PermissionType {
  EDIT_MENU = 'EditMenu',
  MANAGE_ORDERS = 'ManageOrders',
  SEE_STATS = 'SeeStats',
  MANAGE_STAFF = 'ManageStaff',
}

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (permission: PermissionType) =>
  SetMetadata(PERMISSIONS_KEY, permission);
