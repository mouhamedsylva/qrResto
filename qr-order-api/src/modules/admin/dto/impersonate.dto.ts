import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImpersonateDto {
  @ApiProperty({ example: 'uuid-v4-user-id' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
