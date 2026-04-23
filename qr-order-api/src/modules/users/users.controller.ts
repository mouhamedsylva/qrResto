import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ImportTeamMembersDto } from './dto/import-team-members.dto';
import { ArchiveTeamMembersDto } from './dto/archive-team-members.dto';
import { UpdateTeamMemberRoleDto } from './dto/update-team-member-role.dto';
import { UpdateStaffStatusDto } from './dto/update-staff-status.dto';

@ApiTags('Utilisateurs')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Obtenir le profil de l'utilisateur connecté" })
  @ApiResponse({
    status: 200,
    description: 'Détails du profil.',
    schema: {
      example: {
        id: 'uuid-1',
        name: 'Jean Dupont',
        email: 'jean@example.com',
        role: 'OWNER',
      },
    },
  })
  async getProfile(@Request() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mettre à jour le profil' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Profil mis à jour.' })
  async updateProfile(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Post('team')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Ajouter un membre à l'équipe (Manager/Staff)" })
  @ApiBody({ type: AddTeamMemberDto })
  @ApiResponse({ status: 201, description: 'Membre créé avec succès.' })
  async addTeamMember(@Request() req: any, @Body() dto: AddTeamMemberDto) {
    return this.usersService.createTeamMember(req.user.id, dto);
  }

  @Get('team')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Lister les membres de l'equipe du restaurant" })
  @ApiResponse({ status: 200, description: 'Equipe recuperee.' })
  async listTeam(@Request() req: any) {
    return this.usersService.listTeamMembers(req.user.id);
  }

  @Get('team/:restaurantId')
  @ApiOperation({ summary: "Lister les membres d'equipe par restaurant (fallback)" })
  @ApiResponse({ status: 200, description: 'Equipe recuperee.' })
  async listTeamByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.usersService.listTeamMembersByRestaurant(restaurantId, false);
  }

  @Get('team/:restaurantId/archived')
  @ApiOperation({ summary: "Lister les membres d'equipe archivés par restaurant" })
  @ApiResponse({ status: 200, description: 'Membres archivés récupérés.' })
  async listArchivedTeamByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.usersService.listArchivedTeamMembersByRestaurant(restaurantId);
  }

  @Post('team/:restaurantId')
  @ApiOperation({ summary: "Ajouter un membre a l'equipe par restaurant (fallback)" })
  @ApiBody({ type: AddTeamMemberDto })
  @ApiResponse({ status: 201, description: 'Membre cree avec succes.' })
  async addTeamMemberByRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: AddTeamMemberDto,
  ) {
    return this.usersService.createTeamMemberByRestaurant(restaurantId, dto);
  }

  @Put('team/:restaurantId/:memberId/role')
  @ApiOperation({ summary: "Modifier le role d'un membre par restaurant" })
  @ApiBody({ type: UpdateTeamMemberRoleDto })
  @ApiResponse({ status: 200, description: 'Role membre mis a jour.' })
  async updateTeamMemberRoleByRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateTeamMemberRoleDto,
  ) {
    return this.usersService.updateTeamMemberRoleByRestaurant(
      restaurantId,
      memberId,
      dto.role,
    );
  }

  @Get('team/:restaurantId/:memberId')
  @ApiOperation({ summary: "Voir les details d'un membre d'equipe" })
  @ApiResponse({ status: 200, description: 'Details membre recuperes.' })
  async getTeamMemberDetailsByRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.usersService.getTeamMemberDetailsByRestaurant(
      restaurantId,
      memberId,
    );
  }

  @Post('team/:restaurantId/:memberId/reset-password')
  @ApiOperation({
    summary:
      "Generer un mot de passe temporaire pour un membre d'equipe",
  })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe temporaire genere.',
  })
  async resetTeamMemberPasswordByRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.usersService.resetTeamMemberPasswordByRestaurant(
      restaurantId,
      memberId,
    );
  }

  @Post('team/:restaurantId/import')
  @ApiOperation({ summary: "Importer des membres d'equipe en masse" })
  @ApiBody({ type: ImportTeamMembersDto })
  @ApiResponse({ status: 201, description: 'Import equipe termine.' })
  async importTeamMembersByRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: ImportTeamMembersDto,
  ) {
    return this.usersService.importTeamMembersByRestaurant(
      restaurantId,
      dto.members || [],
    );
  }

  @Post('team/:restaurantId/archive-bulk')
  @ApiOperation({ summary: 'Archiver plusieurs membres de equipe' })
  @ApiBody({ type: ArchiveTeamMembersDto })
  @ApiResponse({ status: 200, description: 'Archivage multiple termine.' })
  async archiveTeamMembersByRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: ArchiveTeamMembersDto,
  ) {
    return this.usersService.archiveTeamMembersByRestaurant(
      restaurantId,
      dto.ids || [],
    );
  }

  @Post('team/:restaurantId/:memberId/unarchive')
  @ApiOperation({ summary: "Désarchiver un membre d'équipe" })
  @ApiResponse({ status: 200, description: 'Membre désarchivé avec succès.' })
  async unarchiveTeamMemberByRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.usersService.unarchiveTeamMemberByRestaurant(
      restaurantId,
      memberId,
    );
  }

  @Post('team/:restaurantId/unarchive-bulk')
  @ApiOperation({ summary: "Désarchiver plusieurs membres d'équipe" })
  @ApiBody({ type: ArchiveTeamMembersDto })
  @ApiResponse({ status: 200, description: 'Désarchivage multiple terminé.' })
  async unarchiveTeamMembersByRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: ArchiveTeamMembersDto,
  ) {
    return this.usersService.unarchiveTeamMembersByRestaurant(
      restaurantId,
      dto.ids || [],
    );
  }

  @Put('team/:restaurantId/:memberId/status')
  @ApiOperation({ summary: "Modifier le statut d'un membre (ACTIVE/INACTIVE/ON_LEAVE)" })
  @ApiBody({ type: UpdateStaffStatusDto })
  @ApiResponse({ status: 200, description: 'Statut membre mis à jour.' })
  async updateStaffMemberStatus(
    @Param('restaurantId') restaurantId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateStaffStatusDto,
  ) {
    return this.usersService.updateStaffMemberStatus(
      restaurantId,
      memberId,
      dto.status,
    );
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Changer le mot de passe' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Mot de passe mis à jour.' })
  async changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.id, dto);
  }
}

