import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPaymentDto {
  @ApiProperty({ example: 'pi_1234567890' })
  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;

  @ApiProperty({ example: 'pm_1234567890' })
  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;
}
