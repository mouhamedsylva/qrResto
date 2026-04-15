import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions, PermissionType } from '../auth/decorators/permissions.decorator';
import { InviteStaffDto } from './dto/invite-staff.dto';
import { UpdateStaffRoleDto } from './dto/update-staff-role.dto';

@ApiTags('Personnel')
@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post('invite')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @Permissions(PermissionType.MANAGE_STAFF)
  @ApiOperation({ summary: 'Inviter un nouveau membre du personnel' })
  @ApiBody({ type: InviteStaffDto })
  @ApiResponse({ status: 201, description: 'Invitation envoyée.' })
  async invite(@Request() req: any, @Body() inviteStaffDto: InviteStaffDto) {
    return this.staffService.invite(req.user.restaurantId, inviteStaffDto);
  }

  @Get('restaurant/:restaurantId')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @Permissions(PermissionType.MANAGE_STAFF)
  @ApiOperation({ summary: "Lister le personnel d'un restaurant" })
  @ApiResponse({
    status: 200,
    description: 'Liste récupérée.',
    schema: {
      example: [
        {
          id: 'uuid-1',
          name: 'Alain Proviste',
          email: 'alain@example.com',
          role: 'STAFF',
        },
      ],
    },
  })
  async findAll(@Param('restaurantId') restaurantId: string) {
    return this.staffService.findAllByRestaurant(restaurantId);
  }

  @Put(':id/role')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @Permissions(PermissionType.MANAGE_STAFF)
  @ApiOperation({ summary: "Modifier le rôle d'un membre du personnel" })
  @ApiBody({ type: UpdateStaffRoleDto })
  @ApiResponse({ status: 200, description: 'Rôle mis à jour.' })
  async updateRole(
    @Param('id') id: string,
    @Body() updateStaffRoleDto: UpdateStaffRoleDto,
  ) {
    return this.staffService.updateRole(id, updateStaffRoleDto.role);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @Permissions(PermissionType.MANAGE_STAFF)
  @ApiOperation({ summary: 'Supprimer un membre du personnel' })
  @ApiResponse({ status: 200, description: 'Membre supprimé.' })
  async remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}
