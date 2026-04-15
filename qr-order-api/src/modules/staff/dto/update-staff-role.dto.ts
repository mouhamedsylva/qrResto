import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';

export class UpdateStaffRoleDto {
  @ApiProperty({ enum: [UserRole.STAFF], example: UserRole.STAFF })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
