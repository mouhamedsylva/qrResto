import { IsEmail, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class AddTeamMemberDto {
  @ApiProperty({ example: 'Jean Staff' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'staff@restaurant.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    enum: [UserRole.MANAGER, UserRole.STAFF],
    example: UserRole.STAFF,
    description: 'Le rôle doit être MANAGER ou STAFF',
  })
  @IsEnum([UserRole.MANAGER, UserRole.STAFF])
  role: UserRole;
}
