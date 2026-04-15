import { PartialType } from '@nestjs/swagger';
import { CreateMenuItemDto } from './create-item.dto';

export class UpdateMenuItemDto extends PartialType(CreateMenuItemDto) {}
