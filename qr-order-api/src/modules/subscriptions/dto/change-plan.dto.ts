import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePlanDto {
  @ApiProperty({ example: 'plan-uuid-123' })
  @IsString()
  @IsNotEmpty()
  newPlanId: string;
}
