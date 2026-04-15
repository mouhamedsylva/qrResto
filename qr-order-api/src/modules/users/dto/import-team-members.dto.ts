import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddTeamMemberDto } from './add-team-member.dto';

export class ImportTeamMembersDto {
  @ApiProperty({ type: [AddTeamMemberDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddTeamMemberDto)
  members: AddTeamMemberDto[];
}
