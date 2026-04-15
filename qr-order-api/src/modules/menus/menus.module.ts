import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';
import { Category } from './entities/category.entity';
import { MenuItem } from './entities/menu-item.entity';
import { MenuItemOption } from './entities/menu-item-option.entity';
import { MenuCategory } from './entities/menu-category.entity';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      MenuItem,
      MenuItemOption,
      MenuCategory,
    ]),
    AuthModule,
    StorageModule,
  ],

  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}
