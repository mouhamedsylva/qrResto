import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateTeamMemberRoleDto {
  @ApiProperty({
    enum: [UserRole.MANAGER, UserRole.STAFF],
    example: UserRole.MANAGER,
  })
  @IsEnum([UserRole.MANAGER, UserRole.STAFF])
  role: UserRole;
}
