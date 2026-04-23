import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StaffStatus } from '../../staff/entities/staff-member.entity';

export class UpdateStaffStatusDto {
  @ApiProperty({
    enum: StaffStatus,
    description: 'Nouveau statut du membre',
    example: StaffStatus.ACTIVE,
  })
  @IsEnum(StaffStatus)
  status: StaffStatus;
}
