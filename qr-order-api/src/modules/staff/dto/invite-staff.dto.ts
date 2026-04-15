import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';

export class InviteStaffDto {
  @ApiProperty({ example: 'staff@restaurant.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: [UserRole.STAFF], example: UserRole.STAFF })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
